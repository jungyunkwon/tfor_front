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

        <!-- 거주지역 / 상세지역 -->
        <div class="row q-col-gutter-x-md">
          <section class="col-6">
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
          <section class="col-6">
            <label class="section-label">상세지역 (시/군/구)</label>
            <q-input
              v-model="form.regionDetailCd"
              outlined
              dense
              placeholder="강남구"
              class="custom-input"
            />
          </section>
        </div>

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
            <label class="section-label">직업 상세 설명</label>
            <q-input
              v-model="form.jobDetailText"
              outlined
              dense
              placeholder="구체적인 직무나 하시는 일을 적어주세요"
              class="custom-input"
            />
          </section>

          <section>
            <label class="section-label">고용 형태</label>
            <q-select
              v-model="form.employmentTypeCd"
              :options="employmentOptions"
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

        <!-- 자산 정보 -->
        <section>
          <label class="section-label">자산 정보(선택)</label>
          <q-input
            v-model="form.assetInfoText"
            outlined
            dense
            placeholder="예: 자차 보유, 자가 거주 등"
            class="custom-input"
          />
        </section>

        <!-- 체형 / 종교 / 혼인상태 -->
        <div class="column q-gutter-y-md">
          <section>
            <label class="section-label">체형</label>
            <q-select
              v-model="form.bodyTypeCd"
              :options="bodyTypeOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>

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

        <!-- 정치성향 / 식습관 -->
        <div class="row q-col-gutter-x-md">
          <section class="col-6">
            <label class="section-label">정치 성향</label>
            <q-select
              v-model="form.politicalOrientationCd"
              :options="politicalOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>
          <section class="col-6">
            <label class="section-label">식습관</label>
            <q-select
              v-model="form.dietStyleCd"
              :options="dietOptions"
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

        <!-- 흡연 / 음주 / 자녀 -->
        <div class="column q-gutter-y-md">
          <section>
            <label class="section-label">흡연 여부</label>
            <SelectChip
              v-model="form.smokingYn"
              :options="smokingOptions"
              :multiple="false"
            />
          </section>

          <section>
            <label class="section-label">주로 즐기는 주종</label>
            <q-select
              v-model="form.drinkTypeCd"
              :options="drinkTypeOptions"
              outlined
              dense
              emit-value
              map-options
              class="custom-input"
              behavior="dialog"
            />
          </section>

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

          <section>
            <label class="section-label">자녀 여부</label>
            <SelectChip
              v-model="form.childrenYn"
              :options="yesNoOptions"
              :multiple="false"
            />
          </section>
        </div>

        <!-- 연락처 정보 (매칭 성공 시 공개용) -->
        <div class="q-pa-md bg-grey-1 rounded-borders q-mb-md">
          <div class="text-subtitle2 q-mb-sm text-weight-bold">연락처 정보 (매칭 성사 시 공개)</div>
          <div class="column q-gutter-y-sm">
            <q-input
              v-model="form.contactPhone"
              outlined
              dense
              label="전화번호"
              placeholder="010-0000-0000"
              class="bg-white"
            />
            <q-input
              v-model="form.contactKakaoId"
              outlined
              dense
              label="카카오톡 ID"
              placeholder="kakao_id"
              class="bg-white"
            />
            <div class="row items-center justify-between q-mt-xs">
              <span class="text-caption text-grey-7">연락처 자동 공개 동의</span>
              <q-toggle v-model="form.contactOpenYn" true-value="Y" false-value="N" />
            </div>
          </div>
        </div>

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
            :disable="saving"
            @click="onSave"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
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
  jobDetailText: '',
  employmentTypeCd: '',
  educationLevelCd: '',
  regionCd: '',
  regionDetailCd: '',
  introText: '',
  smokingYn: 'N',
  drinkingCd: '',
  drinkTypeCd: '',
  dietStyleCd: '',
  bodyTypeCd: '',
  politicalOrientationCd: '',
  religionCd: '',
  maritalStatusCd: '',
  childrenYn: 'N',
  assetInfoText: '',
  contactPhone: '',
  contactKakaoId: '',
  contactOpenYn: 'N',
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
const bodyTypeOptions = ref([]);
const employmentOptions = ref([]);
const politicalOptions = ref([]);
const drinkTypeOptions = ref([]);
const dietOptions = ref([]);

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
      drkRes,
      bodyRes,
      empRes,
      polRes,
      drkTypeRes,
      dietRes
    ] = await Promise.all([
      commonCodeService.getCodeListByGroup('GENDER'),
      commonCodeService.getCodeListByGroup('REGION'),
      commonCodeService.getCodeListByGroup('JOB'),
      commonCodeService.getCodeListByGroup('EDUCATION_LEVEL'),
      commonCodeService.getCodeListByGroup('RELIGION'),
      commonCodeService.getCodeListByGroup('MARITAL_STATUS'),
      commonCodeService.getCodeListByGroup('SMOKING'),
      commonCodeService.getCodeListByGroup('DRINKING'),
      commonCodeService.getCodeListByGroup('BODY_TYPE'),
      commonCodeService.getCodeListByGroup('EMPLOYMENT_TYPE'),
      commonCodeService.getCodeListByGroup('POLITICAL_ORIENTATION'),
      commonCodeService.getCodeListByGroup('DRINK_TYPE'),
      commonCodeService.getCodeListByGroup('DIET_STYLE'),
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
    bodyTypeOptions.value = mapCodes(bodyRes);
    employmentOptions.value = mapCodes(empRes);
    politicalOptions.value = mapCodes(polRes);
    drinkTypeOptions.value = mapCodes(drkTypeRes);
    dietOptions.value = mapCodes(dietRes);

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
      form.jobDetailText = data.job_detail_text || '';
      form.employmentTypeCd = data.employment_type_cd || '';
      form.educationLevelCd = data.education_level_cd || '';
      form.regionCd = data.region_cd || '';
      form.regionDetailCd = data.region_detail_cd || '';
      form.introText = data.intro_text || '';
      form.smokingYn = data.smoking_yn || 'N';
      form.drinkingCd = data.drinking_cd || '';
      form.drinkTypeCd = data.drink_type_cd || '';
      form.dietStyleCd = data.diet_style_cd || '';
      form.bodyTypeCd = data.body_type_cd || '';
      form.politicalOrientationCd = data.political_orientation_cd || '';
      form.religionCd = data.religion_cd || '';
      form.maritalStatusCd = data.marital_status_cd || '';
      form.childrenYn = data.children_yn || 'N';
      form.assetInfoText = data.asset_info_text || '';
      form.contactPhone = data.contact_phone || '';
      form.contactKakaoId = data.contact_kakao_id || '';
      form.contactOpenYn = data.contact_open_yn || 'N';
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
  // Validation
  if (!form.nickname) {
    $q.notify({ type: 'negative', message: '닉네임을 입력해 주세요.' });
    return;
  }
  if (!form.genderCd) {
    $q.notify({ type: 'negative', message: '성별을 선택해 주세요.' });
    return;
  }
  if (!form.birthYear || form.birthYear < 1900 || form.birthYear > 2100) {
    $q.notify({ type: 'negative', message: '출생연도를 올바르게 입력해 주세요.' });
    return;
  }
  if (!form.heightCm || form.heightCm < 80 || form.heightCm > 250) {
    $q.notify({ type: 'negative', message: '키를 올바르게 입력해 주세요.' });
    return;
  }
  if (!form.regionCd) {
    $q.notify({ type: 'negative', message: '거주지역을 선택해 주세요.' });
    return;
  }
  if (!form.jobName) {
    $q.notify({ type: 'negative', message: '직업을 선택해 주세요.' });
    return;
  }
  if (!form.educationLevelCd) {
    $q.notify({ type: 'negative', message: '학력을 선택해 주세요.' });
    return;
  }

  saving.value = true;
  try {
    // Mapping camelCase back to snake_case for service/DB
    const payload = {
      nickname: form.nickname,
      gender_cd: form.genderCd,
      birth_year: form.birthYear,
      height_cm: form.heightCm,
      job_name: form.jobName,
      job_detail_text: form.jobDetailText,
      employment_type_cd: form.employmentTypeCd,
      education_level_cd: form.educationLevelCd,
      region_cd: form.regionCd,
      region_detail_cd: form.regionDetailCd,
      intro_text: form.introText,
      smoking_yn: form.smokingYn,
      drinking_cd: form.drinkingCd,
      drink_type_cd: form.drinkTypeCd,
      diet_style_cd: form.dietStyleCd,
      body_type_cd: form.bodyTypeCd,
      political_orientation_cd: form.politicalOrientationCd,
      religion_cd: form.religionCd,
      marital_status_cd: form.maritalStatusCd,
      children_yn: form.childrenYn,
      asset_info_text: form.assetInfoText,
      contact_phone: form.contactPhone,
      contact_kakao_id: form.contactKakaoId,
      contact_open_yn: form.contactOpenYn,
      profile_open_yn: form.profileOpenYn,
    };

    const { error } = await profileService.saveMeProfile(payload);
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
