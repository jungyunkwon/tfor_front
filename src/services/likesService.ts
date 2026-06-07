import { supabase } from '../utils/supabase';

const getAge = (birthYear?: number | null) => {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
};

const buildTagList = (answers: any[] = [], optionMap: Map<string, string>) => {
  const tags: string[] = [];

  answers.forEach((answer) => {
    if (answer.survey_option_id && optionMap.get(answer.survey_option_id)) {
      tags.push(optionMap.get(answer.survey_option_id) as string);
      return;
    }

    const jsonValue = answer.answer_json?.value;
    if (Array.isArray(jsonValue)) {
      jsonValue.forEach((value) => {
        if (value) tags.push(String(value));
      });
      return;
    }

    if (typeof answer.answer_text === 'string' && answer.answer_text.trim()) {
      tags.push(answer.answer_text.trim().split(/\s+/).slice(0, 2).join(' '));
    }
  });

  return [...new Set(tags)].slice(0, 3);
};

const fetchProfilesForLikes = async (likes: any[], userIdKey: 'sender_user_id' | 'receiver_user_id') => {
  const userIds = [...new Set((likes || []).map((like) => like[userIdKey]).filter(Boolean))];
  if (userIds.length === 0) return { data: new Map(), error: null };

  const [profileRes, answerRes] = await Promise.all([
    supabase
      .from('tb_user_profile')
      .select('user_id, nickname, birth_year, job_name, region_cd, intro_text')
      .in('user_id', userIds)
      .eq('profile_open_yn', 'Y'),
    supabase
      .from('tb_user_survey_answer')
      .select('user_id, survey_option_id, answer_text, answer_json, submitted_dt')
      .in('user_id', userIds)
      .order('submitted_dt', { ascending: false })
  ]);

  if (profileRes.error) return { data: null, error: profileRes.error };
  if (answerRes.error) return { data: null, error: answerRes.error };

  const optionIds = [...new Set((answerRes.data || []).map((answer) => answer.survey_option_id).filter(Boolean))];
  const optionRes = optionIds.length > 0
    ? await supabase
        .from('tb_survey_option')
        .select('survey_option_id, option_text')
        .in('survey_option_id', optionIds)
    : { data: [], error: null };

  if (optionRes.error) return { data: null, error: optionRes.error };

  const optionMap = new Map((optionRes.data || []).map((option) => [option.survey_option_id, option.option_text]));
  const answerMap = new Map<string, any[]>();
  (answerRes.data || []).forEach((answer) => {
    const list = answerMap.get(answer.user_id) || [];
    list.push(answer);
    answerMap.set(answer.user_id, list);
  });

  const profileMap = new Map(
    (profileRes.data || []).map((profile) => [
      profile.user_id,
      {
        userId: profile.user_id,
        nickname: profile.nickname,
        age: getAge(profile.birth_year),
        jobName: profile.job_name,
        regionCd: profile.region_cd,
        introText: profile.intro_text,
        tags: buildTagList(answerMap.get(profile.user_id) || [], optionMap)
      }
    ])
  );

  return { data: profileMap, error: null };
};

/**
 * 호감 주고 받기 서비스 (API_GUIDE.md 421-513 기반)
 */
export const likesService = {
  /**
   * 호감 보내기 (sendLike)
   */
  async sendLike(receiverUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 중복 전속 여부 확인 생략 (RLS/Unique 제약 활용 가능)
    const payload = {
      sender_user_id: user.id,
      receiver_user_id: receiverUserId,
      like_status_cd: 'SENT',
      sent_dt: new Date().toISOString(),
      expire_dt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_like')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    return { 
      data: {
        likeId: data.like_id,
        likeStatusCd: data.like_status_cd,
        expireDt: data.expire_dt
      }, 
      error: null 
    };
  },

  /**
   * 보낸 호감 목록 조회 (getSentLikeList)
   */
  async getSentLikeList(params: { page: number, pageSize: number, statusCd?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    let query = supabase
      .from('tb_like')
      .select('*', { count: 'exact' })
      .eq('sender_user_id', user.id)
      .order('sent_dt', { ascending: false })
      .range(from, to);

    if (params.statusCd) {
      query = query.eq('like_status_cd', params.statusCd);
    }

    if (params.statusCd === 'SENT') {
      query = query.gt('expire_dt', new Date().toISOString());
    }

    const { data, error, count } = await query;

    if (error) return { data: null, error };

    const receiverUserIds = [...new Set((data || []).map((like) => like.receiver_user_id).filter(Boolean))];
    const { data: receiverProfiles, error: receiverProfileError } = receiverUserIds.length > 0
      ? await supabase
          .from('tb_user_profile')
          .select('user_id, nickname, gender_cd, region_cd')
          .in('user_id', receiverUserIds)
      : { data: [], error: null };

    if (receiverProfileError) return { data: null, error: receiverProfileError };

    const receiverProfileMap = new Map(
      (receiverProfiles || []).map((profile) => [profile.user_id, profile])
    );

    return { 
      data: {
        items: (data || []).map((like) => ({
          ...like,
          receiver: receiverProfileMap.get(like.receiver_user_id) || null
        })),
        totalCount: count || 0
      }, 
      error: null 
    };
  },

  /**
   * 호감 페이지 목록 조회 (최근 7일 기준)
   */
  async getRecentLikeList(params: { direction: 'received' | 'sent', page?: number, pageSize?: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const page = params.page || 1;
    const pageSize = params.pageSize || 30;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const isReceived = params.direction === 'received';
    const ownerColumn = isReceived ? 'receiver_user_id' : 'sender_user_id';
    const targetColumn = isReceived ? 'sender_user_id' : 'receiver_user_id';

    const { data, error, count } = await supabase
      .from('tb_like')
      .select('like_id, sender_user_id, receiver_user_id, like_status_cd, sent_dt, expire_dt', { count: 'exact' })
      .eq(ownerColumn, user.id)
      .eq('like_status_cd', 'SENT')
      .gte('sent_dt', sevenDaysAgo)
      .order('sent_dt', { ascending: false })
      .range(from, to);

    if (error) return { data: null, error };

    const profileRes = await fetchProfilesForLikes(data || [], targetColumn);
    if (profileRes.error) return { data: null, error: profileRes.error };

    return {
      data: {
        items: (data || []).map((like) => ({
          likeId: like.like_id,
          senderUserId: like.sender_user_id,
          receiverUserId: like.receiver_user_id,
          likeStatusCd: like.like_status_cd,
          sentDt: like.sent_dt,
          expireDt: like.expire_dt,
          profile: profileRes.data?.get(like[targetColumn]) || null
        })).filter((item) => !!item.profile),
        totalCount: count || 0
      },
      error: null
    };
  },

  /**
   * 받은 호감 중 상단 1건만 조회 (getReceivedLikeTop)
   */
  async getReceivedLikeTop() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_like')
      .select('like_id, sender_user_id, like_status_cd')
      .eq('receiver_user_id', user.id)
      .eq('like_status_cd', 'SENT')
      .gt('expire_dt', new Date().toISOString())
      .order('sent_dt', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    const { data: senderProfile, error: senderProfileError } = await supabase
      .from('tb_user_profile')
      .select('nickname, gender_cd, birth_year, region_cd, intro_text')
      .eq('user_id', data.sender_user_id)
      .maybeSingle();

    if (senderProfileError) return { data: null, error: senderProfileError };

    return { 
      data: {
        likeId: data.like_id,
        senderUserId: data.sender_user_id,
        senderProfile,
        likeStatusCd: data.like_status_cd,
        canRespond: true
      }, 
      error: null 
    };
  },

  /**
   * 호감 수락 (acceptLike)
   */
  async acceptLike(likeId: string) {
    // 실제 구현시 보석 차감 트랜잭션 필요하므로 RPC 호출이 적합하나 예시로 작성
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 1. 호감 상태 업데이트
    const { data: like, error: likeError } = await supabase
      .from('tb_like')
      .update({ like_status_cd: 'ACCEPTED', responded_dt: new Date().toISOString(), update_user: user.id })
      .eq('like_id', likeId)
      .eq('receiver_user_id', user.id)
      .eq('like_status_cd', 'SENT')
      .select()
      .maybeSingle();

    if (likeError) return { data: null, error: likeError };
    if (!like) return { data: null, error: { message: 'No like can be accepted.' } };

    // 2. 매칭 확정 (tb_match 생성)
    const { data: match, error: matchError } = await supabase
      .from('tb_match')
      .insert({
        like_id: likeId,
        user_1_id: like.sender_user_id,
        user_2_id: user.id,
        match_type_cd: 'BASIC',
        match_status_cd: 'ACTIVE',
        matched_dt: new Date().toISOString(),
        update_user: user.id
      })
      .select()
      .single();

    if (matchError) return { data: null, error: matchError };

    return { 
      data: {
        success: true,
        matchId: match.match_id,
        deductedDiamond: 10
      }, 
      error: null 
    };
  },

  /**
   * 호감 거절 (rejectLike)
   */
  async rejectLike(likeId: string, reasonCd: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { error } = await supabase
      .from('tb_like')
      .update({ 
        like_status_cd: 'REJECTED', 
        responded_dt: new Date().toISOString(),
        update_user: user.id 
      })
      .eq('like_id', likeId)
      .eq('receiver_user_id', user.id)
      .eq('like_status_cd', 'SENT');

    return { 
      data: {
        success: !error,
        refundedYn: 'Y' // 거절시 상대방 보석 환불 대상
      }, 
      error 
    };
  }
};
