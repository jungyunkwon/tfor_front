import { supabase } from '../utils/supabase';

/**
 * 매칭 및 추천 관련 서비스 (API_GUIDE.md 364-419 기반)
 */
export const matchingService = {
  /**
   * 현재 매칭 상태 조회 (getMatchingState)
   */
  async getMatchingState() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 진행 중인 매칭(ACTIVE) 조회
    const { data: matchData, error: matchError } = await supabase
      .from('tb_match')
      .select('match_id, match_status_cd, user_1_id, user_2_id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .eq('match_status_cd', 'ACTIVE')
      .maybeSingle();

    if (matchError) return { data: null, error: matchError };

    let chatRoomId = null;
    if (matchData) {
      const { data: roomData } = await supabase
        .from('tb_chat_room')
        .select('chat_room_id')
        .eq('match_id', matchData.match_id)
        .eq('room_status_cd', 'OPEN')
        .maybeSingle();
      chatRoomId = roomData?.chat_room_id;
    }

    return {
      data: {
        hasActiveMatch: !!matchData,
        matchId: matchData?.match_id,
        chatRoomId: chatRoomId,
        partnerId: matchData ? (matchData.user_1_id === user.id ? matchData.user_2_id : matchData.user_1_id) : null,
        canReceiveRecommendation: !matchData // 매칭 중이 아니면 추천 가능
      },
      error: null
    };
  },

  /**
   * 다음 추천 프로필 조회 (getNextRecommendation)
   */
  async getNextRecommendation(filters: { excludeUserIds?: string[], regionFilter?: string, ageRange?: { min: number, max: number } }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 실제 추천 logic은 서버사이드가 적합하나, SDK 예시로 구현
    // 성별이 다른(가정) 유저 중 프로필이 완료된 유저 무작위 조회
    const { data: myProfile } = await supabase.from('tb_user_profile').select('gender_cd').eq('user_id', user.id).single();
    const targetGender = myProfile?.gender_cd === 'MALE' ? 'FEMALE' : 'MALE';

    let query = supabase
      .from('tb_user_profile')
      .select(`
        user_id,
        nickname,
        birth_year,
        region_cd,
        intro_text,
        tb_profile_photo (storage_path)
      `)
      .eq('gender_cd', targetGender)
      .eq('profile_open_yn', 'Y')
      .neq('user_id', user.id)
      .limit(1);

    if (filters.excludeUserIds?.length) {
      query = query.not('user_id', 'in', `(${filters.excludeUserIds.join(',')})`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: { message: '추천 가능한 대상이 없습니다.' } };

    return {
      data: {
        recommendationUserId: data.user_id,
        profileCard: {
          nickname: data.nickname,
          age: new Date().getFullYear() - (data.birth_year || new Date().getFullYear()),
          regionCd: data.region_cd,
          introText: data.intro_text,
          mainPhoto: data.tb_profile_photo?.[0]?.storage_path
        },
        recommendationReason: '관심사가 비슷한 분이에요'
      },
      error: null
    };
  },

  /**
   * 추천 프로필 스킵 (skipRecommendation)
   */
  async skipRecommendation(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // tb_block 또는 별도 skip 테이블에 기록 가능
    // 여기선 성공 응답만 반환
    return {
      data: {
        success: true,
        nextRecommendationAvailable: true
      },
      error: null
    };
  }
};
