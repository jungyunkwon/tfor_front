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
          <keep-alive>
            <component 
              :is="currentStepComponent"
              v-model="signupData[stepKey]"
              :summary="signupData"
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
          :label="step === maxSteps ? '완료' : '다음'"
          :disable="!isStepValid"
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
import { signupService } from 'src/services/signupService';
import { surveyService } from 'src/services/surveyService';
import { termsService } from 'src/services/termsService';
import { photoService } from 'src/services/photoService';

import StepProgressBar from 'src/components/common/StepProgressBar.vue';
import Step1Basic from 'src/components/signup/Step1Basic.vue';
import Step2Lifestyle from 'src/components/signup/Step2Lifestyle.vue';
import Step3Relationship from 'src/components/signup/Step3Relationship.vue';
import Step4Personality from 'src/components/signup/Step4Personality.vue';
import Step5Values from 'src/components/signup/Step5Values.vue';
import Step6Target from 'src/components/signup/Step6Target.vue';
import StepFinal from 'src/components/signup/StepFinal.vue';

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
const step = ref(1);
const maxSteps = 7; 
const isStepValid = ref(false);
const transitionName = ref('slide-left');
const isSubmitting = ref(false);

const steps = [
  { key: 'basic', component: markRaw(Step1Basic) },
  { key: 'lifestyle', component: markRaw(Step2Lifestyle) },
  { key: 'relationship', component: markRaw(Step3Relationship) },
  { key: 'personality', component: markRaw(Step4Personality) },
  { key: 'values', component: markRaw(Step5Values) },
  { key: 'target', component: markRaw(Step6Target) },
  { key: 'final', component: markRaw(StepFinal) }
];

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
    intro_text: ''
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
    importance: 3,
    lastRelationshipAnalysis: '',
    idealPartner: '',
    dealBreakers: ''
  },
  final: {
    photos: [],
    agreements: {
      privacy: false,
      service: false
    }
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

const nextStep = () => {
  if (step.value < maxSteps) {
    transitionName.value = 'slide-left';
    step.value++;
    isStepValid.value = false;
  } else {
    onComplete();
  }
};

const prevStep = () => {
  if (step.value > 1) {
    transitionName.value = 'slide-right';
    step.value--;
    isStepValid.value = true;
  }
};

const questionsMap = ref({});
const termsListMap = ref({});

onMounted(async () => {
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
          id: q.surveyQuestionId,
          type: q.questionTypeCd,
          options: optMap
        };
      });
    }
  }

  // 2. 약관 리스트 가져오기
  const resTerms = await termsService.getCurrentTermsList();
  if (resTerms.data?.termsList) {
    resTerms.data.termsList.forEach(t => {
      // terms_type_cd로 매핑 (StepFinal의 agreements 키 'privacy', 'service'와 대조)
      const key = t.termsTypeCd === 'PRIVACY' ? 'privacy' : t.termsTypeCd === 'SERVICE' ? 'service' : t.termsTypeCd.toLowerCase();
      termsListMap.value[key] = t.termsId;
    });
  }
});

const onComplete = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // 0. Ensure user record exists in tb_user (prevents FK violation)
    const resInit = await signupService.initializeUser();
    if (resInit.error) throw new Error('사용자 세션 초기화에 실패했습니다.');

    // 1. Profile Data Mapping (tb_user_profile)
    const profilePayload = {
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
    };
    const resProfile = await profileStore.updateProfile(profilePayload);
    if (resProfile.error) throw new Error('프로필 발송에 실패했습니다.');

    // 2. Survey Transformation & Submit
    const surveyAnswers = [];
    const categories = ['basic', 'lifestyle', 'relationship', 'personality', 'values', 'target'];
    categories.forEach(cat => {
      Object.keys(signupData[cat]).forEach(code => {
        const qInfo = questionsMap.value[code];
        if (qInfo) {
          const val = signupData[cat][code];
          surveyAnswers.push({
            surveyQuestionId: qInfo.id,
            surveyOptionId: qInfo.options[val] || null,
            answerText: qInfo.type === 'TEXT' || qInfo.type === 'TEXTAREA' ? val : null,
            answerNumber: qInfo.type === 'NUMBER' ? Number(val) : null,
            answerJson: qInfo.type === 'JSON' || Array.isArray(val) ? { value: val } : null
          });
        }
      });
    });

    if (surveyAnswers.length > 0) {
      const resSurvey = await profileStore.updateSurvey(surveyAnswers);
      if (resSurvey.error) throw new Error('설문 저장에 실패했습니다.');
    }

    // 3. Terms Agreement Submit
    const agreements = Object.keys(signupData.final.agreements)
      .map(key => ({
        termsId: termsListMap.value[key],
        agreedYn: signupData.final.agreements[key] ? 'Y' : 'N'
      }))
      .filter(a => !!a.termsId);

    if (agreements.length > 0) {
      await termsService.agreeTerms({
        agreements,
        ipAddress: '127.0.0.1', // 클라이언트에서는 가져오기 어려우므로 백엔드/RPC 처리 권장
        userAgent: navigator.userAgent
      });
    }

    // 4. Photos Meta Save (Binary upload logic should be added to storageService)
    if (signupData.final.photos && signupData.final.photos.length > 0) {
      for (let i = 0; i < signupData.final.photos.length; i++) {
        const photo = signupData.final.photos[i];
        if (photo) {
          // TODO: 실제 Storage 업로드 후 URL을 storage_path로 사용해야 함.
          // 여기서는 임시 데이터 처리
          await photoService.uploadProfilePhoto({
            storagePath: photo, // 현재는 base64가 들어있을 확률이 높음 (StepFinal 기준)
            sortNo: i + 1,
            mainPhotoYn: i === 0 ? 'Y' : 'N',
            photoTypeCd: 'BASIC'
          });
        }
      }
    }

    // 5. Onboarding Status Update
    await signupService.completeOnboardingStep('PROFILE', 'Y');
    await signupService.completeOnboardingStep('SURVEY', 'Y');
    await signupService.completeOnboardingStep('PHOTO', 'Y');
    await signupService.completeOnboardingStep('PREVIEW', 'Y');

    showSuccessToast('회원가입 절차가 모두 완료되었습니다!');
    router.replace('/matching');

  } catch (error) {
    console.error(error);
    showErrorToast(error.message || '저장 중 오류가 발생했습니다.');
  } finally {
    isSubmitting.value = false;
  }
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
