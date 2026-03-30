<template>
  <div class="step-target q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">원하는 상대</h1>
      <p class="text-grey-7">꼭 포기할 수 없는 조건을 알려주세요</p>
    </div>

    <div class="column q-gutter-y-xl">
      <section>
        <label class="section-label q-mb-md">상대방에게 바라는 조건 (다중 선택)</label>
        <SelectChip
          :model-value="form.targetConditions"
          :options="conditionOptions"
          multiple
          @update:model-value="updateField('targetConditions', $event)"
        />
        <q-input
          :model-value="form.targetConditionExtra"
          @update:model-value="updateField('targetConditionExtra', $event)"
          outlined
          dense
          placeholder="기타 추가하고 싶은 조건이 있다면?"
          class="q-mt-sm"
        />
      </section>

      <section>
        <label class="section-label q-mb-xs">전 연애에서 배운 점 / 개선하고 싶은 점</label>
        <q-input
          :model-value="form.lastRelationshipAnalysis"
          @update:model-value="updateField('lastRelationshipAnalysis', $event)"
          type="textarea"
          outlined
          placeholder="저번 연애에서 내가 부족했던 부분이나 깨달은 가치관을 솔직하게 적어주세요."
          rows="5"
        />
        <p class="text-caption text-grey-6 q-mt-xs">과거를 돌아봄으로써 더 성숙한 다음 연애를 준비할 수 있습니다.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SelectChip from 'src/components/common/SelectChip.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      targetConditions: [],
      targetConditionExtra: '',
      importance: 3,
      lastRelationshipAnalysis: ''
    })
  }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const conditionOptions = [
  { label: '비흡연자', value: 'NON_SMOKER' },
  { label: '술 안 마시는 사람', value: 'NON_DRINKER' },
  { label: '본인 직업 확실한 사람', value: 'STABLE_JOB' },
  { label: '키 175cm 이상', value: 'HEIGHT_175_PLUS' },
  { label: '키 160cm 이상', value: 'HEIGHT_160_PLUS' },
  { label: '자가 소유', value: 'OWN_HOME' },
  { label: '종교가 같아야 함', value: 'SAME_RELIGION' },
  { label: '야외 활동형', value: 'OUTDOOR' },
  { label: '다정하고 배려심 넘치는', value: 'KIND' }
];

const isValid = computed(() => {
  const m = form.value;
  return !!(
    Array.isArray(m.targetConditions) &&
    m.targetConditions.length > 0 &&
    m.importance &&
    m.lastRelationshipAnalysis
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