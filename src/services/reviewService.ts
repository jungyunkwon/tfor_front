import { supabase } from '../utils/supabase';

/**
 * 매칭 종료 후 평가/후기 서비스 (API_GUIDE.md 609-648 기반)
 */
export const reviewService = {
  /**
   * 평가 제출 (submitMatchReview)
   */
  async submitMatchReview(reviewParams: { matchId: string, metYn: string, contactExchangedYn: string, ratingScore: number, reviewText: string, reportYn: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data: match } = await supabase.from('tb_match').select('user_1_id, user_2_id').eq('match_id', reviewParams.matchId).single();
    const targetUserId = match?.user_1_id === user.id ? match?.user_2_id : match?.user_1_id;

    const payload = {
      match_id: reviewParams.matchId,
      writer_user_id: user.id,
      target_user_id: targetUserId,
      met_yn: reviewParams.metYn,
      contact_exchanged_yn: reviewParams.contactExchangedYn,
      manner_score: reviewParams.ratingScore,
      review_text: reviewParams.reviewText,
      report_yn: reviewParams.reportYn,
      submitted_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_match_review')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    // 매칭 테이블의 후기 완료 여부(review_completed_yn)를 업데이트 (트랜잭션 권장)
    await supabase.from('tb_match').update({ review_completed_yn: 'Y' }).eq('match_id', reviewParams.matchId);

    return {
      data: {
        success: true,
        nextMatchingEnabledYn: 'Y',
        rewardDiamond: 2
      },
      error: null
    };
  },

  /**
   * 미제출 평가 매칭 조회 (getPendingReview)
   */
  async getPendingReview() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data: matchData, error: matchError } = await supabase
      .from('tb_match')
      .select('match_id, user_1_id, user_2_id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .eq('match_status_cd', 'ENDED')
      .eq('review_completed_yn', 'N')
      .maybeSingle();

    if (matchError) return { data: null, error: matchError };
    if (!matchData) return { data: { hasPendingReview: false }, error: null };

    const targetUserId = matchData.user_1_id === user.id ? matchData.user_2_id : matchData.user_1_id;
    const { data: targetUser } = await supabase
      .from('tb_user_profile')
      .select('nickname, photo_list:tb_profile_photo (storage_path)')
      .eq('user_id', targetUserId)
      .single();

    return {
      data: {
        hasPendingReview: true,
        pendingMatchId: matchData.match_id,
        targetUserSummary: {
          nickname: targetUser?.nickname,
          mainPhoto: targetUser?.photo_list?.[0]?.storage_path
        }
      },
      error: null
    };
  }
};
