import { defineStore } from 'pinia';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './AuthStore';

interface MatchInfo {
  id?: string;
  user_1_id: string;
  user_2_id: string;
  [key: string]: any;
}

export const useMatchingStore = defineStore('matching', {
  state: () => ({
    matchedUser: null as MatchInfo | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchMatchInfo() {
      const authStore = useAuthStore();

      // 유저 id가 없으면 조회를 시도하지 않음
      if (!authStore.userId) {
        this.matchedUser = null;
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from('tb_matches')
          .select('*')
          .eq('user_1_id', authStore.userId)
          .single(); // 매칭이 하나만 있다고 가정

        if (error) {
          if (error.code === 'PGRST116') {
            // 데이터가 없는 경우 (0 rows)
            this.matchedUser = null;
          } else {
            console.error('Error fetching match info:', error.message);
            this.error = error.message;
            this.matchedUser = null;
          }
        } else {
          this.matchedUser = data;
        }
      } catch (err: any) {
        console.error('Unexpected error during match fetch:', err);
        this.error = '네트워크 오류가 발생했습니다.';
        this.matchedUser = null;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
