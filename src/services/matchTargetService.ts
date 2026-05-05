import { supabase } from '../utils/supabase';

/**
 * 사용자 매칭 기준 설정 서비스 (tb_user_match_target)
 */
export const matchTargetService = {
  /**
   * 내 매칭 기준 설정 조회
   */
  async getMyMatchTarget() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_user_match_target')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { data: null, error };
    
    return { data, error: null };
  },

  /**
   * 내 매칭 기준 설정 저장 (upsert)
   */
  async saveMyMatchTarget(targetData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const payload = {
      user_id: user.id,
      ...targetData,
      update_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_user_match_target')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return { data: null, error };

    return { 
      data: {
        success: true,
        target: data
      }, 
      error: null 
    };
  }
};
