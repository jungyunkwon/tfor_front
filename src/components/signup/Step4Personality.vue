<template>
  <div class="step-personality q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">성격 및 성향을</h1>
      <h1 class="text-h5 text-weight-bold">알려주세요</h1>
      <p class="text-grey-7">공개되지 않고 매칭에만 사용되는 정보입니다.</p>
    </div>

    <div class="q-col-gutter-y-lg">
      <SurveyTextArea
        :model-value="form.stressRelief"
        code="stressRelief"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 바로 감정을 터뜨리기보다는 혼자 생각을 정리하는 편이에요. 어느 정도 정리가 되면 산책을 하거나 쉬면서 풀고, 필요한 경우에는 대화를 통해 해소하려고 해요."
        @update:model-value="updateField('stressRelief', $event)"
      />

      <SurveyTextArea
        :model-value="form.conflictResolution"
        code="conflictResolution"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 감정적으로 몰아붙이기보다는 서로의 입장을 차분히 이야기하는 편이에요. 문제를 피하지 않고, 왜 그런 상황이 생겼는지 같이 정리하면서 풀어가고 싶어요."
        @update:model-value="updateField('conflictResolution', $event)"
      />

      <SurveyTextArea
        :model-value="form.avoidBehavior"
        code="avoidBehavior"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 감정을 무시하거나, 화가 났다고 연락을 끊어버리는 행동은 힘들 것 같아요. 서로 다를 수는 있지만 기본적인 존중과 솔직한 대화는 꼭 있었으면 좋겠어요."
        @update:model-value="updateField('avoidBehavior', $event)"
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
      stressRelief: '',
      conflictResolution: '',
      avoidBehavior: ''
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

const stressCount = computed(() => (form.value.stressRelief || '').trim().length);
const conflictCount = computed(() => (form.value.conflictResolution || '').trim().length);
const avoidCount = computed(() => (form.value.avoidBehavior || '').trim().length);

const isValid = computed(() => {
  return stressCount.value >= 30 && conflictCount.value >= 30 && avoidCount.value >= 30;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>
