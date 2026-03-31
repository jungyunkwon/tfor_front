import { supabase } from '../utils/supabase';

/**
 * 신고 서비스 (API_GUIDE.md 650-670 기반)
 */
export const reportService = {
  /**
   * 사용자 신고 등록 (submitUserReport)
   */
  async submitUserReport(params: { targetUserId: string, matchId?: string, reportTypeCd: string, reportReasonCd: string, reportText: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const payload = {
      reporter_user_id: user.id,
      target_user_id: params.targetUserId,
      match_id: params.matchId,
      report_type_cd: params.reportTypeCd,
      report_reason_cd: params.reportReasonCd,
      report_text: params.reportText,
      process_status_cd: 'PENDING',
      create_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_report')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        success: true,
        reportId: data.report_id,
        processStatusCd: data.process_status_cd
      },
      error: null
    };
  }
};
