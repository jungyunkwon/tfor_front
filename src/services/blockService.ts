import { supabase } from '../utils/supabase';

/**
 * 차단 관리 서비스 (tb_block 기반)
 * - API 정의서에 명시되지 않아 Supabase 직접 연동으로 구현
 */
export const blockService = {
  /**
   * 내 차단 목록 조회 (getMyBlockList)
   */
  async getMyBlockList() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_block')
      .select(`
        block_id,
        blocker_user_id,
        blocked_user_id,
        block_reason_cd,
        active_yn,
        create_dt
      `)
      .eq('blocker_user_id', user.id)
      .eq('active_yn', 'Y')
      .eq('del_yn', 'N')
      .order('create_dt', { ascending: false });

    if (error) return { data: null, error };

    return {
      data: {
        items: data?.map(b => ({
          blockId: b.block_id,
          blockerUserId: b.blocker_user_id,
          blockedUserId: b.blocked_user_id,
          blockReasonCd: b.block_reason_cd,
          activeYn: b.active_yn,
          createDt: b.create_dt,
        })) || []
      },
      error: null
    };
  },

  /**
   * 차단 등록 (createBlock)
   */
  async createBlock(params: { blockedUserId: string; blockReasonCd?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 자기 자신 차단 방지
    if (params.blockedUserId === user.id) {
      return { data: null, error: { message: '본인은 차단할 수 없어요.' } };
    }

    // 중복 차단 확인
    const { data: existing } = await supabase
      .from('tb_block')
      .select('block_id')
      .eq('blocker_user_id', user.id)
      .eq('blocked_user_id', params.blockedUserId)
      .eq('active_yn', 'Y')
      .maybeSingle();

    if (existing) {
      return { data: null, error: { message: '이미 차단된 사용자예요.' } };
    }

    const { data, error } = await supabase
      .from('tb_block')
      .insert({
        blocker_user_id: user.id,
        blocked_user_id: params.blockedUserId,
        block_reason_cd: params.blockReasonCd || null,
        active_yn: 'Y',
        del_yn: 'N',
        create_user: user.id,
        update_user: user.id,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return {
      data: {
        success: true,
        blockId: data.block_id,
      },
      error: null
    };
  },

  /**
   * 차단 해제 (removeBlock)
   * - active_yn = 'N' 업데이트 (소프트 해제)
   */
  async removeBlock(blockId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { error } = await supabase
      .from('tb_block')
      .update({
        active_yn: 'N',
        update_dt: new Date().toISOString(),
        update_user: user.id,
      })
      .eq('block_id', blockId)
      .eq('blocker_user_id', user.id);

    if (error) return { data: null, error };

    return { data: { success: true }, error: null };
  },
};
