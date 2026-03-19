<template>
  <div class="step-form">
    <div class="q-col-gutter-y-lg">
      
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">스트레스를 어떻게 푸시는 편인가요?</label>
        <q-input 
          v-model="localModel.stressRelief" 
          type="textarea" 
          outlined 
          placeholder="답변을 입력해주세요 (최소 10자 이상 권장)" 
          class="auth-input" 
          autogrow 
        />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">연인 간에 갈등이 생겼을 때 어떻게 해결하시나요?</label>
        <q-input 
          v-model="localModel.conflictResolution" 
          type="textarea" 
          outlined 
          placeholder="답변을 입력해주세요" 
          class="auth-input" 
          autogrow 
        />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">이것만은 안해줬으면 좋겠다 하는, 연애할 때 스트레스 받는 상황은 뭔가요?</label>
        <q-input 
          v-model="localModel.dontDoThis" 
          type="textarea" 
          outlined 
          placeholder="답변을 입력해주세요" 
          class="auth-input" 
          autogrow 
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

const checkValidation = () => {
  const m = localModel.value;
  const isValid = !!(m.stressRelief && m.conflictResolution && m.dontDoThis);
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
