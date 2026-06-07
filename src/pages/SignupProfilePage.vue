<template>
  <q-page class="profile-setup-page auth-page font-outfit">
    <!-- 상단 고정 헤더 -->
    <header class="setup-header fixed-top bg-white border-bottom q-px-md q-py-sm">
      <div class="row items-center justify-between">
        <q-btn 
          flat 
          round 
          icon="arrow_back" 
          color="dark" 
          @click="prevStep" 
          v-if="step > 1"
        />
        <div v-else style="width: 42px"></div> <!-- Space for back button -->

        <StepProgressBar :current="step" :total="maxSteps" class="col" />
      </div>
    </header>

    <!-- 스크롤 본문 -->
    <main class="setup-body q-pt-xl q-pb-xl">
      <div class="max-width-container">
        <transition 
          :name="transitionName" 
          mode="out-in"
        >
          <div v-if="showOptionalIntro" key="optional-intro" class="optional-intro q-pa-md anim-fade text-center">
            <div class="optional-intro-content">
              <h1 class="text-h5 text-weight-bold q-mb-sm">결이 맞는 사람을 만나기 위해,</h1>
              <h1 class="text-h5 text-weight-bold q-mb-xl">당신의 취향과 연애 스타일을 알려주세요.</h1>
              <q-btn
                unelevated
                class="auth-btn-primary q-py-md q-px-xl hover-scale"
                label="취향 알려주기"
                @click="startOptionalOnboarding"
              />
            </div>
          </div>
          <keep-alive v-else>
            <component 
              :is="currentStepComponent"
              v-model="signupData[stepKey]"
              :summary="signupData"
              :questions-map="questionsMap"
              @validation="onStepValidation"
            />
          </keep-alive>
        </transition>
      </div>
    </main>

    <!-- 하단 고정 버튼 -->
    <footer class="setup-footer fixed-bottom bg-white border-top q-pa-sm">
      <div class="max-width-container">
        <q-btn
          v-if="!showOptionalIntro"
          :label="step === maxSteps ? '완료' : step === 1 ? '시작하기' : '다음'"
          :loading="isSubmitting"
          :disable="isSubmitting"
          unelevated
          class="full-width q-py-md q-px-md auth-btn-primary hover-scale"
          @click="nextStep"
        />
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, markRaw, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showErrorToast, showSuccessToast } from 'src/utils/notify';
import { useProfileStore } from 'src/stores/ProfileStore';
import { useAuthStore } from 'src/stores/AuthStore';
import { signupService } from 'src/services/signupService';
import { surveyService } from 'src/services/surveyService';
import { photoService } from 'src/services/photoService';
import { matchTargetService } from 'src/services/matchTargetService';

import StepProgressBar from 'src/components/common/StepProgressBar.vue';
import Step1Basic from 'src/components/signup/Step1Basic.vue';
import Step2Lifestyle from 'src/components/signup/Step2Lifestyle.vue';
import Step3Relationship from 'src/components/signup/Step3Relationship.vue';
import Step4Personality from 'src/components/signup/Step4Personality.vue';
import Step5Values from 'src/components/signup/Step5Values.vue';
import Step6Target from 'src/components/signup/Step6Target.vue';

import {
  BODY_SHAPE_OPTIONS,
  JOB_OPTIONS,
  EDUCATION_OPTIONS,
  RELIGION_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_FREQ_OPTIONS,
} from 'src/enums/code';

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();
const step = ref(1);
const showOptionalIntro = ref(false);
const isStepValid = ref(false);
const transitionName = ref('slide-left');
const isSubmitting = ref(false);

const steps = [
  { key: 'basic', component: markRaw(Step1Basic) },
  { key: 'target', component: markRaw(Step6Target) },
  { key: 'lifestyle', component: markRaw(Step2Lifestyle) },
  { key: 'relationship', component: markRaw(Step3Relationship) },
  { key: 'personality', component: markRaw(Step4Personality) },
  { key: 'values', component: markRaw(Step5Values) }
];
const maxSteps = steps.length;

const signupData = reactive({
  basic: {
    nickname: '',
    gender_cd: 'MALE',
    birth_year: 1995,
    height_cm: 175,
    region_cd: 'SEOUL',
    subregion_cd: 'GANGNAM',
    bodyShape: BODY_SHAPE_OPTIONS[0].code,
    job_name: JOB_OPTIONS[0].code,
    job_etc: '',
    education_level_cd: EDUCATION_OPTIONS[2].code,
    education_etc: '',
    religion_cd: RELIGION_OPTIONS[0].code,
    religion_etc: '',
    politics: 'NEUTRAL',
    smoking_yn: SMOKING_OPTIONS[1].code,
    drinking_cd: DRINKING_FREQ_OPTIONS[3].code,
    drinkingType: [],
    diet: 'korean',
    jobType: 'employee',
    salary_amount: 5000,
    business_type: '',
    revenue_amount: 0,
    assetInfo: [],
    stocks: [],
    intro_text: '',
    photos: []
  },
  lifestyle: { 
    weekdayActivity: '', 
    weekendActivity: '' 
  },
  relationship: { 
    expressionWay: '', 
    contactIssue: '', 
    idealDateStyle: '', 
    benefitToPartner: '', 
    dateExpense: 'ALTERNATE' 
  },
  personality: { 
    stressRelief: '', 
    conflictResolution: '', 
    avoidBehavior: '' 
  },
  values: { 
    currentJob: '', 
    careerGoal: '', 
    futurePlan: '', 
    familyAtmosphere: '', 
    familyConflict: '', 
    marriagePlan: 'DISCUSS', 
    spendingHabit: 'save_first', 
    investment: 'STABLE' 
  },
  target: {
    targetAge: [20, 30],
    targetHeight: [160, 170],
    targetRegion: [],
    targetJob: [],
    targetEducation: [],
    targetReligion: [],
    targetPolitics: [],
    targetSmoking: [],
    targetDrinking: [],
    targetDiet: [],
    targetSalary: [],
    targetAsset: [],
    targetStocks: [],
    targetIntro: '',
    targetConditions: [],
    targetConditionExtra: '',
    importance: 3,
    lastRelationshipAnalysis: '',
    idealPartner: '',
    dealBreakers: ''
  }
});

const stepKey = computed(() => {
  if (step.value < 1 || step.value > steps.length) return 'basic';
  return steps[step.value - 1].key;
});

const currentStepComponent = computed(() => {
  if (step.value < 1 || step.value > steps.length) return markRaw(Step1Basic);
  return steps[step.value - 1].component;
});

const onStepValidation = (isValid) => {
  isStepValid.value = isValid;
};

const nextStep = async () => {
  if (step.value === 1 && !isStepValid.value) {
    showErrorToast('필수 입력 항목을 모두 확인해 주세요.');
    return;
  }

  if (isSubmitting.value) return;

  if (step.value === maxSteps) {
    await onComplete();
    return;
  }

  try {
    isSubmitting.value = true;

    if (step.value === 1) {
      await saveProfileStep();
      showOptionalIntro.value = true;
      return;
    } else if (step.value > 1) {
      await saveSurveyStep();
    }
  } catch (error) {
    console.error(error);
    showErrorToast(error.message || 'An error occurred.');
    return;
  } finally {
    isSubmitting.value = false;
  }

  if (step.value < maxSteps) {
    transitionName.value = 'slide-left';
    step.value++;
    isStepValid.value = false;
  }
};

const prevStep = () => {
  if (showOptionalIntro.value) {
    showOptionalIntro.value = false;
    isStepValid.value = true;
    return;
  }

  if (step.value > 1) {
    transitionName.value = 'slide-right';
    step.value--;
    isStepValid.value = true;
  }
};

const questionsMap = ref({});

const applyStepFromOnboardingStatus = () => {
  const nextOnboardingStep = authStore.onboardingStatus?.nextStep;

  if (nextOnboardingStep === 'DONE') {
    step.value = 1;
    showOptionalIntro.value = true;
    return;
  }

  const stepMap = {
    PROFILE: 1,
    SURVEY: 2,
    PHOTO: 1,
    PREVIEW: 1
  };

  step.value = stepMap[nextOnboardingStep] || 1;
};

const buildProfilePayload = () => ({
  nickname: signupData.basic.nickname,
  gender_cd: signupData.basic.gender_cd,
  birth_year: signupData.basic.birth_year,
  height_cm: signupData.basic.height_cm,
  job_name: signupData.basic.job_name,
  education_level_cd: signupData.basic.education_level_cd,
  region_cd: signupData.basic.region_cd,
  intro_text: signupData.basic.intro_text || '',
  smoking_yn: signupData.basic.smoking_yn === 'SMOKER' ? 'Y' : 'N',
  drinking_cd: signupData.basic.drinking_cd,
  religion_cd: signupData.basic.religion_cd,
  marital_status_cd: 'SINGLE',
  children_yn: 'N',
  profile_open_yn: 'Y'
});

const buildSurveyAnswers = () => {
  const surveyAnswers = [];
  const categories = ['basic', 'lifestyle', 'relationship', 'personality', 'values', 'target'];

  categories.forEach(cat => {
    Object.keys(signupData[cat]).forEach(code => {
      const qInfo = questionsMap.value[code];
      if (qInfo) {
        const val = signupData[cat][code];
        const isEmpty = val === null ||
          val === undefined ||
          val === '' ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) return;

        const isTextAnswer = qInfo.questionTypeCd === 'TEXT' || qInfo.questionTypeCd === 'TEXTAREA';
        const isNumberAnswer = qInfo.questionTypeCd === 'NUMBER';
        const surveyOptionId = !Array.isArray(val) ? qInfo.optionMap?.[val] || null : null;

        surveyAnswers.push({
          surveyQuestionId: qInfo.surveyQuestionId,
          surveyOptionId,
          answerText: isTextAnswer ? val : null,
          answerNumber: isNumberAnswer ? Number(val) : null,
          answerJson: qInfo.questionTypeCd === 'JSON' || Array.isArray(val) ? { value: val } : null
        });
      }
    });
  });

  return surveyAnswers;
};

const buildMatchTargetPayload = () => ({
  preferred_smoking_yn: signupData.target.targetConditions.includes('NON_SMOKER') ? 'N' : null,
  preferred_drinking_cd: signupData.target.targetConditions.includes('NON_DRINKER') ? 'NON_DRINKER' : null,
  preferred_conditions_text: signupData.target.targetConditionExtra || null,
  extra_condition_json: {
    targetConditions: signupData.target.targetConditions || [],
    importance: signupData.target.importance,
    lastRelationshipAnalysis: signupData.target.lastRelationshipAnalysis || '',
    idealPartner: signupData.target.idealPartner || '',
    dealBreakers: signupData.target.dealBreakers || ''
  }
});

const saveProfileStep = async () => {
  const resInit = await signupService.initializeUser();
  if (resInit.error) throw new Error(`User initialization failed: ${resInit.error.message}`);

  const resProfile = await profileStore.updateProfile(buildProfilePayload());
  if (resProfile.error) throw new Error('Profile save failed.');

  if (signupData.basic.photos && signupData.basic.photos.length > 0) {
    for (let i = 0; i < signupData.basic.photos.length; i++) {
      const photo = signupData.basic.photos[i];
      if (photo?.file) {
        const resPhoto = await photoService.uploadProfilePhotoFile(photo.file, {
          sortNo: i + 1,
          mainPhotoYn: i === 0 ? 'Y' : 'N',
          photoTypeCd: 'BASIC'
        });
        if (resPhoto.error) throw new Error(resPhoto.error.message || 'Photo upload failed.');
      }
    }
  }

  const requiredSteps = ['PROFILE', 'SURVEY', 'PHOTO', 'PREVIEW'];
  for (const requiredStep of requiredSteps) {
    const resStep = await signupService.completeOnboardingStep(requiredStep, 'Y');
    if (resStep.error) throw new Error(resStep.error.message || `${requiredStep} step update failed.`);
  }

  await authStore.checkOnboardingStatus();
};

const saveSurveyStep = async () => {
  const surveyAnswers = buildSurveyAnswers();

  if (stepKey.value === 'target') {
    const resTarget = await matchTargetService.saveMyMatchTarget(buildMatchTargetPayload());
    if (resTarget.error) throw new Error(resTarget.error.message || 'Match target save failed.');
  }

  if (surveyAnswers.length > 0) {
    const resSurvey = await profileStore.updateSurvey(surveyAnswers);
    if (resSurvey.error) throw new Error('Survey save failed.');
  }

  await authStore.checkOnboardingStatus();
};

onMounted(async () => {
  const resInit = await signupService.initializeUser();
  if (resInit.error) {
    showErrorToast(resInit.error.message || 'User initialization failed.');
    return;
  }

  await authStore.checkOnboardingStatus();
  applyStepFromOnboardingStatus();

  // 1. 설문 질문 리스트 가져오기 (전체 그룹)
  const groupCodes = ['LIFESTYLE', 'RELATIONSHIP', 'PERSONALITY', 'VALUES', 'TARGET'];
  for (const code of groupCodes) {
    const res = await surveyService.getSurveyQuestions(code);
    if (res.data?.questions) {
      res.data.questions.forEach(q => {
        // questionCode를 키로 맵에 저장 (Step 컴포넌트의 signupData 키와 매핑됨)
        const optMap = {};
        if (q.options) {
          q.options.forEach(o => { optMap[o.optionValue] = o.surveyOptionId; });
        }
        questionsMap.value[q.questionCode] = {
          surveyQuestionId: q.surveyQuestionId,
          questionCode: q.questionCode,
          questionText: q.questionText,
          questionTypeCd: q.questionTypeCd,
          requiredYn: q.requiredYn,
          options: q.options || [],
          optionMap: optMap
        };
      });
    }
  }

});

const onComplete = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await saveSurveyStep();
    showSuccessToast('온보딩 정보가 저장되었습니다.');
    router.replace('/matching');
  } catch (error) {
    console.error(error);
    showErrorToast(error.message || 'An error occurred.');
  } finally {
    isSubmitting.value = false;
  }
};

const startOptionalOnboarding = () => {
  showOptionalIntro.value = false;
  transitionName.value = 'slide-left';
  step.value = 2;
  isStepValid.value = true;
};

</script>

<style lang="sass" scoped>
.profile-setup-page
  background-color: var(--color-auth-bg, #ffffff)
  min-height: 100vh
  overflow-x: hidden

.setup-header
  z-index: 100
  height: 64px
  
.setup-body
  padding-top: 80px
  padding-bottom: 110px

.setup-footer
  z-index: 100
  height: 80px

.max-width-container
  max-width: 600px
  margin: 0 auto

.border-bottom
  border-bottom: 1.5px solid var(--color-auth-border, #f1f5f9)

.border-top
  border-top: 1.5px solid var(--color-auth-border, #f1f5f9)

// Slide Animations
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active
  transition: all 0.3s ease-out

.slide-left-enter-from
  transform: translateX(100%)
  opacity: 0

.slide-left-leave-to
  transform: translateX(-100%)
  opacity: 0

.slide-right-enter-from
  transform: translateX(-100%)
  opacity: 0

.slide-right-leave-to
  transform: translateX(100%)
  opacity: 0
</style>
