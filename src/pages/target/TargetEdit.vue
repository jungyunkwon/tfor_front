<template>
  <q-page class="target-edit-page bg-white">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">매칭 기준 설정</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <div class="container q-pa-md">

      <!-- 로딩 -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- 조회 오류 -->
      <div v-else-if="errorMessage" class="error-box q-pa-md q-mb-lg">
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="error_outline" color="negative" size="20px" />
          <span class="text-body2 text-negative">{{ errorMessage }}</span>
        </div>
      </div>

      <template v-if="!loading">
        <!-- API 미정 안내 배너 -->
        <div class="info-box q-pa-md q-mb-xl">
          <div class="row items-start q-gutter-x-sm">
            <q-icon name="info_outline" color="grey-5" size="18px" class="q-mt-xs" />
            <div class="text-caption text-grey-6 col">
              매칭 기준 저장 기능은 현재 준비 중입니다.<br>
              설정 내용은 임시 저장되며, 서비스 업데이트 후 반영됩니다.
            </div>
          </div>
        </div>

        <!-- Step6Target.vue 동일 UI -->
        <div class="column q-gutter-y-xl">

          <!-- 원하는 조건 (다중 선택) -->
          <section>
            <label class="section-label q-mb-md">상대방에게 바라는 조건 (다중 선택)</label>
            <SelectChip
              v-model="form.targetConditions"
              :options="conditionOptions"
              multiple
            />
            <q-input
              v-model="form.targetConditionExtra"
              outlined
              dense
              placeholder="기타 추가하고 싶은 조건이 있다면?"
              class="q-mt-sm custom-input"
            />
          </section>

          <!-- 전 연애 분석 -->
          <section>
            <div class="row justify-between items-center q-mb-xs">
              <label class="section-label">전 연애에서 배운 점 / 개선하고 싶은 점</label>
            </div>
            <q-input
              v-model="form.lastRelationshipAnalysis"
              type="textarea"
              outlined
              placeholder="저번 연애에서 내가 부족했던 부분이나 깨달은 가치관을 솔직하게 적어주세요."
              rows="5"
              class="custom-input"
            />
            <p class="text-caption text-grey-6 q-mt-xs">
              과거를 돌아봄으로써 더 성숙한 다음 연애를 준비할 수 있습니다.
            </p>
          </section>

          <!-- 중요도 슬라이더 -->
          <section>
            <label class="section-label q-mb-md">조건 중요도</label>
            <div class="row items-center q-gutter-x-md">
              <span class="text-caption text-grey-6">유연하게</span>
              <q-slider
                v-model="form.importance"
                :min="1"
                :max="5"
                :step="1"
                snap
                color="primary"
                class="col"
              />
              <span class="text-caption text-grey-6">엄격하게</span>
            </div>
            <div class="text-center q-mt-xs">
              <q-chip :label="`중요도 ${form.importance}단계`" color="primary" text-color="white" dense />
            </div>
          </section>

        </div>

        <!-- 저장 버튼 -->
        <div class="q-mt-xl q-pb-xl">
          <q-btn
            label="저장하기"
            color="primary"
            unelevated
            class="full-width cta-button"
            :loading="saving"
            :disable="!isFormValid || saving"
            @click="onSave"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SelectChip from 'src/components/common/SelectChip.vue';
import { showInfoToast } from 'src/utils/notify';

const router = useRouter();

// ===== 상태값 =====
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');

const form = reactive({
  targetConditions: [],
  targetConditionExtra: '',
  importance: 3,
  lastRelationshipAnalysis: '',
});

// ===== Step6Target.vue 동일 옵션 =====
const conditionOptions = [
  { label: '비흡연자', value: 'NON_SMOKER' },
  { label: '술 안 마시는 사람', value: 'NON_DRINKER' },
  { label: '본인 직업 확실한 사람', value: 'STABLE_JOB' },
  { label: '키 175cm 이상', value: 'HEIGHT_175_PLUS' },
  { label: '키 160cm 이상', value: 'HEIGHT_160_PLUS' },
  { label: '자가 소유', value: 'OWN_HOME' },
  { label: '종교가 같아야 함', value: 'SAME_RELIGION' },
  { label: '야외 활동형', value: 'OUTDOOR' },
  { label: '다정하고 배려심 넘치는', value: 'KIND' },
];

// ===== 유효성 =====
const isFormValid = computed(() =>
  Array.isArray(form.targetConditions) &&
  form.targetConditions.length > 0 &&
  form.importance > 0 &&
  form.lastRelationshipAnalysis.trim().length > 0
);

// ===== 조회 (API 미정 - 현재 기본값으로 표시) =====
const fetchTargetCriteria = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    // TODO: API 정의 후 실제 조회 로직으로 교체
    // const { data, error } = await targetService.getMyTargetCriteria();
    // if (error) throw error;
    // form.targetConditions = data.targetConditions ?? [];
    // form.targetConditionExtra = data.targetConditionExtra ?? '';
    // form.importance = data.importance ?? 3;
    // form.lastRelationshipAnalysis = data.lastRelationshipAnalysis ?? '';
  } catch (e) {
    console.error(e);
    errorMessage.value = '매칭 기준 정보를 불러오지 못했어요.';
  } finally {
    loading.value = false;
  }
};

// ===== 저장 (API 미정 - 저장 차단) =====
const onSave = async () => {
  if (!isFormValid.value || saving.value) return;

  // TODO: API 정의 후 실제 저장 로직으로 교체
  // 현재는 API 미정 상태이므로 안내만 표시
  showInfoToast('매칭 기준 저장 기능은 현재 준비 중이에요.');
  // saving.value = true;
  // try {
  //   const { data, error } = await targetService.saveMyTargetCriteria({ ...form });
  //   if (error) throw error;
  //   showSuccessToast('매칭 기준이 저장되었습니다.');
  //   router.back();
  // } catch (e) {
  //   showErrorToast('저장에 실패했어요. 다시 시도해주세요.');
  // } finally {
  //   saving.value = false;
  // }
};

const onBack = () => router.back();

onMounted(() => {
  fetchTargetCriteria();
});
</script>

<style scoped lang="scss">
.target-edit-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

.container {
  padding-top: 24px;
}

.section-label {
  display: block;
  font-weight: 700;
  color: #1D1D1D;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.cta-button {
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
}

.info-box {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eeeeee;
}

.error-box {
  background: #fff5f5;
  border-radius: 12px;
  border: 1px solid #ffd0d0;
}
</style>
