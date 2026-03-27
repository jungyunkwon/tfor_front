import { apiRequest } from './api.client';

export const profileService = {
    async getMe() {
        return apiRequest<any>('/profiles/me');
    },

    async updateMe(profileData: any) {
        return apiRequest<any>('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify({ data: profileData }),
        });
    },

    async updateSurvey(surveyData: any) {
        return apiRequest<any>('/profiles/me/survey', {
            method: 'PUT',
            body: JSON.stringify({ data: surveyData }),
        });
    },

    async updatePhotos(photoData: any) {
        return apiRequest<any>('/profiles/me/photos', {
            method: 'POST',
            body: JSON.stringify({ data: photoData }),
        });
    },
};
