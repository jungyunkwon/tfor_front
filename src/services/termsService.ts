import { supabase } from '../utils/supabase';

/**
 * 약관 관련 서비스 (API_GUIDE.md 52-91 기반)
 */
export const termsService = {
    /**
     * 현재 유효한 약관 목록 조회 (getCurrentTermsList)
     */
    async getCurrentTermsList() {
        const { data, error } = await supabase
            .from('tb_terms')
            .select('terms_id, terms_type_cd, terms_title, terms_version, required_yn')
            .eq('current_yn', 'Y')
            .eq('del_yn', 'N')
            .order('create_dt', { ascending: false });

        if (error) return { data: null, error };

        return {
            data: {
                termsList: data.map(t => ({
                    termsId: t.terms_id,
                    termsTypeCd: t.terms_type_cd,
                    title: t.terms_title,
                    version: t.terms_version,
                    requiredYn: t.required_yn
                }))
            },
            error: null
        };
    },

    /**
     * 사용자 약관 동의 이력 저장 (agreeTerms)
     */
    async agreeTerms(params: { agreements: { termsId: string, agreedYn: string }[], ipAddress: string, userAgent: string }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const payload = params.agreements.map(a => ({
            user_id: user.id,
            terms_id: a.termsId,
            agreed_yn: a.agreedYn,
            agreed_dt: new Date().toISOString(),
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
            update_user: user.id
        }));

        const { data, error } = await supabase
            .from('tb_user_terms_agreement')
            .upsert(payload, { onConflict: 'user_id,terms_id' })
            .select();

        if (error) return { data: null, error };

        return {
            data: {
                success: true,
                agreedCount: data?.length || 0
            },
            error: null
        };
    }
};
