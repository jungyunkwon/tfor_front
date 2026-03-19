<template>
  <q-page class="auth-page flex flex-center q-pa-md">
    <div class="login-wrapper full-width">
      <!-- 기본 인증 폼 (ID 로그인) -->
      <AuthForm @submit="onLocalLogin" />

      <!-- OR 디바이더 (선택적 표시) -->
      <div class="row align-center justify-center q-my-lg relative-position">
        <q-separator class="full-width" color="grey-3" />
        <div class="or-badge bg-white text-grey-5 q-px-sm absolute-center">
          또는
        </div>
      </div>

      <!-- 소셜 로그인 폼 -->
      <SocialLoginButton
        label="카카오로 1초 시작하기"
        @click="onKakaoLogin"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import AuthForm from 'src/components/login/AuthForm.vue';
import SocialLoginButton from 'src/components/login/SocialLoginButton.vue';

const router = useRouter();

const onLocalLogin = (payload) => {
  // 일반 로그인 로직 (추후 API 연동)
  console.log('Login attempt:', payload);
  router.push('/profilevalues');
};

const onKakaoLogin = () => {
  // 소셜 로그인 로직 (Supabase Auth 연동 필요)
  // 여기서는 개발 편의를 위해 바로 온보딩으로 이동하는 것으로 스텁 처리
  router.push('/profilevalues');
};
</script>

<style lang="sass" scoped>
.login-wrapper
  max-width: 400px
  margin: 0 auto

.or-badge
  font-size: 0.8rem
</style>
