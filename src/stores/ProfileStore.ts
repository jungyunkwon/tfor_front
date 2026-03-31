import { defineStore } from 'pinia';
import { profileService } from '../services/profileService';
import { surveyService } from '../services/surveyService';
import { photoService } from '../services/photoService';

export const useProfileStore = defineStore('profile', {
    state: () => ({
        profile: null as any,
        isLoading: false,
    }),
    actions: {
        async loadProfile() {
            this.isLoading = true;
            const { data, error } = await profileService.getMeProfile();
            if (data) {
                this.profile = data;
            }
            this.isLoading = false;
            return { data, error };
        },
        async updateProfile(updateData: any) {
            this.isLoading = true;
            const { data, error } = await profileService.saveMeProfile(updateData);
            if (data?.profile) {
                this.profile = data.profile;
            }
            this.isLoading = false;
            return { data, error };
        },
        async updateSurvey(surveyData: any) {
            this.isLoading = true;
            const { data, error } = await surveyService.saveSurveyAnswers(
                Array.isArray(surveyData) ? surveyData : [surveyData]
            );
            this.isLoading = false;
            return { data, error };
        },
        async updatePhotos(photoData: any) {
            this.isLoading = true;
            const { data, error } = await photoService.uploadProfilePhoto(photoData);
            this.isLoading = false;
            return { data, error };
        },
    },
});
