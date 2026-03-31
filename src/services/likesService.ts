import { supabase } from '../utils/supabase';

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
      .select(`
        *,
        receiver:tb_user_profile!receiver_user_id (nickname, gender_cd, region_cd)
      `, { count: 'exact' })
      .eq('sender_user_id', user.id)
      .order('sent_dt', { ascending: false })
      .range(from, to);

    if (params.statusCd) {
      query = query.eq('like_status_cd', params.statusCd);
    }

    const { data, error, count } = await query;

    if (error) return { data: null, error };

    return { 
      data: {
        items: data,
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
      .select(`
        like_id,
        sender_user_id,
        like_status_cd,
        sender:tb_user_profile!sender_user_id (nickname, gender_cd, birth_year, region_cd, intro_text)
      `)
      .eq('receiver_user_id', user.id)
      .eq('like_status_cd', 'SENT')
      .order('sent_dt', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return { 
      data: {
        likeId: data.like_id,
        senderUserId: data.sender_user_id,
        senderProfile: data.sender,
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
      .select()
      .single();

    if (likeError) return { data: null, error: likeError };

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

    // 3. 채팅방 생성
    const { data: room, error: roomError } = await supabase
      .from('tb_chat_room')
      .insert({
        match_id: match.match_id,
        room_status_cd: 'OPEN',
        opened_dt: new Date().toISOString(),
        update_user: user.id
      })
      .select()
      .single();

    if (roomError) return { data: null, error: roomError };

    return { 
      data: {
        success: true,
        matchId: match.match_id,
        chatRoomId: room.chat_room_id,
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
      .eq('receiver_user_id', user.id);

    return { 
      data: {
        success: !error,
        refundedYn: 'Y' // 거절시 상대방 보석 환불 대상
      }, 
      error 
    };
  }
};
