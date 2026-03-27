<template>
  <div class="step-final q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">입력하신 정보를 확인해주세요</h1>
      <p class="text-grey-7">잘못된 정보는 수정해 주세요</p>
    </div>

    <!-- 요약 리스트 -->
    <div class="summary-list q-gutter-y-md">
      <q-card flat class="glass-card q-pa-md">
        <label class="section-label">기본 정보 요약</label>
        <div class="row q-col-gutter-sm text-caption">
          <div class="col-6">닉네임: {{ summary.basic.nickname || '-' }}</div>
          <div class="col-6">지역: {{ summary.basic.region || '-' }}</div>
          <div class="col-6">출생: {{ summary.basic.birthYear }}년</div>
          <div class="col-6">키: {{ summary.basic.height }}cm</div>
        </div>
      </q-card>

      <q-card flat class="glass-card q-pa-md">
        <label class="section-label">내 라이프/스타일</label>
        <div class="row q-gutter-x-xs q-mb-sm">
          <q-chip v-for="r in summary.lifestyle.routines" :key="r" size="sm" dense outline color="primary">{{ r }}</q-chip>
        </div>
        <p class="summary-text text-grey-8">{{ summary.lifestyle.relaxation?.substring(0, 30) }}...</p>
      </q-card>

      <q-card flat class="glass-card q-pa-md">
        <label class="section-label">연애/가치관 요약</label>
        <p class="summary-text text-grey-8">표현: {{ summary.relationship.expressionWay }}</p>
        <p class="summary-text text-grey-8">결혼계획: {{ summary.values.marriagePlan }}</p>
      </q-card>
    </div>

    <!-- 약관 (Final Step) -->
    <div class="terms-section q-mt-xl">
      <q-checkbox v-model="allAgreed" label="필수 서비스 이용 약관에 모두 동의합니다" color="primary" />
      <div class="column q-ml-md q-gutter-y-xs q-mt-sm text-caption text-grey-6">
        <a href="#" @click.prevent class="text-primary decoration-none">개인정보 처리방침 보기</a>
        <a href="#" @click.prevent class="text-primary decoration-none">위치기반 서비스 약관 보기</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  summary: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const allAgreed = ref(false);

watch(allAgreed, (newVal) => {
  emit('validation', newVal);
});

// modelValue is not actually edited here, just used for props and summary
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 700
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
  margin-bottom: 8px

.summary-text
  line-height: 1.4
  font-size: 0.85rem
  margin: 0

.decoration-none
  text-decoration: none
</style>
