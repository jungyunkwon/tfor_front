<template>
  <div class="step-personality q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">감정과 성격을 알려주세요</h1>
      <p class="text-grey-7">건강한 관계 형성을 위해 필요합니다</p>
    </div>

    <div class="column q-gutter-y-xl">
      <!-- 스트레스 해소 -->
      <section>
        <label class="section-label q-mb-md">스트레스 해소 방법 (다중 선택)</label>
        <SelectChip 
          v-model="modelValue.stressRelief"
          :options="stressOptions"
        />
      </section>

      <!-- 갈등 해결 -->
      <section>
        <label class="section-label q-mb-md">연인과의 갈등을 해결하는 방식</label>
        <RadioCard 
          v-model="modelValue.conflictResolution"
          :options="conflictOptions"
        />
      </section>

      <!-- 안 해줬으면 하는 점 -->
      <section>
        <label class="section-label q-mb-md">상대방이 이것만은 안 해줬으면 좋겠다!</label>
        <q-input
          v-model="modelValue.avoidBehavior"
          type="textarea"
          outlined
          placeholder="거짓말, 연락 두절, 무한 지각 등 본인만의 금기 사항을 적어주세요."
          rows="4"
        />
        <p class="text-caption text-grey-6 q-mt-xs">사전에 서로의 기준을 아는 것이 중요합니다.</p>
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

const stressOptions = [
  { label: '친구들과의 수다', value: 'TALK' },
  { label: '혼자만의 시간', value: 'ALONE' },
  { label: '맛있는 음식 먹기', value: 'EAT' },
  { label: '강도 높은 운동', value: 'EXERCISE' },
  { label: '취미 생활(게임, 여행 등)', value: 'HOBBY' },
  { label: '잠자기', value: 'SLEEP' }
];

const conflictOptions = [
  { label: '그 자리에서 바로 대화하기', value: 'INSTANT', description: '응어리 남기지 않고 해결 선호' },
  { label: '생각을 정리할 시간 갖기', value: 'THINK', description: '차분해진 후 대화하는 편' },
  { label: '둘 다 노력해서 맞춰가기', value: 'EFFORT', description: '서로의 양보가 가장 중요' }
];

const isValid = computed(() => {
  const m = props.modelValue;
  return !!(
    m.stressRelief && m.stressRelief.length > 0 &&
    m.conflictResolution &&
    m.avoidBehavior
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
