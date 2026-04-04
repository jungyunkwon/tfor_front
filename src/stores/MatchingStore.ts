import { defineStore } from 'pinia';
import { matchingService } from '../services/matchingService';
import { likesService } from '../services/likesService';
import { profileService } from '../services/profileService';

export type MatchStatus = 'NONE' | 'RECOMMENDED' | 'RECEIVED' | 'MATCHED';

export const useMatchingStore = defineStore('matching', {
  state: () => ({
    matchStatus: 'NONE' as MatchStatus,
    currentProfile: null as any,
    activeMatch: null as any,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchMatchState() {
      this.isLoading = true;
      this.error = null;
      try {
        // 1. 진행 중인 매칭이 있는지 확인 (MATCHED 상태)
        const { data: matchState } = await matchingService.getMatchingState();
        if (matchState?.hasActiveMatch) {
          this.matchStatus = 'MATCHED';
          this.activeMatch = matchState;
          
          // 상대방 프로필 정보 가져오기
          if (matchState.partnerId) {
            const { data: partnerProfile } = await profileService.getUserPublicProfile(matchState.partnerId);
            if (partnerProfile) {
              this.currentProfile = {
                userId: partnerProfile.targetUserId,
                ...partnerProfile,
                contactInfo: '010-XXXX-XXXX' // 실제론 match 테이블이나 별도 privacy 서비스에서 가져와야 함
              };
            }
          }
          return;
        }

        // 2. 받은 호감이 상단에 있는지 확인 (RECEIVED 상태)
        const { data: receivedLike } = await likesService.getReceivedLikeTop();
        if (receivedLike) {
          this.matchStatus = 'RECEIVED';
          this.currentProfile = {
            likeId: receivedLike.likeId,
            userId: receivedLike.senderUserId,
            ...receivedLike.senderProfile,
            age: new Date().getFullYear() - (receivedLike.senderProfile?.birth_year || new Date().getFullYear())
          };
          return;
        }

        // 3. 둘 다 없으면 추천 프로필 조회 (RECOMMENDED 상태)
        const { data: reco } = await matchingService.getNextRecommendation({});
        if (reco) {
          this.matchStatus = 'RECOMMENDED';
          this.currentProfile = {
            userId: reco.recommendationUserId,
            ...reco.profileCard
          };
        } else {
          this.matchStatus = 'NONE';
          this.currentProfile = null;
        }
      } catch (err: any) {
        this.error = '상태를 불러오는 중 오류가 발생했습니다.';
      } finally {
        this.isLoading = false;
      }
    },

    async acceptLike(likeId: string) {
      this.isLoading = true;
      const { data, error } = await likesService.acceptLike(likeId);
      if (!error && data?.success) {
        await this.fetchMatchState(); // 상태 갱신
      }
      this.isLoading = false;
      return { data, error };
    },

    async rejectLike(likeId: string, reason: string) {
      this.isLoading = true;
      const { data, error } = await likesService.rejectLike(likeId, reason);
      if (!error && data?.success) {
        await this.fetchMatchState(); // 상태 갱신
      }
      this.isLoading = false;
      return { data, error };
    },

    async sendLike(targetUserId: string) {
      this.isLoading = true;
      const { data, error } = await likesService.sendLike(targetUserId);
      if (!error && data) {
        // 호감 보낸 후 다른 추천으로 넘김
        await this.fetchMatchState();
      }
      this.isLoading = false;
      return { data, error };
    },

    async skipRecommendation(targetUserId: string) {
      this.isLoading = true;
      const { data, error } = await matchingService.skipRecommendation(targetUserId);
      if (!error && data?.success) {
        await this.fetchMatchState();
      }
      this.isLoading = false;
      return { data, error };
    }
  }
});
