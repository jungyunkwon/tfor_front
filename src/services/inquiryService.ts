import { supabase } from '../utils/supabase';

/**
 * 1:1 문의 서비스 (API_GUIDE.md 710-745 기반)
 */
export const inquiryService = {
  /**
   * 문의 등록 (createInquiry)
   */
  async createInquiry(params: { inquiryTypeCd: string, title: string, content: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const payload = {
      user_id: user.id,
      inquiry_type_cd: params.inquiryTypeCd,
      title: params.title,
      content: params.content,
      inquiry_status_cd: 'RECEIVED',
      create_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_inquiry')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        inquiryId: data.inquiry_id,
        success: true
      },
      error: null
    };
  },

  /**
   * 내 문의 내역 및 답변 조회 (getMyInquiryList)
   */
  async getMyInquiryList(params: { page: number, pageSize: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    const { data, error, count } = await supabase
      .from('tb_inquiry')
      .select(`
        *,
        tb_inquiry_answer!inquiry_id (answer_content, answered_dt)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('create_dt', { ascending: false })
      .range(from, to);

    if (error) return { data: null, error };

    return {
      data: {
        items: data?.map(i => ({
          inquiryId: i.inquiry_id,
          title: i.title,
          content: i.content,
          statusCd: i.inquiry_status_cd,
          answer: i.tb_inquiry_answer?.[0]
        })),
        totalCount: count || 0
      },
      error: null
    };
  }
};
