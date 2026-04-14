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
          alarmTypeCd: a.alarm_type_cd,
          alarmTitle: a.alarm_title,
          alarmBody: a.alarm_body,
          readYn: a.read_yn,
          readDt: a.read_dt,
          movePath: a.move_path,
          relatedTableName: a.related_table_name,
          relatedId: a.related_id,
          createDt: a.create_dt
        })),
        unreadCount: unreadCount || 0
      },
      error: null
    };
  },

  /**
   * 알림 읽음 처리 (markAlarmAsRead)
   */
  async markAlarmAsRead(alarmId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_alarm')
      .update({ read_yn: 'Y', read_dt: new Date().toISOString(), update_user: user.id })
      .eq('alarm_id', alarmId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: { success: true }, error: null };
  },

  /**
   * 내 알림 설정 조회 (getMyAlarmSettings)
   * - tb_alarm_setting 에서 조회, 없으면 기본값 Y/Y/Y 반환
   */
  async getMyAlarmSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_alarm_setting')
      .select('user_id, match_alarm_yn, chat_alarm_yn, notice_alarm_yn')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { data: null, error };

    // 데이터 없으면 기본값 반환
    if (!data) {
      return {
        data: {
          user_id: user.id,
          match_alarm_yn: 'Y',
          chat_alarm_yn: 'Y',
          notice_alarm_yn: 'Y',
        },
        error: null
      };
    }

    return { data, error: null };
  },

  /**
   * 내 알림 설정 저장 (saveMyAlarmSettings)
   * - tb_alarm_setting upsert (user_id unique)
   */
  async saveMyAlarmSettings(params: {
    match_alarm_yn: 'Y' | 'N',
    chat_alarm_yn: 'Y' | 'N',
    notice_alarm_yn: 'Y' | 'N',
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const payload = {
      user_id: user.id,
      match_alarm_yn: params.match_alarm_yn,
      chat_alarm_yn: params.chat_alarm_yn,
      notice_alarm_yn: params.notice_alarm_yn,
      update_dt: new Date().toISOString(),
      update_user: user.id,
    };

    const { data, error } = await supabase
      .from('tb_alarm_setting')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        success: true,
        user_id: data.user_id,
        match_alarm_yn: data.match_alarm_yn,
        chat_alarm_yn: data.chat_alarm_yn,
        notice_alarm_yn: data.notice_alarm_yn,
      },
      error: null
    };
  }
};
