import { supabase } from '../utils/supabase';

/**
 * 사용자 인증 관련 서비스 (API_GUIDE.md 1-51 기반)
 */
export const authService = {
    /**
     * 현재 로그인 상태 및 온보딩 완료 여부 조회 (getAuthStatus)
     */
    async getAuthStatus() {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return { data: { isLoggedIn: false }, error: sessionError };
        }

        const user = session.user;
        const { data: userData, error: userError } = await supabase
            .from('tb_user')
            .select('user_id, profile_completed_yn, survey_completed_yn, photo_completed_yn, preview_completed_yn')
            .eq('user_id', user.id)
            .single();

        if (userError) {
            return { data: { isLoggedIn: true, userId: user.id }, error: userError };
        }

        return {
            data: {
                isLoggedIn: true,
                userId: userData.user_id,
                onboardingCompleted: 
                    userData.profile_completed_yn === 'Y' && 
                    userData.survey_completed_yn === 'Y' && 
                    userData.photo_completed_yn === 'Y' && 
                    userData.preview_completed_yn === 'Y',
                // currentMatchId 조회 logic은 필요시 추가 (tb_match 조회)
            },
            error: null
        };
    },

    /**
     * 카카오 로그인 처리 (signInWithKakao)
     * 실제로는 supabase.auth.signInWithOAuth()를 사용하거나 에지 함수를 호출할 수 있으나
     * 가이드에 따라 supabase SDK를 활용하는 방향으로 작성
     */
    async signInWithKakao(kakaoAccessToken: string) {
        // Supabase OAuth flow 호출 또는 ID Token 방식 사용 가능
        // 여기서는 가이드 구조에 맞게 세션 반환 형태 유지
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'kakao',
            token: kakaoAccessToken,
        });

        if (error) return { data: null, error };

        return {
            data: {
                accessToken: data.session?.access_token,
                refreshToken: data.session?.refresh_token,
                user: data.user,
                isNewUser: data.user?.last_sign_in_at === data.user?.created_at
            },
            error: null
        };
    },

    /**
     * 로그아웃 처리 (signOut)
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { success: !error, error };
    }
};
