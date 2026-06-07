import { supabase } from '../utils/supabase';
import { JOB_OPTIONS } from '../enums/code';

const jobNameMap = new Map(JOB_OPTIONS.map((job) => [job.code, job.name]));

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

const getJobName = (jobCode?: string | null) => {
  if (!jobCode) return null;
  return jobNameMap.get(jobCode) || jobCode;
};

const fetchProfileMap = async (userIds: string[]) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueUserIds.length === 0) return { data: new Map(), error: null };

  const [profileRes, photoRes, answerRes] = await Promise.all([
    supabase
      .from('tb_user_profile')
      .select('user_id, nickname, gender_cd, birth_year, job_name, region_cd, intro_text')
      .in('user_id', uniqueUserIds),
    supabase
      .from('tb_profile_photo')
      .select('user_id, storage_path, main_photo_yn, sort_no')
      .in('user_id', uniqueUserIds)
      .eq('visible_yn', 'Y')
      .eq('del_yn', 'N')
      .order('main_photo_yn', { ascending: false })
      .order('sort_no', { ascending: true }),
    supabase
      .from('tb_user_survey_answer')
      .select('user_id, survey_option_id, answer_text, answer_json, submitted_dt')
      .in('user_id', uniqueUserIds)
      .order('submitted_dt', { ascending: false })
  ]);

  if (profileRes.error) return { data: null, error: profileRes.error };
  if (photoRes.error) return { data: null, error: photoRes.error };
  if (answerRes.error) return { data: null, error: answerRes.error };

  const optionIds = [...new Set((answerRes.data || []).map((answer) => answer.survey_option_id).filter(Boolean))];
  const optionRes = optionIds.length > 0
    ? await supabase
        .from('tb_survey_option')
        .select('survey_option_id, option_text')
        .in('survey_option_id', optionIds)
    : { data: [], error: null };

  if (optionRes.error) return { data: null, error: optionRes.error };

  const photoMap = new Map<string, string>();
  (photoRes.data || []).forEach((photo) => {
    if (!photoMap.has(photo.user_id)) photoMap.set(photo.user_id, photo.storage_path);
  });

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
        genderCd: profile.gender_cd,
        age: getAge(profile.birth_year),
        jobName: getJobName(profile.job_name),
        regionCd: profile.region_cd,
        introText: profile.intro_text,
        mainPhoto: photoMap.get(profile.user_id) || null,
        tags: buildTagList(answerMap.get(profile.user_id) || [], optionMap)
      }
    ])
  );

  return { data: profileMap, error: null };
};

const requireUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: { message: '로그인이 필요합니다.' } };
  return { user, error: null };
};

export const selfIntroduceService = {
  async getList() {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    const { data: myProfile, error: myProfileError } = await supabase
      .from('tb_user_profile')
      .select('gender_cd')
      .eq('user_id', user.id)
      .maybeSingle();

    if (myProfileError) return { data: null, error: myProfileError };

    const targetGender = myProfile?.gender_cd === 'MALE' ? 'FEMALE' : 'MALE';
    const { data: targetProfiles, error: targetProfileError } = await supabase
      .from('tb_user_profile')
      .select('user_id')
      .eq('gender_cd', targetGender)
      .eq('profile_open_yn', 'Y')
      .neq('user_id', user.id);

    if (targetProfileError) return { data: null, error: targetProfileError };

    const targetUserIds = [user.id, ...(targetProfiles || []).map((profile) => profile.user_id)];
    if (targetUserIds.length === 0) return { data: { items: [] }, error: null };

    const { data: posts, error } = await supabase
      .from('tb_self_introduce')
      .select('id, user_id, title, content, view_count, created_at, updated_at')
      .in('user_id', targetUserIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const profileRes = await fetchProfileMap((posts || []).map((post) => post.user_id));
    if (profileRes.error) return { data: null, error: profileRes.error };

    return {
      data: {
        items: (posts || []).map((post) => ({
          id: post.id,
          userId: post.user_id,
          title: post.title,
          content: post.content,
          viewCount: post.view_count,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          profile: profileRes.data?.get(post.user_id) || null
        })).filter((item) => !!item.profile)
      },
      error: null
    };
  },

  async getDetail(id: string) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    const { data: post, error } = await supabase
      .from('tb_self_introduce')
      .select('id, user_id, title, content, view_count, created_at, updated_at')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!post) return { data: null, error: { message: '셀프 소개를 찾을 수 없습니다.' } };

    if (post.user_id !== user.id) {
      await supabase
        .from('tb_self_introduce')
        .update({ view_count: (post.view_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    const { data: comments, error: commentError } = await supabase
      .from('tb_self_introduce_comment')
      .select('id, self_introduce_id, parent_comment_id, user_id, content, created_at, updated_at')
      .eq('self_introduce_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (commentError) return { data: null, error: commentError };

    const profileRes = await fetchProfileMap([
      post.user_id,
      ...(comments || []).map((comment) => comment.user_id)
    ]);
    if (profileRes.error) return { data: null, error: profileRes.error };

    return {
      data: {
        post: {
          id: post.id,
          userId: post.user_id,
          title: post.title,
          content: post.content,
          viewCount: post.view_count,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          profile: profileRes.data?.get(post.user_id) || null,
          isMine: post.user_id === user.id
        },
        comments: (comments || []).map((comment) => ({
          id: comment.id,
          selfIntroduceId: comment.self_introduce_id,
          parentCommentId: comment.parent_comment_id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          isMine: comment.user_id === user.id,
          profile: profileRes.data?.get(comment.user_id) || null
        })),
        currentUserId: user.id
      },
      error: null
    };
  },

  async getMine(id?: string) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    let query = supabase
      .from('tb_self_introduce')
      .select('id, user_id, title, content, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    query = id ? query.eq('id', id) : query.order('created_at', { ascending: false }).limit(1);

    const { data, error } = await query.maybeSingle();
    if (error) return { data: null, error };

    return { data, error: null };
  },

  async savePost(payload: { id?: string, title: string, content: string }) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    const now = new Date().toISOString();
    const postPayload = {
      user_id: user.id,
      title: payload.title.trim(),
      content: payload.content.trim(),
      updated_at: now
    };

    const query = payload.id
      ? supabase
          .from('tb_self_introduce')
          .update(postPayload)
          .eq('id', payload.id)
          .eq('user_id', user.id)
          .select()
          .single()
      : supabase
          .from('tb_self_introduce')
          .insert(postPayload)
          .select()
          .single();

    const { data, error } = await query;
    if (error) return { data: null, error };

    return { data: { id: data.id }, error: null };
  },

  async addComment(selfIntroduceId: string, content: string, parentCommentId?: string | null) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    const { data, error } = await supabase
      .from('tb_self_introduce_comment')
      .insert({
        self_introduce_id: selfIntroduceId,
        parent_comment_id: parentCommentId || null,
        user_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  },

  async updateComment(commentId: string, content: string) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };

    const { data, error } = await supabase
      .from('tb_self_introduce_comment')
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  },

  async sendInterest(receiverUserId: string) {
    const { user, error: userError } = await requireUser();
    if (!user) return { data: null, error: userError };
    if (user.id === receiverUserId) return { data: null, error: { message: '본인에게는 관심을 보낼 수 없습니다.' } };

    const { data, error } = await supabase
      .from('tb_like')
      .insert({
        sender_user_id: user.id,
        receiver_user_id: receiverUserId,
        like_status_cd: 'SENT',
        sent_dt: new Date().toISOString(),
        expire_dt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        update_user: user.id
      })
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  }
};
