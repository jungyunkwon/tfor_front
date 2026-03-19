<template>
  <div class="step-form">
    <div class="q-col-gutter-y-md">
      
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">여자친구에게 관심이나 애정표현은 어떤 방식으로 하시나요?</label>
        <q-input v-model="localModel.affectionExpr" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">연락이 안될 때는 어떻게 하시나요?</label>
        <q-input v-model="localModel.whenUnreachable" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">이상적인 데이트는 어떤건가요?</label>
        <q-input v-model="localModel.idealDate" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">매일 상대를 행복하게 해주는 방법은 뭔가요?</label>
        <q-input v-model="localModel.dailyHappinessMake" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">상대에게 받고 싶은 행복은 무엇인가요?</label>
        <q-input v-model="localModel.dailyHappinessReceive" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">데이트 비용은 어떻게 부담하는게 좋으신가요?</label>
        <q-input v-model="localModel.dateCost" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
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
  const isValid = !!(
    m.affectionExpr && m.whenUnreachable && m.idealDate &&
    m.dailyHappinessMake && m.dailyHappinessReceive && m.dateCost
  );
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
