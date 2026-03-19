<template>
  <div class="step-form">
    <div class="q-col-gutter-y-md">
      
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">현재 하는 일을 자세히 알려주세요</label>
        <q-input v-model="localModel.currentJobDetail" outlined dense placeholder="업무 내용" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">향후 커리어 목표가 있나요? (자세히 설명)</label>
        <q-input v-model="localModel.careerGoal" type="textarea" autogrow outlined dense placeholder="커리어 목표 입력" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">향후 3~5년 뒤엔 어떤 삶을 살고 있을까요?</label>
        <q-input v-model="localModel.futureLife" type="textarea" autogrow outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">결혼은 언제쯤 하고 싶고, 자녀계획이 있나요?</label>
        <q-input v-model="localModel.marriagePlan" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div class="q-mt-lg">
        <q-separator class="q-my-md" />
        <label class="text-weight-bold q-mb-sm block text-auth-text">월급(수입)이 들어오면 가장 먼저 하는 행동은?</label>
        <q-radio v-for="opt in SALARY_BEHAVIOR_OPTIONS" :key="opt.code" v-model="localModel.salaryBehavior" :val="opt.code" :label="opt.name" color="primary" class="q-mr-md q-mb-xs block" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">명품 소비를 선호하는 편인가요?</label>
        <div class="row q-gutter-x-md">
          <q-radio v-for="opt in YES_NO_OPTIONS" :key="opt.code" v-model="localModel.luxuryPref" :val="opt.code" :label="opt.name" color="primary" />
        </div>
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">결혼 후 돈관리는 어떻게 하는게 좋다고 생각하나요?</label>
        <q-input v-model="localModel.moneyManagement" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">재테크에 대한 생각을 말해주세요.</label>
        <q-input v-model="localModel.investmentThoughts" outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <q-separator class="q-my-md" />
        <label class="text-weight-bold q-mb-xs block text-auth-text">결혼 후 본인의 부모님과 아내가 싸운다면 어떻게 대처하실 건가요?</label>
        <q-input v-model="localModel.parentConflict" type="textarea" autogrow outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">집안 분위기를 설명해주세요.</label>
        <q-input v-model="localModel.familyVibe" type="textarea" autogrow outlined dense placeholder="답변을 입력해주세요" class="auth-input" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { SALARY_BEHAVIOR_OPTIONS, YES_NO_OPTIONS } from 'src/enums/code';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });

const checkValidation = () => {
  const m = localModel.value;
  const isValid = !!(
    m.currentJobDetail && m.careerGoal && m.futureLife && m.marriagePlan && 
    m.salaryBehavior && m.luxuryPref && m.moneyManagement && m.investmentThoughts && 
    m.parentConflict && m.familyVibe
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
