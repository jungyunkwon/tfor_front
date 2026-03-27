<template>
  <div class="step-basic q-pa-md">
    <div class="header-section q-mb-xl">
      <h1 class="text-h5 text-weight-bold q-mb-sm">기본정보를 입력해주세요</h1>
      <p class="text-grey-7">프로필과 매칭에 활용됩니다</p>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 닉네임 -->
      <section>
        <label class="section-label">닉네임</label>
        <q-input 
          v-model="modelValue.nickname" 
          outlined 
          dense 
          placeholder="사용하실 닉네임을 입력하세요" 
          class="auth-input"
        />
      </section>

      <!-- 성별 -->
      <section>
        <label class="section-label">성별</label>
        <div class="row q-gutter-x-lg">
          <q-radio v-model="modelValue.gender_cd" val="MALE" label="남성" color="primary" />
          <q-radio v-model="modelValue.gender_cd" val="FEMALE" label="여성" color="primary" />
        </div>
      </section>

      <!-- 출생연도 & 키 -->
      <div class="row q-col-gutter-x-md">
        <section class="col-6">
          <label class="section-label">출생연도</label>
          <q-input 
            v-model.number="modelValue.birthYear" 
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
            v-model.number="modelValue.height" 
            type="number" 
            outlined 
            dense 
            placeholder="175" 
            class="auth-input"
          />
        </section>
      </div>

      <!-- 거주지역 -->
      <section>
        <label class="section-label">거주지역</label>
        <q-select
          v-model="modelValue.region"
          :options="regionOptions"
          outlined
          dense
          emit-value
          map-options
          placeholder="거주하시는 지역을 선택하세요"
          class="auth-input"
        />
      </section>

      <!-- 체형 -->
      <section>
        <label class="section-label">체형</label>
        <RadioCard 
          v-model="modelValue.bodyShape"
          :options="bodyShapeOptions"
        />
      </section>

      <!-- 직업 & 학력 -->
      <div class="row q-col-gutter-x-md">
        <section class="col-6">
          <label class="section-label">직업</label>
          <q-select
            v-model="modelValue.job"
            :options="jobTypeOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="직업 분류"
          />
        </section>
        <section class="col-6">
          <label class="section-label">학력</label>
          <q-select
            v-model="modelValue.education"
            :options="educationOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="학력"
          />
        </section>
      </div>

      <!-- 종교 & 정치성향 -->
      <div class="row q-col-gutter-x-md">
        <section class="col-6">
          <label class="section-label">종교</label>
          <q-select
            v-model="modelValue.religion"
            :options="religionOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="종교"
          />
        </section>
        <section class="col-6">
          <label class="section-label">정치성향</label>
          <q-select
            v-model="modelValue.politics"
            :options="politicsOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="성향"
          />
        </section>
      </div>

      <!-- 흡연 & 음주 -->
      <section>
        <label class="section-label">흡연 여부</label>
        <div class="row q-gutter-x-sm">
          <q-btn 
            v-for="opt in smokingOptions" 
            :key="opt.value"
            :label="opt.label"
            unelevated
            class="col"
            :color="modelValue.smoking === opt.value ? 'primary' : 'grey-2'"
            :text-color="modelValue.smoking === opt.value ? 'white' : 'dark'"
            @click="modelValue.smoking = opt.value"
          />
        </div>
      </section>

      <section>
        <label class="section-label">음주 여부</label>
        <div class="row q-gutter-x-sm">
          <q-btn 
            v-for="opt in drinkingFreqOptions" 
            :key="opt.value"
            :label="opt.label"
            unelevated
            class="col"
            :color="modelValue.drinking === opt.value ? 'primary' : 'grey-2'"
            :text-color="modelValue.drinking === opt.value ? 'white' : 'dark'"
            @click="modelValue.drinking = opt.value"
          />
        </div>
      </section>

      <!-- 주종 & 식습관 -->
      <div class="row q-col-gutter-x-md" v-if="modelValue.drinking !== 'none'">
        <section class="col-12">
          <label class="section-label">선호하는 주종</label>
          <q-select
            v-model="modelValue.drinkingType"
            :options="drinkingTypeOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="주종 선택"
          />
        </section>
      </div>
      
      <section>
        <label class="section-label">식습관</label>
        <q-select
          v-model="modelValue.diet"
          :options="dietOptions"
          outlined
          dense
          emit-value
          map-options
          placeholder="주로 선호하는 음식"
        />
      </section>

      <!-- 직장인/사업자 여부 -->
      <section>
        <label class="section-label">경제 활동 구분</label>
        <div class="row q-gutter-x-sm">
          <q-btn 
            v-for="opt in jobTypeOptions" 
            :key="opt.value"
            :label="opt.label"
            unelevated
            class="col"
            :color="modelValue.jobType === opt.value ? 'primary' : 'grey-2'"
            :text-color="modelValue.jobType === opt.value ? 'white' : 'dark'"
            @click="modelValue.jobType = opt.value"
          />
        </div>
      </section>

      <!-- 자산 정보 -->
      <section>
        <label class="section-label">자산 정보 <span class="text-caption text-grey-6">(집, 차 등 보유 여부)</span></label>
        <q-select
          v-model="modelValue.assetInfo"
          :options="assetOptions"
          outlined
          dense
          emit-value
          map-options
          placeholder="자산 상황 선택"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import RadioCard from 'src/components/common/RadioCard.vue';
import { 
  BODY_SHAPE_OPTIONS, 
  EDUCATION_OPTIONS, 
  JOB_TYPE_OPTIONS,
  DIET_OPTIONS,
  DRINKING_TYPE_OPTIONS,
  DRINKING_FREQ_OPTIONS,
  YES_NO_OPTIONS
} from 'src/enums/code';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const bodyShapeOptions = BODY_SHAPE_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const educationOptions = EDUCATION_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const jobTypeOptions = JOB_TYPE_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const dietOptions = DIET_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const drinkingTypeOptions = DRINKING_TYPE_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const drinkingFreqOptions = DRINKING_FREQ_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const smokingOptions = [
  { label: '흡연함', value: 'yes' },
  { label: '비흡연', value: 'no' }
];

const regionOptions = [
  { label: '서울', value: 'SEOUL' },
  { label: '경기', value: 'GYEONGGI' },
  { label: '인천', value: 'INCHEON' },
  { label: '기타 대도시', value: 'METRO' },
  { label: '기타 지역', value: 'OTHER' }
];

const religionOptions = [
  { label: '무교', value: 'NONE' },
  { label: '기독교', value: 'CHRISTIAN' },
  { label: '천주교', value: 'CATHOLIC' },
  { label: '불교', value: 'BUDDHISM' },
  { label: '기타', value: 'OTHER' }
];

const politicsOptions = [
  { label: '무관심', value: 'NEUTRAL' },
  { label: '보수', value: 'CONSERVATIVE' },
  { label: '진보', value: 'LIBERAL' },
  { label: '중도', value: 'MODERATE' }
];

const assetOptions = [
  { label: '자가 보유', value: 'OWNED_HOME' },
  { label: '전/월세', value: 'RENTAL' },
  { label: '부모님 자택', value: 'PARENTS' },
  { label: '차량 보유', value: 'CAR' },
  { label: '해당 사항 없음', value: 'NONE' }
];

const isValid = computed(() => {
  const m = props.modelValue;
  return !!(
    m.nickname && 
    m.gender_cd &&
    m.birthYear && 
    m.region && 
    m.height && 
    m.bodyShape && 
    m.job && 
    m.education && 
    m.religion && 
    m.politics && 
    m.smoking && 
    m.drinking && 
    m.jobType &&
    m.assetInfo
  );
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 700
  margin-bottom: 8px
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
</style>
