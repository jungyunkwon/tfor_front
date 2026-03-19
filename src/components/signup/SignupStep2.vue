<template>
  <div class="step-form">
    <div class="q-col-gutter-y-lg">
      
      <!-- 평일 루틴 -->
      <div>
        <label class="text-weight-bold q-mb-sm block text-auth-text">평일 루틴은 어떻게 되시나요?</label>
        <q-input 
          v-model="localModel.weekdayRoutine" 
          type="textarea" 
          outlined 
          placeholder="최소 50자 이상 자세히 작성해주세요" 
          class="auth-input" 
          autogrow 
          :rules="[val => (val && val.length >= 50) || '최소 50자 이상 작성해주세요']" 
          hide-bottom-space
        />
        <div class="text-right text-caption q-mt-xs text-weight-medium" :class="localModel.weekdayRoutine?.length < 50 ? 'text-negative' : 'text-primary'">
          {{ localModel.weekdayRoutine?.length || 0 }} / 50 자
        </div>
      </div>

      <!-- 주말/휴식 루틴 -->
      <div>
        <label class="text-weight-bold q-mb-sm block text-auth-text">평소에 휴식은 어떻게 취하시나요?</label>
        <q-input 
          v-model="localModel.weekendRest" 
          type="textarea" 
          outlined 
          placeholder="최소 50자 이상 자세히 작성해주세요" 
          class="auth-input" 
          autogrow 
          :rules="[val => (val && val.length >= 50) || '최소 50자 이상 작성해주세요']" 
          hide-bottom-space
        />
        <div class="text-right text-caption q-mt-xs text-weight-medium" :class="localModel.weekendRest?.length < 50 ? 'text-negative' : 'text-primary'">
          {{ localModel.weekendRest?.length || 0 }} / 50 자
        </div>
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

const checkValidation = () => {
  const m = localModel.value;
  const isValid = (m.weekdayRoutine?.length >= 50) && (m.weekendRest?.length >= 50);
  emit('validation', isValid);
};

watch(localModel, (newVal) => {
  checkValidation();
  emit('update:modelValue', newVal);
}, { deep: true });

onMounted(() => checkValidation());
</script>

<style scoped>
.text-auth-text { color: var(--color-auth-text); }
</style>
