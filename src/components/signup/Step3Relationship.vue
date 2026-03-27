<template>
  <div class="step-relationship q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">연애 스타일을 알려주세요</h1>
      <p class="text-grey-7">서로 잘 맞는 가치관을 찾아드립니다</p>
    </div>

    <div class="column q-gutter-y-xl">
      <!-- 애정표현 -->
      <section>
        <label class="section-label q-mb-md">선호하는 애정표현 방식</label>
        <RadioCard 
          v-model="modelValue.expressionWay"
          :options="expressionOptions"
        />
      </section>

      <!-- 연락 안 될 때 -->
      <section>
        <label class="section-label q-mb-md">상대방과 연락이 안 될 때</label>
        <RadioCard 
          v-model="modelValue.contactFrequency"
          :options="contactOptions"
        />
      </section>

      <!-- 이상적 데이트 -->
      <section>
        <label class="section-label q-mb-md">가장 좋아하는 데이트 (다중)</label>
        <SelectChip 
          v-model="modelValue.idealDate"
          :options="dateOptions"
        />
      </section>

      <!-- 매일 행복 -->
      <section>
        <label class="section-label q-mb-md">언제 가장 행복하신가요?</label>
        <q-input
          v-model="modelValue.happiness"
          outlined
          dense
          placeholder="나만의 소소한 행복을 적어주세요 (예: 주말 늦잠)"
        />
      </section>

      <!-- 데이트 비용 -->
      <section>
        <label class="section-label q-mb-md">데이트 비용 부담에 대해서</label>
        <RadioCard 
          v-model="modelValue.dateExpense"
          :options="expenseOptions"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import RadioCard from 'src/components/common/RadioCard.vue';
import SelectChip from 'src/components/common/SelectChip.vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const expressionOptions = [
  { label: '말로 표현하는 게 중요해', value: 'VERBAL', description: '사랑한다는 말을 자주 하는 편' },
  { label: '행동으로 보여줄게', value: 'ACTION', description: '챙겨주거나 선물을 주는 실질적인 태도' },
  { label: '스킨십이 가장 좋아', value: 'PHYSICAL', description: '손잡기, 안아주기 등 신체 접촉' }
];

const contactOptions = [
  { label: '바쁘면 나중에 해도 돼', value: 'RELAXED', description: '서로의 시간을 존중하는 편' },
  { label: '그래도 생존 신고는 해줘', value: 'MINIMUM', description: '최소한의 소식은 궁금해' },
  { label: '연락은 사랑의 척도야', value: 'FREQUENT', description: '자주 연락하는 것이 안심돼' }
];

const dateOptions = [
  { label: '맛집 투어', value: 'FOOD' },
  { label: '영화/공연', value: 'CULTURE' },
  { label: '산책/등산', value: 'OUTDOOR' },
  { label: '카페 수다', value: 'TALK' },
  { label: '홈데이트', value: 'HOME' },
  { label: '여행/드라이브', value: 'TRAVEL' }
];

const expenseOptions = [
  { label: '여유 있는 사람이 더 내기', value: 'FLEXIBLE' },
  { label: '정확하게 더치페이', value: 'DUTCH' },
  { label: '번갈아 가며 사기', value: 'ALTERNATE' },
  { label: '남자가/여자가 더 내기', value: 'TRADITIONAL' }
];

const isValid = computed(() => {
  const m = props.modelValue;
  return !!(
    m.expressionWay && 
    m.contactFrequency && 
    m.idealDate && m.idealDate.length > 0 &&
    m.happiness &&
    m.dateExpense
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
