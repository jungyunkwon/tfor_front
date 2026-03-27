<template>
  <q-page class="page bg-grey-1 q-pa-md">
    <div class="page__header flex items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">내 정보</div>
    </div>
    
    <div class="page__body full-width">
      <q-card class="card profile-card q-pa-md shadow-2">
        <div class="flex flex-center q-mb-md">
          <q-avatar size="100px" color="primary" text-color="white" icon="person" />
        </div>
        
        <div class="text-center q-mb-lg">
          <div class="text-h6 text-grey-9 text-weight-bold q-mb-xs">User-{{ authStore.userId?.substring(0, 6) || 'Guest' }}</div>
          <div class="text-body2 text-grey-6">임시 프로필 정보입니다.</div>
        </div>

        <q-separator class="q-my-md" />

        <!-- 본 레이아웃은 향후 프로필 상세 정보 조회 및 편집 창으로 확장 가능 -->
        <q-list padding class="rounded-borders">
          <q-item>
             <q-item-section>
               <q-item-label class="text-grey-7 text-caption">이메일</q-item-label>
               <q-item-label class="text-body1">-</q-item-label>
             </q-item-section>
          </q-item>
        </q-list>

        <div class="q-mt-xl">
          <q-btn 
            color="primary" 
            label="정보 저장" 
            unelevated 
            class="full-width q-py-sm"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.profile-card {
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
