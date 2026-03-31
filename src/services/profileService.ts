import { supabase } from '../utils/supabase';

/**
 * TB_USER_PROFILE 데이터를 처리하는 서비스 (API_GUIDE.md 131-229 기반)
 */
export const profileService = {
    /**
     * 내 프로필 정보 조회 (getMeProfile)
     */
    async getMeProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const { data, error } = await supabase
            .from('tb_user_profile')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) return { data: null, error };
        
        if (data) {
            return {
                data: {
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
                },
                error: null
            };
        }

        return { data: null, error: null };
    },

    /**
     * 프로필 저장/수정 (saveMeProfile)
     */
    async saveMeProfile(profileData: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

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

        if (error) return { data: null, error };

        return { 
            data: {
                success: true,
                profile: data
            }, 
            error: null 
        };
    },

    /**
     * 미리보기 화면용 프로필 데이터 조회 (getProfilePreview)
     */
    async getProfilePreview() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

        const [profileRes, photoRes, surveyRes] = await Promise.all([
            supabase.from('tb_user_profile').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('tb_profile_photo').select('*').eq('user_id', user.id).eq('main_photo_yn', 'Y').maybeSingle(),
            supabase.from('tb_user_survey_answer').select('*').eq('user_id', user.id)
        ]);

        return {
            data: {
                profileSummary: profileRes.data,
                mainPhoto: photoRes.data,
                surveySummary: surveyRes.data
            },
            error: profileRes.error || photoRes.error || surveyRes.error
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

        if (error) return { data: null, error };

        // 추가 사진/설문 결합 logic
        const [photoRes, surveyRes] = await Promise.all([
            supabase.from('tb_profile_photo').select('*').eq('user_id', targetUserId).eq('visible_yn', 'Y'),
            supabase.from('tb_user_survey_answer').select('*').eq('user_id', targetUserId)
        ]);

        return { 
            data: {
                targetUserId: data.user_id,
                nickname: data.nickname,
                age: new Date().getFullYear() - (data.birth_year || new Date().getFullYear()),
                regionCd: data.region_cd,
                introText: data.intro_text,
                photoList: photoRes.data,
                surveySummary: surveyRes.data
            }, 
            error: null 
        };
    }
};
