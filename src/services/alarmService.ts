import { supabase } from '../utils/supabase';

/**
 * 알림 서비스 (API_GUIDE.md 784-802 기반)
 */
export const alarmService = {
  /**
   * 내 알림 목록 조회 (getMyAlarmList)
   */
  async getMyAlarmList(params: { page: number, pageSize: number, readYn?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    let query = supabase
      .from('tb_alarm')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('del_yn', 'N')
      .order('create_dt', { ascending: false })
      .range(from, to);

    if (params.readYn) {
      query = query.eq('read_yn', params.readYn);
    }

    const { data, error, count } = await query;
    const { count: unreadCount } = await supabase
      .from('tb_alarm')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read_yn', 'N')
      .eq('del_yn', 'N');

    if (error) return { data: null, error };

    return {
      data: {
        items: data?.map(a => ({
          alarmId: a.alarm_id,
          type: a.alarm_type_cd,
          title: a.alarm_title,
          body: a.alarm_body,
          readYn: a.read_yn,
          createdAt: a.create_dt
        })),
        unreadCount: unreadCount || 0
      },
      error: null
    };
  }
};
