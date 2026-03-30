<template>
  <div class="step-basic q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">본인의 기본정보를</h1>
      <h1 class="text-h5 text-weight-bold">입력해 주세요</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 닉네임 -->
      <section>
        <label class="section-label">닉네임</label>
        <q-input
          :model-value="form.nickname"
          @update:model-value="updateField('nickname', $event)"
          outlined
          dense
          placeholder="사용하실 닉네임을 입력하세요"
          class="auth-input"
        />
      </section>

      <!-- 성별 (SelectChip) -->
      <section>
        <label class="section-label">성별</label>
        <SelectChip
          :model-value="form.gender_cd"
          :options="genderOptions"
          :multiple="false"
          @update:model-value="updateField('gender_cd', $event)"
        />
      </section>

      <!-- 출생연도 / 키 -->
      <div class="row q-col-gutter-x-md">
        <section class="col-6">
          <label class="section-label">출생연도</label>
          <q-input
            :model-value="form.birthYear"
            @update:model-value="updateField('birthYear', Number($event))"
            type="number"
            outlined
            dense
            placeholder="1995"
            class="auth-input"
          />
        </section>

        <section class="col-6">
          <label class="section-label">키 (cm)</label>
          <q-input
            :model-value="form.height"
            @update:model-value="updateField('height', Number($event))"
            type="number"
            outlined
            dense
            placeholder="175"
            class="auth-input"
          />
        </section>
      </div>

      <!-- 거주지역 (종속 필드) -->
      <section>
        <label class="section-label">거주지역</label>
        <div class="row q-col-gutter-x-sm">
          <q-select
            :model-value="form.region"
            :options="regionOptions"
            @update:model-value="onRegionChange"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="col-6 auth-input"
          />
          <q-select
            :model-value="form.subregion"
            :options="currentSubregions"
            @update:model-value="updateField('subregion', $event)"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            :disable="!form.region"
            class="col-6 auth-input"
          />
        </div>
      </section>

      <!-- 체형 (SelectChip) -->
      <section>
        <label class="section-label">체형</label>
        <SelectChip
          :model-value="form.bodyShape"
          :options="bodyShapeOptions"
          :multiple="false"
          @update:model-value="updateField('bodyShape', $event)"
        />
      </section>

      <!-- 직업 / 학력 / 종교 (etc 지원) -->
      <div class="column q-gutter-y-md">
        <section>
          <label class="section-label">직업</label>
          <q-select
            :model-value="form.job"
            :options="jobOptions"
            @update:model-value="updateField('job', $event)"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="auth-input"
          />
          <q-input
            v-if="form.job === 'ETC'"
            :model-value="form.job_etc"
            @update:model-value="updateField('job_etc', $event)"
            outlined
            dense
            placeholder="직업을 입력해주세요"
            class="q-mt-xs auth-input"
          />
        </section>

        <section>
          <label class="section-label">학력</label>
          <q-select
            :model-value="form.education"
            :options="educationOptions"
            @update:model-value="updateField('education', $event)"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="auth-input"
          />
          <q-input
            v-if="form.education === 'ETC' || form.education === 'doctor'"
            :model-value="form.education_etc"
            @update:model-value="updateField('education_etc', $event)"
            outlined
            dense
            placeholder="상세 학력을 입력해주세요"
            class="q-mt-xs auth-input"
          />
        </section>

        <section>
          <label class="section-label">종교</label>
          <q-select
            :model-value="form.religion"
            :options="religionOptions"
            @update:model-value="updateField('religion', $event)"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="auth-input"
          />
          <q-input
            v-if="form.religion === 'OTHER'"
            :model-value="form.religion_etc"
            @update:model-value="updateField('religion_etc', $event)"
            outlined
            dense
            placeholder="종교를 입력해주세요"
            class="q-mt-xs auth-input"
          />
        </section>
      </div>

      <!-- 흡연 여부 (SelectChip) -->
      <section>
        <label class="section-label">흡연 여부</label>
        <SelectChip
          :model-value="form.smoking"
          :options="smokingOptions"
          :multiple="false"
          @update:model-value="updateField('smoking', $event)"
        />
      </section>

      <!-- 음주 여부 -->
      <section>
        <label class="section-label">음주 빈도</label>
        <q-btn-toggle
          :model-value="form.drinking"
          @update:model-value="updateField('drinking', $event)"
          unelevated
          no-caps
          rounded
          class="full-width auth-toggle"
          toggle-color="primary"
          color="grey-2"
          text-color="dark"
          toggle-text-color="white"
          :options="drinkingFreqOptions"
        />
      </section>

      <!-- 선호 주종 (SelectChip Multiple) -->
      <section>
        <label class="section-label">선호 주종 (다중)</label>
        <SelectChip
          :model-value="form.drinkingType"
          :options="drinkingTypeOptions"
          multiple
          @update:model-value="updateField('drinkingType', $event)"
        />
      </section>

      <!-- 주식 (SelectChip Limit 2) -->
      <section>
        <label class="section-label">주식 투자 성향 (최대 2개)</label>
        <SelectChip
          :model-value="form.stocks"
          :options="stockStyleOptions"
          multiple
          :max="2"
          @update:model-value="updateField('stocks', $event)"
        />
      </section>

      <!-- 경제 활동 구분 (Conditional) -->
      <section>
        <label class="section-label">경제 활동 구분</label>
        <q-btn-toggle
          :model-value="form.jobType"
          @update:model-value="updateField('jobType', $event)"
          unelevated
          no-caps
          rounded
          class="full-width auth-toggle q-mb-md"
          toggle-color="primary"
          color="grey-2"
          text-color="dark"
          toggle-text-color="white"
          :options="jobTypeStatusOptions"
        />

        <div v-if="form.jobType === 'employee'" class="row items-center q-gutter-x-sm">
          <q-input
            :model-value="form.salary_amount"
            @update:model-value="updateField('salary_amount', Number($event))"
            type="number"
            outlined
            dense
            class="auth-input col"
            suffix="만원"
          />
          <span class="text-caption">연봉(기본급)</span>
        </div>

        <div v-if="form.jobType === 'business'" class="column q-gutter-y-sm">
          <q-input
            :model-value="form.business_type"
            @update:model-value="updateField('business_type', $event)"
            outlined
            dense
            class="auth-input"
            placeholder="어떤 사업을 하시나요? (예: 요식업, IT)"
          />
          <div class="row items-center q-gutter-x-sm">
            <q-input
              :model-value="form.revenue_amount"
              @update:model-value="updateField('revenue_amount', Number($event))"
              type="number"
              outlined
              dense
              class="auth-input col"
              suffix="천만원"
            />
            <span class="text-caption">연 매출</span>
          </div>
        </div>
      </section>

      <!-- 자산 정보 (SelectChip Multiple) -->
      <section>
        <label class="section-label">자산 정보 (다중)</label>
        <SelectChip
          :model-value="form.assetInfo"
          :options="assetOptions"
          multiple
          @update:model-value="updateField('assetInfo', $event)"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SelectChip from 'src/components/common/SelectChip.vue';
import {
  BODY_SHAPE_OPTIONS,
  EDUCATION_OPTIONS,
  JOB_TYPE_STATUS_OPTIONS,
  JOB_OPTIONS,
  DRINKING_TYPE_OPTIONS,
  DRINKING_FREQ_OPTIONS,
  REGION_OPTIONS,
  SUBREGION_OPTIONS,
  RELIGION_OPTIONS,
  ASSET_OPTIONS,
  SMOKING_OPTIONS,
  STOCK_OPTIONS
} from 'src/enums/code';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const genderOptions = [
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' }
];

const bodyShapeOptions = BODY_SHAPE_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const educationOptions = EDUCATION_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const jobOptions = JOB_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const drinkingTypeOptions = DRINKING_TYPE_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const drinkingFreqOptions = DRINKING_FREQ_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const smokingOptions = SMOKING_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const regionOptions = REGION_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const religionOptions = RELIGION_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const assetOptions = ASSET_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const stockStyleOptions = STOCK_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const jobTypeStatusOptions = JOB_TYPE_STATUS_OPTIONS.map(o => ({ label: o.name, value: o.code }));

const currentSubregions = computed(() => {
  if (!form.value.region) return [];
  const list = SUBREGION_OPTIONS[form.value.region] || [];
  return list.map(o => ({ label: o.name, value: o.code }));
});

const onRegionChange = (val) => {
  emit('update:modelValue', {
    ...form.value,
    region: val,
    subregion: null
  });
};

const isValid = computed(() => {
  const m = form.value;
  
  // 기본 필수 체크
  const baseValid = !!(
    m.nickname &&
    m.gender_cd &&
    m.birthYear &&
    m.region &&
    m.subregion &&
    m.height &&
    m.bodyShape &&
    m.job &&
    m.education &&
    m.religion &&
    m.smoking &&
    m.drinking &&
    m.jobType &&
    Array.isArray(m.assetInfo) && m.assetInfo.length > 0 &&
    Array.isArray(m.stocks) && m.stocks.length > 0
  );

  if (!baseValid) return false;

  // 기타 입력 체크
  if (m.job === 'ETC' && !m.job_etc) return false;
  if ((m.education === 'ETC' || m.education === 'doctor') && !m.education_etc) return false;
  if (m.religion === 'OTHER' && !m.religion_etc) return false;

  // 경제활동 상세 체크
  if (m.jobType === 'employee') {
    if (!m.salary_amount) return false;
  } else if (m.jobType === 'business') {
    if (!m.business_type || !m.revenue_amount) return false;
  }

  return true;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 600
  margin-bottom: 8px
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
</style>