import { supabase } from '../utils/supabase';

/**
 * 실시간 채팅 서비스 (API_GUIDE.md 515-607 기반)
 */
export const chatService = {
  /**
   * 진행 중인 채팅방 조회 (getMyActiveChatRoom)
   */
  async getMyActiveChatRoom() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 활성 채팅방(OPEN) 조회
    const { data: matchData, error: matchError } = await supabase
      .from('tb_match')
      .select(`
        match_id,
        user_1_id,
        user_2_id,
        tb_chat_room!match_id (chat_room_id, room_status_cd)
      `)
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .eq('match_status_cd', 'ACTIVE')
      .maybeSingle();

    if (matchError) return { data: null, error: matchError };
    if (!matchData) return { data: null, error: null };

    const targetUserId = matchData.user_1_id === user.id ? matchData.user_2_id : matchData.user_1_id;
    const { data: targetUser } = await supabase
      .from('tb_user_profile')
      .select('nickname, photo_list:tb_profile_photo (storage_path)')
      .eq('user_id', targetUserId)
      .single();

    return {
      data: {
        chatRoomId: matchData.tb_chat_room?.[0]?.chat_room_id,
        matchId: matchData.match_id,
        targetUser: {
          userId: targetUserId,
          nickname: targetUser?.nickname,
          mainPhoto: targetUser?.photo_list?.[0]?.storage_path
        },
        roomStatusCd: matchData.tb_chat_room?.[0]?.room_status_cd
      },
      error: null
    };
  },

  /**
   * 채팅 메시지 목록 조회 (getChatMessages)
   */
  async getChatMessages(params: { chatRoomId: string, cursor?: string }) {
    let query = supabase
      .from('tb_chat_message')
      .select('*')
      .eq('chat_room_id', params.chatRoomId)
      .order('sent_dt', { ascending: false })
      .limit(50);

    if (params.cursor) {
      query = query.lt('sent_dt', params.cursor);
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    return {
      data: {
        messages: data,
        nextCursor: data.length > 0 ? data[data.length - 1].sent_dt : null
      },
      error: null
    };
  },

  /**
   * 메시지 전송 (sendChatMessage)
   */
  async sendChatMessage(params: { chatRoomId: string, messageText: string, messageTypeCd: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const payload = {
      chat_room_id: params.chatRoomId,
      sender_user_id: user.id,
      message_text: params.messageText,
      message_type_cd: params.messageTypeCd,
      sent_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_chat_message')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        messageId: data.chat_message_id,
        sentDt: data.sent_dt,
        sendStatus: 'SUCCESS'
      },
      error: null
    };
  },

  /**
   * 연락처 공개 요청/동의 (requestContactExchange)
   */
  async requestContactExchange(matchId: string, agreeYn: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 1. 해당 매칭의 상호동의 레코드 확인 (UPSERT)
    // user_1/user_2 구분 필요하나 우선 단순 조회-생성 loop
    const { data: exchange, error: exError } = await supabase
      .from('tb_contact_exchange')
      .select('*')
      .eq('match_id', matchId)
      .maybeSingle();

    if (exError) return { data: null, error: exError };

    const { data: match } = await supabase.from('tb_match').select('user_1_id, user_2_id').eq('match_id', matchId).single();
    const isUser1 = match?.user_1_id === user.id;

    const upsertPayload: any = {
      match_id: matchId,
      update_user: user.id
    };

    if (isUser1) {
      upsertPayload.user_1_agree_yn = agreeYn;
      upsertPayload.user_1_agree_dt = new Date().toISOString();
    } else {
      upsertPayload.user_2_agree_yn = agreeYn;
      upsertPayload.user_2_agree_dt = new Date().toISOString();
    }

    const { data: updatedEx, error: updateError } = await supabase
      .from('tb_contact_exchange')
      .upsert(upsertPayload, { onConflict: 'match_id' })
      .select()
      .single();

    if (updateError) return { data: null, error: updateError };

    const mutualAgreedYn = (updatedEx.user_1_agree_yn === 'Y' && updatedEx.user_2_agree_yn === 'Y') ? 'Y' : 'N';
    
    let targetContactInfo = null;
    if (mutualAgreedYn === 'Y') {
        const targetUserId = match?.user_1_id === user.id ? match?.user_2_id : match?.user_1_id;
        // 실제 연락처는 tb_user_auth(이메일) 등을 참조 가능 (여기선 닉네임만 예시)
        const { data: profile } = await supabase.from('tb_user_profile').select('nickname').eq('user_id', targetUserId).single();
        targetContactInfo = `카카오톡 ID 또는 전화번호: ${profile?.nickname}`; 
    }

    return {
      data: {
        mutualAgreedYn: mutualAgreedYn,
        contactVisibleYn: mutualAgreedYn,
        targetContactInfo: targetContactInfo
      },
      error: null
    };
  },

  /**
   * 채팅 종료 (endChatMatch)
   */
  async endChatMatch(matchId: string, endedReasonCd: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { error } = await supabase
      .from('tb_match')
      .update({ 
        match_status_cd: 'ENDED', 
        ended_dt: new Date().toISOString(), 
        ended_reason_cd: endedReasonCd,
        update_user: user.id 
      })
      .eq('match_id', matchId);

    if (error) return { data: null, error };

    return {
      data: {
        success: true,
        reviewRequiredYn: 'Y'
      },
      error: null
    };
  }
};
