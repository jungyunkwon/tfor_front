<template>
  <q-page class="page bg-grey-1 flex flex-center">
    <div class="page__body full-width q-pa-md">
      <!-- 로딩 중 -->
      <div v-if="matchingStore.isLoading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-grey">매칭 정보를 불러오는 중입니다...</div>
      </div>

      <!-- 매칭된 유저가 없을 경우 -->
      <q-card v-else-if="!matchingStore.matchedUser" class="card empty-match-card q-pa-lg text-center shadow-2">
        <q-icon name="sentiment_dissatisfied" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-8 q-mb-sm">매칭된 유저가 없습니다</div>
        <div class="text-body2 text-grey-6 q-mb-lg">내 프로필을 매력적으로 꾸며 매칭 확률을 높여보세요!</div>
        
        <q-btn 
          color="primary" 
          icon="edit" 
          label="프로필 수정" 
          unelevated 
          class="full-width"
          @click="goToProfile" 
        />
      </q-card>

      <!-- 매칭된 유저가 있을 경우 -->
      <q-card v-else class="card match-card q-pa-md shadow-2">
        <div class="text-h6 text-primary q-mb-md">현재 매칭된 인연</div>
        <q-list bordered separator class="rounded-borders bg-white">
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="person" />
            </q-item-section>
            
            <q-item-section>
              <q-item-label lines="1">매칭 유저 ID</q-item-label>
              <q-item-label caption lines="2">{{ matchingStore.matchedUser.user_2_id }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMatchingStore } from '../stores/MatchingStore';

const router = useRouter();
const matchingStore = useMatchingStore();

const goToProfile = () => {
  router.push('/profile');
};

onMounted(() => {
  matchingStore.fetchMatchInfo();
});
</script>

<style scoped lang="scss">
.page {
  /* Quasar utility 사용 우선 적용 */
}
.empty-match-card {
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
}
.match-card {
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
}
</style>
