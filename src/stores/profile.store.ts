import { defineStore } from 'pinia';
import { profileService } from '../services/profile.service';

export const useProfileStore = defineStore('profile', {
    state: () => ({
        profile: null as any,
        isLoading: false,
    }),
    actions: {
        async loadProfile() {
            this.isLoading = true;
            const { data, error } = await profileService.getMe();
            if (data) {
                this.profile = data;
            }
            this.isLoading = false;
            return { data, error };
        },
        async updateProfile(updateData: any) {
            this.isLoading = true;
            const { data, error } = await profileService.updateMe(updateData);
            if (data) {
                this.profile = data;
            }
            this.isLoading = false;
            return { data, error };
        },
    },
});
