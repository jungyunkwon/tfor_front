import { supabase } from '../utils/supabase';

export const signupService = {
    /**
     * 현재 사용자의 온보딩 진행 상태를 조회합니다.
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
            return {
                data: {
                    profileCompletedYn: data.profile_completed_yn || 'N',
                    surveyCompletedYn: data.survey_completed_yn || 'N',
                    photoCompletedYn: data.photo_completed_yn || 'N',
                    previewCompletedYn: data.preview_completed_yn || 'N',
                },
                error: null
            };
        }

        return { data: null, error };
    },

    /**
     * 특정 온보딩 단계의 완료 여부를 업데이트합니다.
     */
    async completeOnboardingStep(stepCode: 'PROFILE' | 'SURVEY' | 'PHOTO' | 'PREVIEW', completedYn: 'Y' | 'N') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        // stepCode에 따라 해당하는 tb_user의 컬럼 업데이트
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
            .select();

        return { data, error };
    },
};
