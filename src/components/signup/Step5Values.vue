<template>
  <div class="step-values q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">가치관과 커리어</h1>
      <p class="text-grey-7">미래를 함께할 파트너를 위해</p>
    </div>

    <div class="column q-gutter-y-xl">
      <!-- 현재 하는 일 -->
      <section>
        <label class="section-label q-mb-xs">현재 하고 있는 일</label>
        <q-input 
          v-model="modelValue.currentJobDetail" 
          outlined 
          dense 
          placeholder="어떤 분야에서 어떤 일을 하는지 구체적으로 적어주세요"
        />
      </section>

      <!-- 커리어 목표 & 계획 -->
      <section>
        <label class="section-label q-mb-xs">커리어 목표</label>
        <q-input 
          v-model="modelValue.careerGoal" 
          type="textarea"
          outlined 
          rows="3"
          placeholder="본인의 커리어에 대한 열정이나 지향하는 목표"
        />
      </section>

      <section>
        <label class="section-label q-mb-xs">3~5년 후의 미래 계획</label>
        <q-input 
          v-model="modelValue.futurePlan" 
          type="textarea"
          outlined 
          rows="3"
          placeholder="어떤 모습으로 성장해 있고 싶으신가요?"
        />
      </section>

      <!-- 결혼/자녀 계획 -->
      <section>
        <label class="section-label q-mb-md">결혼 및 자녀 계획</label>
        <RadioCard 
          v-model="modelValue.marriagePlan"
          :options="marriageOptions"
        />
      </section>

      <!-- 소비 성향 -->
      <section>
        <label class="section-label q-mb-md">소비 성향</label>
        <RadioCard 
          v-model="modelValue.spendingHabit"
          :options="spendingOptions"
        />
      </section>

      <!-- 재테크 여부 -->
      <section>
        <label class="section-label q-mb-md">재테크(주식, 코인, 부동산 등)에 대한 생각</label>
        <RadioCard 
          v-model="modelValue.investment"
          :options="investmentOptions"
        />
      </section>

      <!-- 부모 갈등 / 집안 분위기 -->
      <section>
        <label class="section-label q-mb-md">본인이 자란 집안 분위기</label>
        <RadioCard 
          v-model="modelValue.familyAtmosphere"
          :options="familyOptions"
        />
      </section>

      <section>
        <label class="section-label q-mb-md">부모님과의 갈등 경험</label>
        <RadioCard 
          v-model="modelValue.parentConflict"
          :options="conflictOptions"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import RadioCard from 'src/components/common/RadioCard.vue';
import { SALARY_BEHAVIOR_OPTIONS } from 'src/enums/code';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const marriageOptions = [
  { label: '딩크족 선호', value: 'DINK' },
  { label: '아이 1명은 낳고 싶어', value: 'ONE_CHILD' },
  { label: '다자녀가 좋아', value: 'MULTIPLE_CHILDREN' },
  { label: '아직은 잘 모르겠어', value: 'NOT_DECIDED' }
];

const spendingOptions = SALARY_BEHAVIOR_OPTIONS.map(o => ({ label: o.name, value: o.code }));

const investmentOptions = [
  { label: '적극적으로 투자하는 편', value: 'AGGRESSIVE', description: '주식, 코인 등 높은 수익률 추구' },
  { label: '안정적인 예적금이 최고', value: 'CONSERVATIVE', description: '원금 손실이 없는 방식 선호' },
  { label: '관심은 있지만 공부 중', value: 'LEARNING' },
  { label: '전혀 관심 없음', value: 'NONE' }
];

const familyOptions = [
  { label: '화목하고 대화가 많은 편', value: 'HARMONIOUS' },
  { label: '다소 엄해고 유교적인 분위기', value: 'STRICT' },
  { label: '각자의 생활을 존중하는 편', value: 'INDEPENDENT' },
  { label: '다소 조용한 분위기', value: 'QUIET' }
];

const conflictOptions = [
  { label: '거의 갈등 없이 원만하게 지냄', value: 'GOOD' },
  { label: '가끔 의견 차이가 있었지만 해결함', value: 'NORMAL' },
  { label: '독립적인 가치관으로 다소 부딪힘', value: 'INDEPENDENT_ संघर्ष' },
  { label: '말 못 할 아픔이나 깊은 갈등이 있음', value: 'DEEP' }
];

const isValid = computed(() => {
  const m = props.modelValue;
  return !!(
    m.currentJobDetail && 
    m.careerGoal && 
    m.futurePlan && 
    m.marriagePlan && 
    m.spendingHabit && 
    m.investment && 
    m.familyAtmosphere && 
    m.parentConflict
  );
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
