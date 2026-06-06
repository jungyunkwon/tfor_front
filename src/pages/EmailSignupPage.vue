<template>
  <q-page class="auth-page flex flex-center q-pa-md">
    <div class="signup-wrapper full-width">
      <div class="text-center q-mb-xl">
        <div class="logo-placeholder q-mx-auto q-mb-md"></div>
        <h1 class="text-h4 font-weight-bold q-mb-sm text-auth-main">TFOR</h1>
        <p class="text-auth-muted">이메일로 회원가입하기</p>
      </div>

      <div class="q-mb-md">
        <q-input
          v-model="email"
          outlined
          placeholder="이메일을 입력하세요"
          class="auth-input full-width"
          hide-bottom-space
          @keyup.enter="onSignup"
        />
      </div>

      <div class="q-mb-md">
        <q-input
          v-model="password"
          outlined
          placeholder="비밀번호를 입력하세요"
          class="auth-input full-width"
          hide-bottom-space
          type="password"
          @keyup.enter="onSignup"
        />
      </div>

      <div class="terms-box q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-bold">회원가입 동의</div>
          <q-checkbox v-model="allAgreed" dense label="전체 동의" />
        </div>

        <q-inner-loading :showing="termsLoading">
          <q-spinner-dots color="primary" size="28px" />
        </q-inner-loading>

        <div v-if="!termsLoading && termsList.length === 0" class="text-caption text-grey-6">
          현재 표시할 약관이 없습니다.
        </div>

        <q-card
          v-for="term in termsList"
          :key="term.termsId"
          flat
          bordered
          class="terms-card q-mb-sm"
        >
          <div class="row items-center no-wrap q-pa-sm">
            <q-checkbox
              v-model="agreementMap[term.termsId]"
              dense
              :label="`${term.requiredYn === 'Y' ? '[필수]' : '[선택]'} ${term.title}`"
              class="col"
            />
            <q-btn
              flat
              dense
              round
              size="sm"
              :icon="expandedMap[term.termsId] ? 'expand_less' : 'expand_more'"
              @click="onToggleExpand(term.termsId)"
            />
          </div>
          <q-slide-transition>
            <div v-show="expandedMap[term.termsId]" class="terms-content text-caption text-grey-7 q-pa-sm">
              {{ term.content || '약관 내용이 등록되어 있지 않습니다.' }}
            </div>
          </q-slide-transition>
        </q-card>
      </div>

      <div class="q-mb-md">
        <q-btn
          class="auth-btn-primary full-width q-py-md hover-scale"
          label="기본정보 입력하러가기"
          unelevated
          no-caps
          :loading="signupLoading"
          :disable="signupLoading"
          @click="onSignup"
        />
      </div>

      <q-btn
        flat
        class="full-width"
        label="로그인으로 돌아가기"
        no-caps
        @click="router.push('/auth/login')"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { supabase } from 'src/utils/supabase';
import { showErrorToast, showSuccessToast } from 'src/utils/notify';
import { useAuthStore } from 'src/stores/AuthStore';
import { signupService } from 'src/services/signupService';
import { termsService } from 'src/services/termsService';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const signupLoading = ref(false);
const termsLoading = ref(false);
const termsList = ref([]);
const agreementMap = reactive({});
const expandedMap = reactive({});

const allAgreed = computed({
  get: () => termsList.value.length > 0 && termsList.value.every(t => !!agreementMap[t.termsId]),
  set: (val) => termsList.value.forEach(t => { agreementMap[t.termsId] = val; })
});

const isRequiredAllAgreed = computed(() =>
  termsList.value
    .filter(t => t.requiredYn === 'Y')
    .every(t => !!agreementMap[t.termsId])
);

const onToggleExpand = (termsId) => {
  expandedMap[termsId] = !expandedMap[termsId];
};

const isSignupTerm = (term) => {
  const type = String(term.termsTypeCd || '').toUpperCase();
  const title = String(term.title || '');

  return (
    type.includes('PRIVACY') ||
    type.includes('PERSONAL') ||
    type.includes('MARKETING') ||
    type.includes('MKT') ||
    title.includes('개인정보') ||
    title.includes('마케팅')
  );
};

const sortSignupTerms = (a, b) => {
  const aTitle = String(a.title || '');
  const bTitle = String(b.title || '');
  const aType = String(a.termsTypeCd || '').toUpperCase();
  const bType = String(b.termsTypeCd || '').toUpperCase();
  const rank = (title, type) => {
    if (type.includes('PRIVACY') || type.includes('PERSONAL') || title.includes('개인정보')) return 1;
    if (type.includes('MARKETING') || type.includes('MKT') || title.includes('마케팅')) return 2;
    return 3;
  };

  return rank(aTitle, aType) - rank(bTitle, bType);
};

const buildAgreements = () => termsList.value.map(t => ({
  termsId: t.termsId,
  agreedYn: agreementMap[t.termsId] ? 'Y' : 'N'
}));

const fetchTerms = async () => {
  termsLoading.value = true;
  try {
    const { data, error } = await termsService.getCurrentTermsList();
    if (error) throw error;

    termsList.value = (data?.termsList || [])
      .filter(isSignupTerm)
      .sort(sortSignupTerms);

    termsList.value.forEach(t => {
      agreementMap[t.termsId] = false;
      expandedMap[t.termsId] = true;
    });
  } catch (error) {
    showErrorToast(error?.message || '약관 정보를 불러오지 못했어요.');
  } finally {
    termsLoading.value = false;
  }
};

const moveAfterSignup = async (user, session) => {
  await authStore.setUser(user, session);

  const { error } = await signupService.initializeUser();
  if (error) {
    throw new Error(error.message || 'User initialization failed.');
  }

  const termsResult = await termsService.agreeTerms({
    agreements: buildAgreements(),
    ipAddress: '',
    userAgent: navigator.userAgent,
  });
  if (termsResult.error) {
    throw new Error(termsResult.error.message || 'Terms agreement failed.');
  }

  await authStore.checkOnboardingStatus();
  router.replace('/signup');
};

const onSignup = async () => {
  if (!email.value.trim()) {
    showErrorToast('이메일을 입력해 주세요.');
    return;
  }

  if (!password.value) {
    showErrorToast('비밀번호를 입력해 주세요.');
    return;
  }

  if (termsList.value.length === 0) {
    showErrorToast('약관 정보를 불러오지 못했습니다.');
    return;
  }

  if (!isRequiredAllAgreed.value) {
    showErrorToast('필수 약관에 동의해 주세요.');
    return;
  }

  signupLoading.value = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
    });

    if (error) {
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }

    if (!data?.user) {
      throw new Error('회원가입 처리에 실패했습니다.');
    }

    if (!data?.session) {
      showSuccessToast('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
      router.replace('/auth/login');
      return;
    }

    showSuccessToast('회원가입이 완료되었습니다.');
    await moveAfterSignup(data.user, data.session);
  } catch (error) {
    showErrorToast(error?.message || '회원가입 중 오류가 발생했습니다.');
  } finally {
    signupLoading.value = false;
  }
};

onMounted(() => {
  fetchTerms();
});
</script>

<style lang="sass" scoped>
.signup-wrapper
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

.terms-box
  position: relative
  border: 1px solid var(--color-auth-border)
  border-radius: 12px
  padding: 14px
  min-height: 96px

.terms-card
  border-radius: 8px

.terms-content
  background: rgba(0, 0, 0, 0.03)
  border-top: 1px solid rgba(0, 0, 0, 0.06)
  white-space: pre-wrap
</style>
