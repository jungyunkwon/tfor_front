<template>
  <div class="setup-survey">
    <div class="text-subtitle1 q-mb-md">당신의 가치관과 연애관을 솔직하게 선택해주세요!</div>
    
    <div v-for="(q, index) in dummyQuestions" :key="q.id" class="q-mb-lg">
      <div class="text-weight-bold q-mb-sm">{{ index + 1 }}. {{ q.text }}</div>
      <div class="row q-gutter-x-md">
        <q-radio 
          v-for="opt in q.options" 
          :key="opt.val" 
          v-model="localModel.survey[q.id]" 
          :val="opt.val" 
          :label="opt.label" 
          color="primary" 
          @update:model-value="checkValidation"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });

// API 연동 전 UI용 더미 문항 (나중에 API로 대체)
const dummyQuestions = [
  { id: 'q1', text: '주말 데이트는 주로?', options: [ { val: 'A', label: '활동적인 데이트' }, { val: 'B', label: '쉬면서 힐링' } ] },
  { id: 'q2', text: '비용 처리는?', options: [ { val: 'A', label: '각자 더치페이' }, { val: 'B', label: '번갈아가며' } ] },
];

watch(localModel, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const checkValidation = () => {
  const s = localModel.value.survey || {};
  // 더미에 따라 모든 문항 응답해야 유효
  const isValid = dummyQuestions.every(q => !!s[q.id]);
  emit('validation', isValid);
};

onMounted(() => {
  if (!localModel.value.survey) {
    localModel.value.survey = {};
  }
  checkValidation();
});
</script>
