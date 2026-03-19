<template>
  <q-page class="signup-page q-pa-md bg-white">
    <div class="signup-container">
      <!-- 헤더 영역 -->
      <div class="header-section q-mb-xl q-pt-sm">
        <h2 class="text-h5 font-weight-bold text-dark q-mb-sm text-center">회원가입 ({{ step }}/6)</h2>
        <p class="text-grey-7 text-center">{{ stepTitles[step - 1] }}</p>
      </div>

      <!-- 동적 컴포넌트 스텝 -->
      <div class="form-section q-mb-xl">
        <keep-alive>
          <component
            :is="currentStepComponent"
            :modelValue="formData"
            @update:modelValue="updateData"
            @validation="onValidationChange"
          />
        </keep-alive>
      </div>

      <!-- 하단 플로팅 버튼 영역 -->
      <div class="footer-section bg-white fixed-bottom q-pa-md border-top">
        <div class="row q-col-gutter-sm max-width-container">
          <div class="col" v-if="step > 1">
            <q-btn
              label="이전"
              outline
              color="grey-6"
              class="full-width q-py-md hover-scale"
              @click="prevStep"
            />
          </div>
          <div class="col">
            <q-btn
              :label="step === 6 ? '완료' : '다음 →'"
              color="primary"
              class="full-width q-py-md hover-scale"
              unelevated
              :disable="!isCurrentStepValid"
              @click="nextStep"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SignupStep1 from 'src/components/signup/SignupStep1.vue';
import SignupStep2 from 'src/components/signup/SignupStep2.vue';
import SignupStep3 from 'src/components/signup/SignupStep3.vue';
import SignupStep4 from 'src/components/signup/SignupStep4.vue';
import SignupStep5 from 'src/components/signup/SignupStep5.vue';
import SignupStep6 from 'src/components/signup/SignupStep6.vue';

const router = useRouter();
const step = ref(1);
const isCurrentStepValid = ref(false);

const stepTitles = [
  '세부 내용을 입력해주세요',
  '라이프스타일',
  '연애 스타일',
  '감정/성격',
  '가치관/커리어',
  '상대 조건'
];

const steps = [
  SignupStep1,
  SignupStep2,
  SignupStep3,
  SignupStep4,
  SignupStep5,
  SignupStep6
];

const currentStepComponent = computed(() => steps[step.value - 1]);

// 전체 폼 데이터 중앙 관리
const formData = ref({
  // step 1
  nickname: '',
  birthYear: null,
  area: '',
  height: null,
  bodyShape: '',
  job: '',
  education: '',
  religion: '',
  politics: '',
  smoking: '',
  drinkingFreq: '',
  drinkingType: '',
  diet: '',
  jobType: '',
  company: '',
  salary: null,
  sales: null,
  businessType: '',
  hasRealEstate: '',
  hasInvestment: '',
  hasSavings: '',

  // step 2
  weekdayRoutine: '',
  weekendRest: '',

  // step 3
  affectionExpr: '',
  whenUnreachable: '',
  idealDate: '',
  dailyHappinessMake: '',
  dailyHappinessReceive: '',
  dateCost: '',

  // step 4
  stressRelief: '',
  conflictResolution: '',
  dontDoThis: '',

  // step 5
  currentJobDetail: '',
  careerGoal: '',
  futureLife: '',
  marriagePlan: '',
  salaryBehavior: '',
  luxuryPref: '',
  moneyManagement: '',
  investmentThoughts: '',
  parentConflict: '',
  familyVibe: '',

  // step 6
  mandatoryConditions: '',
  valuesPriority: '',
  lastRomanceFeedback: ''
});

const updateData = (newData) => {
  formData.value = { ...formData.value, ...newData };
};

const onValidationChange = (isValid) => {
  isCurrentStepValid.value = isValid;
};

const nextStep = () => {
  if (step.value < 6) {
    step.value++;
    isCurrentStepValid.value = false; // 새로운 스텝 진입 시 초기화
  } else {
    submitForm();
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
    isCurrentStepValid.value = true; // 이전 스텝은 이미 통과된 상태
  }
};

const submitForm = () => {
  console.log('Final Form Data:', formData.value);
  // 추후 authStore 등의 userId 등록 API 연동 필요
  router.push('/');
};
</script>

<style lang="sass" scoped>
.signup-page
  min-height: 100vh
  background-color: var(--color-auth-bg)
  padding-bottom: 120px // 하단 플로팅 영역 확보

.signup-container
  max-width: 600px
  margin: 0 auto

.border-top
  border-top: 1px solid var(--color-auth-border)

.max-width-container
  max-width: 600px
  margin: 0 auto
</style>
