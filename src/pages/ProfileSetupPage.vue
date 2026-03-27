<template>
  <q-page class="profile-setup-page bg-auth-bg">
    <div class="profile-setup-container q-pa-md">
      <!-- 헤더 -->
      <div class="header-section text-center q-mb-xl q-pt-md">
        <h2 class="text-h5 font-weight-bold text-dark q-mb-sm">
          프로필 완성하기 ({{ step }} / 4)
        </h2>
        <p class="text-grey-7">{{ stepTitles[step - 1] }}</p>
      </div>

      <!-- 본문 -->
      <div class="body-section q-mb-xl">
        <keep-alive>
          <component
            :is="currentStepComponent"
            v-model="formData"
            @validation="onValidationChange"
          />
        </keep-alive>
      </div>
    </div>

    <!-- 하단 고정 버튼 -->
    <div class="footer-section fixed-bottom bg-white q-pa-md border-top">
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
            :label="step === 4 ? '심사 상태 확인' : '다음 →'"
            color="primary"
            class="full-width q-py-md hover-scale"
            unelevated
            :disable="!isCurrentStepValid"
            @click="nextStep"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from 'src/stores/ProfileStore';
import { showErrorToast, showSuccessToast } from 'src/utils/notify';

import SetupBasic from 'src/components/profile/SetupBasic.vue';
import SetupSurvey from 'src/components/profile/SetupSurvey.vue';
import SetupPhoto from 'src/components/profile/SetupPhoto.vue';
import SetupPreview from 'src/components/profile/SetupPreview.vue';

const router = useRouter();
const profileStore = useProfileStore();
const step = ref(1);
const isCurrentStepValid = ref(false);
const isSaving = ref(false);

const stepTitles = [
  '세부 내용을 입력해주세요',
  '가치관과 성향을 알려주세요',
  '가장 매력적인 사진을 올려주세요',
  '프로필 미리보기'
];

const steps = [
  SetupBasic,
  SetupSurvey,
  SetupPhoto,
  SetupPreview
];

const currentStepComponent = computed(() => steps[step.value - 1]);

// 폼 전체를 관리할 데이터 객체
const formData = reactive({
  basic: {},
  survey: {},
  photo: {},
});

const onValidationChange = (isValid) => {
  isCurrentStepValid.value = isValid;
};

const nextStep = async () => {
  if (isSaving.value) return;

  isSaving.value = true;
  try {
    if (step.value === 1) {
      const { error } = await profileStore.updateProfile(formData.basic);
      if (error) throw new Error(error.message || '기본 정보 저장 중 오류가 발생했습니다.');
      showSuccessToast('기본 정보가 저장되었습니다.');
    } else if (step.value === 2) {
      const { error } = await profileStore.updateSurvey(formData.survey);
      if (error) throw new Error(error.message || '설문 응답 저장 중 오류가 발생했습니다.');
      showSuccessToast('설문 응답이 저장되었습니다.');
    } else if (step.value === 3) {
      // 사진 메타 데이터 저장 (실제 업로드 및 파일 경로는 uploader 에서 반환받았다고 가정)
      const { error } = await profileStore.updatePhotos(formData.photo);
      if (error) throw new Error(error.message || '사진 정보 저장 중 오류가 발생했습니다.');
      showSuccessToast('사진 정보가 등록되었습니다.');
    }
    
    if (step.value < 4) {
      step.value++;
      isCurrentStepValid.value = false;
    } else {
      // 최종 확인
      showSuccessToast('모든 정보가 등록되었습니다! 심사 완료 후 서비스를 이용하실 수 있습니다.');
      router.push('/');
    }
  } catch (err) {
    showErrorToast(err.message || '데이터 저장 중 오류가 발생했습니다.');
  } finally {
    isSaving.value = false;
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
    isCurrentStepValid.value = true;
  }
};

onMounted(async () => {
  // 실제 API 연동 시 주석 해제하여 진행된 스텝 자동 파악
  // const res = await profileStore.loadProfile();
  // if (res.data) {
  //    formData.basic = { ...res.data.profile };
  //    // 여기서 데이터 기반으로 step 자동 이동 로직 추가 가능
  // }
});
</script>

<style lang="sass" scoped>
.profile-setup-page
  min-height: 100vh
  background-color: var(--color-bg, #f5f6fa) // 디자인 토큰이 있다면 교체
  padding-bottom: 120px

.profile-setup-container
  max-width: 600px
  margin: 0 auto

.border-top
  border-top: 1px solid var(--color-border, #e0e0e0)

.max-width-container
  max-width: 600px
  margin: 0 auto
</style>
