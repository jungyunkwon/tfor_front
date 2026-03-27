<template>
  <q-page class="auth-page flex flex-center q-pa-md">
    <div class="login-wrapper full-width">
      <!-- Header Area -->
      <div class="text-center q-mb-xl">
        <div class="logo-placeholder q-mx-auto q-mb-md"></div>
        <h1 class="text-h4 font-weight-bold q-mb-sm text-auth-main">TFOR</h1>
        <p class="text-auth-muted">결이 맞는 사람을 만나는 가치관 기반 소개팅</p>
      </div>

      <!-- Input Area -->
      <div class="q-mb-md">
        <q-input
          v-model="localEmail"
          outlined
          placeholder="이메일을 입력하세요"
          class="auth-input full-width"
          hide-bottom-space
          @keyup.enter="onLocalLogin"
        />
      </div>

      <div class="q-mb-md">
        <q-input
          v-model="localPassword"
          outlined
          placeholder="비밀번호를 입력하세요"
          class="auth-input full-width"
          hide-bottom-space
          type="password"
          @keyup.enter="onLocalLogin"
        />
      </div>

      <!-- Login Button -->
      <div class="q-mb-md">
        <q-btn
          class="auth-btn-primary full-width q-py-md hover-scale"
          label="로그인"
          unelevated
          no-caps
          :loading="emailLoginLoading"
          :disable="!canSubmit || emailLoginLoading"
          @click="onLocalLogin"
        />
      </div>

      <!-- Signup Button -->
      <div class="q-mb-lg">
        <q-btn
          class="auth-btn-secondary full-width q-py-md hover-scale"
          label="이메일로 회원가입하기"
          unelevated
          no-caps
          :loading="signupLoading"
          :disable="!canSubmit || signupLoading"
          @click="onSignup"
        />
      </div>

      <!-- OR Divider -->
      <div class="row align-center justify-center q-my-lg relative-position">
        <q-separator class="full-width" color="grey-3" />
        <div class="or-badge bg-white text-grey-5 q-px-sm absolute-center">
          또는
        </div>
      </div>

      <!-- Social Login -->
      <SocialLoginButton
        label="카카오로 1초 시작하기"
        :loading="kakaoLoginLoading"
        @click="onKakaoLogin"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import SocialLoginButton from 'src/components/login/SocialLoginButton.vue';
import { supabase } from 'src/utils/supabase';
import { showErrorToast, showSuccessToast } from 'src/utils/notify';
import { useAuthStore } from 'src/stores/AuthStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const localEmail = ref('');
const localPassword = ref('');

const emailLoginLoading = ref(false);
const signupLoading = ref(false);
const kakaoLoginLoading = ref(false);
const errorMessage = ref('');

const canSubmit = computed(() => {
  return !!localEmail.value.trim() && !!localPassword.value.trim();
});

const moveAfterLogin = async (user = null, session = null) => {
  if (user && session) {
    authStore.setUser(user, session);
  } else {
    await authStore.initAuth();
  }

  if (authStore.isLoggedIn) {
    router.replace('/signup');
  } else {
    router.replace('/login');
  }
};

const onLocalLogin = async () => {
  if (!canSubmit.value) return;

  errorMessage.value = '';
  emailLoginLoading.value = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: localEmail.value.trim(),
      password: localPassword.value,
    });

    if (error) {
      const isInvalidCredential =
        error.status === 400 || error.status === 401;

      if (isInvalidCredential) {
        throw new Error('이메일이나 비밀번호를 확인해주세요.');
      }

      throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
    }

    if (!data?.user) {
      throw new Error('사용자 정보를 가져오지 못했습니다.');
    }

    await moveAfterLogin(data.user, data.session);
  } catch (error) {
    errorMessage.value = error?.message || '로그인 중 오류가 발생했습니다.';
    showErrorToast(errorMessage.value);
  } finally {
    emailLoginLoading.value = false;
  }
};

const onSignup = async () => {
  if (!canSubmit.value) return;

  errorMessage.value = '';
  signupLoading.value = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: localEmail.value.trim(),
      password: localPassword.value,
    });

    if (error) {
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }

    const hasSession = !!data?.session;
    const hasUser = !!data?.user;

    if (!hasUser) {
      throw new Error('회원가입 처리에 실패했습니다.');
    }

    if (!hasSession) {
      showSuccessToast('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
      router.push('/login');
      return;
    }

    showSuccessToast('회원가입이 완료되었습니다.');
    await moveAfterLogin(data.user, data.session);
  } catch (error) {
    errorMessage.value = error?.message || '회원가입 중 오류가 발생했습니다.';
    showErrorToast(errorMessage.value);
  } finally {
    signupLoading.value = false;
  }
};

const onKakaoLogin = async () => {
  try {
    errorMessage.value = '';
    kakaoLoginLoading.value = true;

    const redirectTo = `${window.location.origin}${route.path}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo,
        scopes: 'profile_nickname',
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    errorMessage.value = error?.message || '카카오 로그인 중 오류가 발생했습니다.';
    showErrorToast(errorMessage.value);
    kakaoLoginLoading.value = false;
  }
};

onMounted(async () => {
  const hasOAuthParams =
    route.query.code ||
    route.query.access_token ||
    route.query.refresh_token ||
    route.hash;

  if (hasOAuthParams) {
    const { data } = await supabase.auth.getSession();

    if (data?.session) {
      await moveAfterLogin(data.session.user, data.session);
    }
  }
});
</script>

<style lang="sass" scoped>
.login-wrapper
  max-width: 400px
  margin: 0 auto

.logo-placeholder
  width: 64px
  height: 64px
  border-radius: 16px
  background-color: var(--color-auth-border)
  display: flex
  align-items: center
  justify-content: center

.font-weight-bold
  font-weight: 700

.text-auth-main
  color: var(--color-auth-text)

.text-auth-muted
  color: var(--color-auth-text-muted)
  font-size: 0.95rem

.or-badge
  font-size: 0.8rem
</style>