import { supabase } from '../utils/supabase';

/**
 * 온보딩 / 가입 프로세스 관리 (API_GUIDE.md 92-129 기반)
 */
export const signupService = {
    /**
     * 현재 사용자의 온보딩 진행 상태를 조회합니다. (getOnboardingStatus)
     * TB_USER (1-1)의 profile_completed_yn 등을 확인합니다.
     */
    async getOnboardingStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const { data, error } = await supabase
            .from('tb_user')
            .select('profile_completed_yn, survey_completed_yn, photo_completed_yn, preview_completed_yn')
            .eq('user_id', user.id)
            .single();

        if (data) {
            // 가이드 응답 명세 준수: nextStep 판단 로직 추가 가능
            let nextStep = 'PROFILE';
            if (data.profile_completed_yn === 'N') nextStep = 'PROFILE';
            else if (data.survey_completed_yn === 'N') nextStep = 'SURVEY';
            else if (data.photo_completed_yn === 'N') nextStep = 'PHOTO';
            else if (data.preview_completed_yn === 'N') nextStep = 'PREVIEW';
            else nextStep = 'DONE';

            return {
                data: {
                    profileCompletedYn: data.profile_completed_yn || 'N',
                    surveyCompletedYn: data.survey_completed_yn || 'N',
                    photoCompletedYn: data.photo_completed_yn || 'N',
                    previewCompletedYn: data.preview_completed_yn || 'N',
                    nextStep: nextStep
                },
                error: null
            };
        }

        return { data: null, error };
    },

    /**
     * 특정 온보딩 단계의 완료 여부를 업데이트합니다. (completeOnboardingStep)
     */
    async completeOnboardingStep(stepCode: 'PROFILE' | 'SURVEY' | 'PHOTO' | 'PREVIEW', completedYn: 'Y' | 'N') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const updateMap: Record<string, string> = {
            PROFILE: 'profile_completed_yn',
            SURVEY: 'survey_completed_yn',
            PHOTO: 'photo_completed_yn',
            PREVIEW: 'preview_completed_yn',
        };

        const columnName = updateMap[stepCode];
        if (!columnName) return { data: null, error: { message: '잘못된 단계 코드입니다.' } };

        const { data, error } = await supabase
            .from('tb_user')
            .update({ 
                [columnName]: completedYn,
                update_dt: new Date().toISOString(),
                update_user: user.id
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) return { data: null, error };

        return { 
            data: {
                success: true,
                nextStep: stepCode === 'PROFILE' ? 'SURVEY' : stepCode === 'SURVEY' ? 'PHOTO' : stepCode === 'PHOTO' ? 'PREVIEW' : 'DONE'
            }, 
            error: null 
        };
    },

    /**
     * 사용자의 기본 레코드를 tb_user에 생성합니다. (initializeUser)
     * 이미 존재하는 경우 무시합니다 (upsert).
     */
    async initializeUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const { data, error } = await supabase
            .from('tb_user')
            .upsert({
                user_id: user.id,
                user_status_cd: 'ACTIVE',
                join_type_cd: 'KAKAO', // 기본값, 실제론 가입 경로에 따라 달라질 수 있음
                profile_completed_yn: 'N',
                survey_completed_yn: 'N',
                photo_completed_yn: 'N',
                preview_completed_yn: 'N',
                matching_locked_yn: 'N',
                del_yn: 'N',
                update_user: user.id
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) return { data, error };

        // tb_user_balance 초기화 (없을 경우에만)
        const { data: balanceData } = await supabase
            .from('tb_user_balance')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!balanceData) {
            await supabase.from('tb_user_balance').insert({
                user_id: user.id,
                balance_amount: 10, // 신규 가입 보너스 10개 예시
                update_user: user.id
            });
        }

        return { data, error };
    }
};
