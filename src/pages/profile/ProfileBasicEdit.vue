<template>
  <q-page class="profile-edit-page bg-white">
    <!-- Header -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">기본정보 수정</q-toolbar-title>
        <div style="width: 48px"></div> <!-- Balance for centering title -->
      </q-toolbar>
    </q-header>

    <!-- Content -->
    <div class="q-pa-md container">
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else class="q-col-gutter-y-lg">
        <!-- 닉네임 -->
        <section>
          <label class="section-label">닉네임</label>
          <q-input
            v-model="form.nickname"
            outlined
            dense
            placeholder="닉네임을 입력하세요"
            class="custom-input"
            :rules="[val => !!val || '닉네임은 필수입니다']"
            hide-bottom-space
          />
        </section>

        <!-- 성별 -->
        <section>
          <label class="section-label">성별</label>
          <SelectChip
            v-model="form.genderCd"
            :options="genderOptions"
            :multiple="false"
          />
        </section>

        <!-- 출생연도 / 키 -->
        <div class="row q-col-gutter-x-md">
          <section class="col-6">
            <label class="section-label">출생연도</label>
            <q-input
              v-model.number="form.birthYear"
              type="number"
              outlined
              dense
              placeholder="1995"
              class="custom-input"
              :rules="[
                val => !!val || '필수',
                val => (val >= 1900 && val <= 2100) || '1900~2100 사이'
              ]"
              hide-bottom-space
            />
          </section>

          <section class="col-6">
            <label class="section-label">키 (cm)</label>
            <q-input
              v-model.number="form.heightCm"
              type="number"
              outlined
              dense
              placeholder="175"
              class="custom-input"
              :rules="[
                val => !!val || '필수',
                val => (val >= 80 && val <= 250) || '80~250 사이'
              ]"
              hide-bottom-space
            />
          </section>
        </div>

        <!-- 거주지역 -->
        <section>
          <label class="section-label">거주지역</label>
          <q-select
            v-model="form.regionCd"
            :options="regionOptions"
            outlined
            dense
            emit-value
            map-options
            class="custom-input"
            behavior="dialog"
          />
        </section>

        <!-- 직업 / 학력 -->
        <div class="column q-gutter-y-md">
          <section>
            <label class="section-label">직업</label>
            <q-select
              v-model="form.jobName"
              :options="jobOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>

          <section>
            <label class="section-label">학력</label>
            <q-select
              v-model="form.educationLevelCd"
              :options="educationOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>
        </div>

        <!-- 종교 / 혼인상태 -->
        <div class="column q-gutter-y-md">
          <section>
            <label class="section-label">종교</label>
            <q-select
              v-model="form.religionCd"
              :options="religionOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>

          <section>
            <label class="section-label">혼인 상태</label>
            <q-select
              v-model="form.maritalStatusCd"
              :options="maritalStatusOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>
        </div>

        <!-- 자기소개 -->
        <section>
          <label class="section-label">자기소개</label>
          <q-input
            v-model="form.introText"
            type="textarea"
            outlined
            dense
            placeholder="자신을 자유롭게 소개해 주세요"
            class="custom-input"
            rows="3"
          />
        </section>

        <!-- 흡연 여부 -->
        <section>
          <label class="section-label">흡연 여부</label>
          <SelectChip
            v-model="form.smokingYn"
            :options="smokingOptions"
            :multiple="false"
          />
        </section>

        <!-- 음주 빈도 -->
        <section>
          <label class="section-label">음주 빈도</label>
          <q-btn-toggle
            v-model="form.drinkingCd"
            unelevated
            no-caps
            rounded
            class="full-width custom-toggle"
            toggle-color="primary"
            color="grey-2"
            text-color="dark"
            toggle-text-color="white"
            :options="drinkingOptions"
          />
        </section>

        <!-- 자녀 여부 -->
        <section>
          <label class="section-label">자녀 여부</label>
          <SelectChip
            v-model="form.childrenYn"
            :options="yesNoOptions"
            :multiple="false"
          />
        </section>

        <!-- 프로필 공개 여부 -->
        <section>
          <label class="section-label">프로필 공개 여부</label>
          <SelectChip
            v-model="form.profileOpenYn"
            :options="yesNoOptions"
            :multiple="false"
          />
        </section>

        <div class="q-pt-lg q-pb-xl">
          <q-btn
            label="저장하기"
            color="primary"
            class="full-width cta-button"
            unelevated
            height="48px"
            :loading="saving"
            :disable="!isFormValid || saving"
            @click="onSave"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import SelectChip from 'src/components/common/SelectChip.vue';
import { profileService } from 'src/services/profileService';
import { commonCodeService } from 'src/services/commonCodeService';

const $q = useQuasar();
const router = useRouter();

// State
const loading = ref(true);
const saving = ref(false);
const userProfileId = ref('');

const form = reactive({
  nickname: '',
  genderCd: '',
  birthYear: null,
  heightCm: null,
  jobName: '',
  educationLevelCd: '',
  regionCd: '',
  introText: '',
  smokingYn: 'N',
  drinkingCd: '',
  religionCd: '',
  maritalStatusCd: '',
  childrenYn: 'N',
  profileOpenYn: 'Y',
});

// Options
const genderOptions = ref([]);
const regionOptions = ref([]);
const jobOptions = ref([]);
const educationOptions = ref([]);
const religionOptions = ref([]);
const maritalStatusOptions = ref([]);
const smokingOptions = ref([]);
const drinkingOptions = ref([]);
const yesNoOptions = [
  { label: '예', value: 'Y' },
  { label: '아니오', value: 'N' }
];

// Logic
const fetchCodes = async () => {
  try {
    const [
      genderRes, 
      regionRes, 
      jobRes, 
      eduRes, 
      relRes, 
      marRes, 
      smkRes, 
      drkRes
    ] = await Promise.all([
      commonCodeService.getCodeListByGroup('GENDER'),
      commonCodeService.getCodeListByGroup('REGION'),
      commonCodeService.getCodeListByGroup('JOB'),
      commonCodeService.getCodeListByGroup('EDUCATION_LEVEL'),
      commonCodeService.getCodeListByGroup('RELIGION'),
      commonCodeService.getCodeListByGroup('MARITAL_STATUS'),
      commonCodeService.getCodeListByGroup('SMOKING'),
      commonCodeService.getCodeListByGroup('DRINKING'),
    ]);

    const mapCodes = (res) => (res.data?.codes || []).map(c => ({ label: c.codeName, value: c.codeValue }));

    genderOptions.value = mapCodes(genderRes);
    regionOptions.value = mapCodes(regionRes);
    jobOptions.value = mapCodes(jobRes);
    educationOptions.value = mapCodes(eduRes);
    religionOptions.value = mapCodes(relRes);
    maritalStatusOptions.value = mapCodes(marRes);
    smokingOptions.value = mapCodes(smkRes);
    drinkingOptions.value = mapCodes(drkRes);
  } catch (e) {
    console.error('Failed to load codes', e);
    $q.notify({ type: 'negative', message: '코드 목록을 불러오지 못했어요.' });
  }
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    const { data, error } = await profileService.getMeProfile();
    if (error) throw error;

    if (data) {
      userProfileId.value = data.user_profile_id;
      // Mapping snake_case from DB to camelCase for form
      form.nickname = data.nickname || '';
      form.genderCd = data.gender_cd || '';
      form.birthYear = data.birth_year;
      form.heightCm = data.height_cm;
      form.jobName = data.job_name || '';
      form.educationLevelCd = data.education_level_cd || '';
      form.regionCd = data.region_cd || '';
      form.introText = data.intro_text || '';
      form.smokingYn = data.smoking_yn || 'N';
      form.drinkingCd = data.drinking_cd || '';
      form.religionCd = data.religion_cd || '';
      form.maritalStatusCd = data.marital_status_cd || '';
      form.childrenYn = data.children_yn || 'N';
      form.profileOpenYn = data.profile_open_yn || 'Y';
    }
  } catch (e) {
    console.error('Failed to load profile', e);
    $q.notify({ type: 'negative', message: '기본정보를 불러오지 못했어요.' });
  } finally {
    loading.value = false;
  }
};

const onSave = async () => {
  saving.value = true;
  try {
    // Mapping camelCase back to snake_case for service/DB
    const payload = {
      nickname: form.nickname,
      gender_cd: form.genderCd,
      birth_year: form.birthYear,
      height_cm: form.heightCm,
      job_name: form.jobName,
      education_level_cd: form.educationLevelCd,
      region_cd: form.regionCd,
      intro_text: form.introText,
      smoking_yn: form.smokingYn,
      drinking_cd: form.drinkingCd,
      religion_cd: form.religionCd,
      marital_status_cd: form.maritalStatusCd,
      children_yn: form.childrenYn,
      profile_open_yn: form.profileOpenYn,
    };

    const { data, error } = await profileService.saveMeProfile(payload);
    if (error) throw error;

    $q.notify({ type: 'positive', message: '기본정보가 저장되었습니다.' });
    router.back();
  } catch (e) {
    console.error('Failed to save profile', e);
    $q.notify({ type: 'negative', message: '기본정보 저장에 실패했어요.' });
  } finally {
    saving.value = false;
  }
};

const onBack = () => {
  router.back();
};

const isFormValid = computed(() => {
  return (
    form.nickname &&
    form.genderCd &&
    form.birthYear >= 1900 && form.birthYear <= 2100 &&
    form.heightCm >= 80 && form.heightCm <= 250
  );
});

onMounted(async () => {
  await fetchCodes();
  await fetchProfile();
});
</script>

<style scoped lang="scss">
.profile-edit-page {
  max-width: 600px;
  margin: 0 auto;
}

.container {
  padding-top: 24px;
}

.section-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1D1D1D;
  font-size: 0.95rem;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.custom-toggle {
  border: 1px solid #eeeeee;
  height: 48px;
  :deep(.q-btn) {
    border-radius: 8px;
  }
}

.cta-button {
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
}
</style>
