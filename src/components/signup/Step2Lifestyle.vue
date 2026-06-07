<template>
  <div class="step-lifestyle q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">어떤 일상을</h1>
      <h1 class="text-h5 text-weight-bold">보내고 계신가요?</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <SurveyTextArea
        :model-value="form.weekdayActivity"
        code="weekdayActivity"
        :questions-map="questionsMap"
        :min-length="40"
        placeholder="예: 퇴근 후에는 운동을 하거나 집에서 쉬면서 영화를 봐요. 평일에는 대체로 규칙적인 생활을 하는 편이고, 혼자 조용히 보내는 시간도 중요하게 생각해요."
        @update:model-value="updateField('weekdayActivity', $event)"
      />

      <SurveyTextArea
        :model-value="form.weekendActivity"
        code="weekendActivity"
        :questions-map="questionsMap"
        :min-length="40"
        placeholder="예: 주말에는 맛집에 가거나 카페에서 시간을 보내고, 가끔은 전시나 산책도 즐겨요. 친구들과는 편하게 대화하며 오래 보는 만남을 좋아해요."
        @update:model-value="updateField('weekendActivity', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SurveyTextArea from 'src/components/survey/SurveyTextArea.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      weekdayActivity: '',
      weekendActivity: ''
    })
  },
  questionsMap: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const weekdayCount = computed(() => (form.value.weekdayActivity || '').trim().length);
const weekendCount = computed(() => (form.value.weekendActivity || '').trim().length);

const isValid = computed(() => {
  return weekdayCount.value >= 40 && weekendCount.value >= 40;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>
