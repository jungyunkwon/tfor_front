<template>
  <div class="step-lifestyle q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">라이프스타일을 알려주세요</h1>
      <p class="text-grey-7">일상 패턴을 기반으로 추천합니다</p>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 평일 루틴 -->
      <section>
        <label class="section-label q-mb-md">평일 루틴 (다중 선택)</label>
        <SelectChip 
          v-model="modelValue.routines"
          :options="routineOptions"
          multiple
        />
      </section>

      <!-- 휴식 방법 -->
      <section>
        <div class="row justify-between items-center q-mb-md">
          <label class="section-label">휴식 방법</label>
          <span 
            class="text-caption"
            :class="charCount < 50 ? 'text-negative' : 'text-positive'"
          >
            {{ charCount }} / 50자 이상
          </span>
        </div>
        <q-input
          v-model="modelValue.relaxation"
          type="textarea"
          outlined
          placeholder="주말이나 여가시간에 주로 어떻게 휴식을 취하시는지 알려주세요. (평소 취미나 선호하는 휴식 환경 등)"
          rows="6"
          class="auth-input"
        />
        <p class="text-caption text-grey-6 q-mt-xs">자세한 설명은 상대방에게 신뢰감을 줍니다.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SelectChip from 'src/components/common/SelectChip.vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const routineOptions = [
  { label: '아침형 인간', value: 'EARLY_BIRD' },
  { label: '야행성', value: 'NIGHT_OWL' },
  { label: '규칙적인 식습관', value: 'REGULAR_MEAL' },
  { label: '운동 매일 함', value: 'DAILY_EXERCISE' },
  { label: '독서 즐김', value: 'READING' },
  { label: '커피 수혈 필수', value: 'COFFEE' },
  { label: '영양제 잘 챙겨 먹음', value: 'VITAMIN' },
  { label: '반려동물과 시간 보냄', value: 'PET' },
  { label: '넷플릭스 덕후', value: 'NETFLIX' },
  { label: '집바라기', value: 'HOMEBODY' }
];

const charCount = computed(() => (props.modelValue.relaxation || '').length);

const isValid = computed(() => {
  const m = props.modelValue;
  return m.routines && m.routines.length > 0 && charCount.value >= 50;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 700
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
</style>
