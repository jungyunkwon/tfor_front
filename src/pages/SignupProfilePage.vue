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
    <footer class="setup-footer fixed-bottom bg-white border-top q-pa-md">
      <div class="max-width-container">
        <q-btn
          :label="step === maxSteps ? '완료' : '다음'"
          :disable="!isStepValid"
          unelevated
          class="full-width q-py-lg auth-btn-primary hover-scale"
          @click="nextStep"
        />
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { showErrorToast, showSuccessToast } from 'src/utils/notify';
import { useProfileStore } from 'src/stores/ProfileStore';
import { signupService } from 'src/services/signupService';

import StepProgressBar from 'src/components/common/StepProgressBar.vue';
import Step1Basic from 'src/components/signup/Step1Basic.vue';
import Step2Lifestyle from 'src/components/signup/Step2Lifestyle.vue';
import Step3Relationship from 'src/components/signup/Step3Relationship.vue';
import Step4Personality from 'src/components/signup/Step4Personality.vue';
import Step5Values from 'src/components/signup/Step5Values.vue';
import Step6Target from 'src/components/signup/Step6Target.vue';
import StepFinal from 'src/components/signup/StepFinal.vue';

const router = useRouter();
const profileStore = useProfileStore();
const step = ref(1);
const maxSteps = 7; // 6 Steps + Final Summary
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
    gender_cd: null,
    birthYear: null,
    height: null,
    region: null,
    bodyShape: null,
    job: null,
    education: null,
    religion: null,
    politics: null,
    smoking: null,
    drinking: null,
    drinkingType: null,
    diet: null,
    jobType: null,
    assetInfo: null,
    intro_text: ''
  },
  lifestyle: { routines: [], relaxation: '' },
  relationship: { idealDate: [], expressionWay: null, contactFrequency: null, happiness: '', dateExpense: null },
  personality: { stressRelief: [], conflictResolution: null, avoidBehavior: '' },
  values: { marriagePlan: null, currentJobDetail: '', careerGoal: '', futurePlan: '', spendingHabit: null, investment: null, familyAtmosphere: null, parentConflict: null },
  target: { targetConditions: [], targetConditionExtra: '', importance: 3, lastRelationshipAnalysis: '' },
  final: {}
});

const stepKey = computed(() => steps[step.value - 1].key);
const currentStepComponent = computed(() => steps[step.value - 1].component);

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

const onComplete = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // 1. Profile Data Mapping (tb_user_profile)
    const profilePayload = {
      nickname: signupData.basic.nickname,
      genderCd: signupData.basic.gender_cd,
      birthYear: signupData.basic.birthYear,
      heightCm: signupData.basic.height,
      jobName: signupData.basic.job,
      educationLevelCd: signupData.basic.education,
      regionCd: signupData.basic.region,
      introText: signupData.basic.intro_text || '',
      smokingYn: signupData.basic.smoking === 'yes' ? 'Y' : 'N',
      drinkingCd: signupData.basic.drinking,
      religionCd: signupData.basic.religion,
      maritalStatusCd: 'SINGLE', // 기본값 설정
      childrenYn: 'N', // 기본값
      profileOpenYn: 'Y'
    };

    // 2. Survey Data Mapping (lifestyle, relationship, personality, values, target)
    // survey_question_id는 백엔드에서 매핑하거나, 여기서 정의한 구조대로 JSON 전송
    const surveyPayload = {
      lifestyle: signupData.lifestyle,
      relationship: signupData.relationship,
      personality: signupData.personality,
      values: signupData.values,
      target: signupData.target,
      // 추가 설문 필드들 (tb_user_profile에 없는 필드)
      extra_basic: {
        bodyShape: signupData.basic.bodyShape,
        politics: signupData.basic.politics,
        drinkingType: signupData.basic.drinkingType,
        diet: signupData.basic.diet,
        jobType: signupData.basic.jobType,
        assetInfo: signupData.basic.assetInfo
      }
    };

    // 3. API Call
    const resProfile = await profileStore.updateProfile(profilePayload);
    if (resProfile.error) throw new Error(resProfile.error.message || '프로필 구성을 실패했습니다.');

    const resSurvey = await profileStore.updateSurvey(surveyPayload);
    if (resSurvey.error) throw new Error(resSurvey.error.message || '가치관 설문을 저장하지 못했습니다.');

    // 4. signup Complete Flag
    await signupService.completeOnboardingStep('PROFILE', 'Y');
    await signupService.completeOnboardingStep('SURVEY', 'Y');

    showSuccessToast('프로필 완성이 완료되었습니다! 환영합니다.');
    router.replace('/');

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
  height: 100px

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
