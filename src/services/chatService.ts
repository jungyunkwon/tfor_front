import { supabase } from '../utils/supabase';

/**
 * 매칭 후속 처리 서비스 (API_GUIDE.md 515-607 기반)
 */
export const chatService = {
  /**
   * 진행 중인 매칭 조회 (getMyActiveMatchInfo)
   */
  async getMyActiveMatchInfo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 활성 매칭(ACTIVE) 조회
    const { data: matchData, error: matchError } = await supabase
      .from('tb_match')
      .select('match_id, user_1_id, user_2_id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .eq('match_status_cd', 'ACTIVE')
      .maybeSingle();

    if (matchError) return { data: null, error: matchError };
    if (!matchData) return { data: null, error: null };

    const targetUserId = matchData.user_1_id === user.id ? matchData.user_2_id : matchData.user_1_id;
    const { data: targetUser } = await supabase
      .from('tb_user_profile')
      .select('nickname')
      .eq('user_id', targetUserId)
      .single();

    const { data: mainPhoto, error: photoError } = await supabase
      .from('tb_profile_photo')
      .select('storage_path')
      .eq('user_id', targetUserId)
      .eq('visible_yn', 'Y')
      .eq('del_yn', 'N')
      .order('main_photo_yn', { ascending: false })
      .order('sort_no', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (photoError) return { data: null, error: photoError };

    return {
      data: {
        matchId: matchData.match_id,
        targetUser: {
          userId: targetUserId,
          nickname: targetUser?.nickname,
          mainPhoto: mainPhoto?.storage_path
        }
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
        contactVisibleYn: mutualAgreedYn === 'Y',
        targetContactInfo: targetContactInfo
      },
      error: null
    };
  },

  /**
   * 연락처 공개 상태 조회 (getContactExchangeStatus)
   */
  async getContactExchangeStatus(matchId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data: exchange, error: exError } = await supabase
      .from('tb_contact_exchange')
      .select('*')
      .eq('match_id', matchId)
      .maybeSingle();

    if (exError || !exchange) return { data: null, error: exError };

    const mutualAgreedYn = (exchange.user_1_agree_yn === 'Y' && exchange.user_2_agree_yn === 'Y') ? 'Y' : 'N';
    
    let targetContactInfo = null;
    if (mutualAgreedYn === 'Y') {
        const { data: match } = await supabase.from('tb_match').select('user_1_id, user_2_id').eq('match_id', matchId).single();
        const targetUserId = match?.user_1_id === user.id ? match?.user_2_id : match?.user_1_id;
        const { data: profile } = await supabase.from('tb_user_profile').select('nickname').eq('user_id', targetUserId).single();
        targetContactInfo = `카카오톡 ID 또는 전화번호: ${profile?.nickname}`; 
    }

    return {
      data: {
        mutualAgreedYn: mutualAgreedYn,
        contactVisibleYn: mutualAgreedYn === 'Y',
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

    const { data, error } = await supabase
      .from('tb_match')
      .update({ 
        match_status_cd: 'ENDED', 
        ended_dt: new Date().toISOString(), 
        ended_reason_cd: endedReasonCd,
        update_user: user.id 
      })
      .eq('match_id', matchId)
      .eq('match_status_cd', 'ACTIVE')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .select('match_id')
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: { message: 'No active match can be ended.' } };

    return {
      data: {
        success: true,
        reviewRequiredYn: 'Y'
      },
      error: null
    };
  }
};
