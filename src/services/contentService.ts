import { supabase } from '../utils/supabase';

/**
 * 운영 컨텐츠 서비스 (API_GUIDE.md 672-708 기반)
 */
export const contentService = {
  /**
   * 컨텐츠 목록 조회 (getContentList)
   */
  async getContentList(params: { page: number, pageSize: number, categoryCd?: string }) {
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    let query = supabase
      .from('tb_content')
      .select('*', { count: 'exact' })
      .eq('publish_yn', 'Y')
      .eq('del_yn', 'N')
      .order('publish_dt', { ascending: false })
      .range(from, to);

    if (params.categoryCd) {
      query = query.eq('content_type_cd', params.categoryCd);
    }

    const { data, error, count } = await query;

    if (error) return { data: null, error };

    return {
      data: {
        items: data?.map(c => ({
          contentId: c.content_id,
          title: c.title,
          createdDt: c.create_dt
        })),
        totalCount: count || 0
      },
      error: null
    };
  },

  /**
   * 컨텐츠 상세 조회 (getContentDetail)
   */
  async getContentDetail(contentId: string) {
    const { data, error } = await supabase
      .from('tb_content')
      .select('*')
      .eq('content_id', contentId)
      .eq('publish_yn', 'Y')
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        contentId: data.content_id,
        title: data.title,
        body: data.body,
        createdDt: data.create_dt
      },
      error: null
    };
  }
};
