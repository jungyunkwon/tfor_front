<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <h1 class="text-h3 q-mb-md">TFOR</h1>
      <p class="text-subtitle1 q-mb-xl">진정한 나를 찾는 가치관 매칭</p>
      <q-btn
        color="yellow-9"
        label="카카오로 1초 시작하기"
        class="full-width q-py-md"
        unelevated
        @click="onLogin"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const onLogin = () => {
  // 실제 소셜 로그인 로직 (Supabase Auth 연동 필요)
  // 여기서는 개발 편의를 위해 바로 온보딩으로 이동하는 것으로 스텁 처리
  router.push('/profilevalues');
};
</script>
