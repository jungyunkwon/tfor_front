<template>
  <div class="auth-form-container full-width">
    <!-- Header Area -->
    <div class="text-center q-mb-xl">
      <div class="logo-placeholder q-mx-auto q-mb-md"></div>
      <h1 class="text-h4 font-weight-bold q-mb-sm text-auth-main">TFOR</h1>
      <p class="text-auth-muted">진정한 나를 찾는 가치관 매칭</p>
    </div>

    <!-- Input Area -->
    <div class="q-mb-md">
      <q-input
        v-model="localUsername"
        outlined
        placeholder="아이디를 입력하세요"
        class="auth-input full-width"
        hide-bottom-space
      />
    </div>

    <!-- Login Button -->
    <div class="q-mb-lg">
      <q-btn
        class="auth-btn-primary full-width q-py-md hover-scale"
        label="로그인"
        unelevated
        no-caps
        @click="onSubmit"
        :disable="!localUsername"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);

const localUsername = ref('');

const onSubmit = () => {
  if (localUsername.value) {
    emit('submit', { username: localUsername.value });
  }
};
</script>

<style lang="sass" scoped>
.auth-form-container
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
</style>
