import { supabase } from '../utils/supabase';

/**
 * TB_USER_PROFILE 데이터를 처리하는 서비스 (API_GUIDE.md 131-229 기반)
 */
export const profileService = {
    /**
     * 내 프로필 정보 조회 (getMeProfile)
     * TB_USER_PROFILE (2-3) 테이블 조회
     */
    async getMeProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const { data, error } = await supabase
            .from('tb_user_profile')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // 변환: snake_case -> camelCase (API_GUIDE 응답 규격 준수)
        if (data) {
            const mapped = {
                userProfileId: data.user_profile_id,
                nickname: data.nickname,
                genderCd: data.gender_cd,
                birthYear: data.birth_year,
                heightCm: data.height_cm,
                jobName: data.job_name,
                educationLevelCd: data.education_level_cd,
                regionCd: data.region_cd,
                introText: data.intro_text,
                smokingYn: data.smoking_yn,
                drinkingCd: data.drinking_cd,
                religionCd: data.religion_cd,
                maritalStatusCd: data.marital_status_cd,
                childrenYn: data.children_yn,
                profileOpenYn: data.profile_open_yn
            };
            return { data: mapped, error: null };
        }

        return { data: null, error };
    },

    /**
     * 프로필 저장/수정 (saveMeProfile)
     * TB_USER_PROFILE (2-3) 테이블 UPSERT
     */
    async saveMeProfile(profileData: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        // 변환: camelCase -> snake_case (TABLE_INFORMATION 규격 준수)
        const payload = {
            user_id: user.id,
            nickname: profileData.nickname,
            gender_cd: profileData.genderCd,
            birth_year: profileData.birthYear,
            height_cm: profileData.heightCm,
            job_name: profileData.jobName,
            education_level_cd: profileData.educationLevelCd,
            region_cd: profileData.regionCd,
            intro_text: profileData.introText || '',
            smoking_yn: profileData.smokingYn,
            drinking_cd: profileData.drinkingCd,
            religion_cd: profileData.religionCd,
            marital_status_cd: profileData.maritalStatusCd || 'SINGLE',
            children_yn: profileData.childrenYn || 'N',
            profile_open_yn: profileData.profileOpenYn || 'Y',
            update_dt: new Date().toISOString(),
            update_user: user.id
        };

        const { data, error } = await supabase
            .from('tb_user_profile')
            .upsert(payload, { onConflict: 'user_id' })
            .select()
            .single();

        return { data, error };
    },

    /**
     * 미리보기 화면용 프로필 데이터 조회 (getProfilePreview)
     */
    async getProfilePreview() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        // tb_user_profile + tb_profile_photo + tb_user_survey_answer 조회 (실제로는 정교한 쿼리 필요)
        const { data: profile } = await supabase.from('tb_user_profile').select('*').eq('user_id', user.id).single();
        const { data: photo } = await supabase.from('tb_profile_photo').select('*').eq('user_id', user.id).eq('main_photo_yn', 'Y').maybeSingle();
        const { data: survey } = await supabase.from('tb_user_survey_answer').select('*').eq('user_id', user.id);

        return {
            data: {
                profileSummary: profile,
                mainPhoto: photo,
                surveySummary: survey
            },
            error: null
        };
    },

    /**
     * 상대 프로필 열람 (getUserPublicProfile)
     */
    async getUserPublicProfile(targetUserId: string) {
        const { data, error } = await supabase
            .from('tb_user_profile')
            .select('user_id, nickname, birth_year, region_cd, intro_text')
            .eq('user_id', targetUserId)
            .eq('profile_open_yn', 'Y')
            .single();

        // 추가 사진/설문 결합 로직 필요
        return { data, error };
    }
};
