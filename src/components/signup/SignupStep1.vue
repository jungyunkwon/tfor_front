<template>
  <div class="step-form">
    <div class="q-col-gutter-y-md">
      
      <!-- 닉네임 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">닉네임</label>
        <q-input v-model="localModel.nickname" @update:model-value="checkValidation" outlined dense placeholder="닉네임 입력" class="auth-input" />
      </div>

      <!-- 출생연도 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">출생연도</label>
        <q-input v-model.number="localModel.birthYear" type="number" @update:model-value="checkValidation" outlined dense placeholder="1993" class="auth-input" />
      </div>

      <!-- 거주지역 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">거주지역</label>
        <q-input v-model="localModel.area" @update:model-value="checkValidation" outlined dense placeholder="서울 광진구" class="auth-input" />
      </div>

      <!-- 키 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">키</label>
        <q-input v-model.number="localModel.height" type="number" @update:model-value="checkValidation" outlined dense placeholder="175" class="auth-input" suffix="cm" />
      </div>

      <!-- 체형 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">체형</label>
        <div class="row q-gutter-x-sm">
          <q-radio v-for="opt in BODY_SHAPE_OPTIONS" :key="opt.code" v-model="localModel.bodyShape" :val="opt.code" :label="opt.name" color="primary" @update:model-value="checkValidation" />
        </div>
      </div>

      <!-- 학력 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">학력</label>
        <q-select v-model="localModel.education" :options="EDUCATION_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense placeholder="학력 선택" class="auth-input" @update:model-value="checkValidation" />
      </div>

      <!-- 종교 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">종교</label>
        <q-input v-model="localModel.religion" @update:model-value="checkValidation" outlined dense placeholder="종교 입력 (없으면 무교)" class="auth-input" />
      </div>

      <!-- 정치성향 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">정치성향</label>
        <q-input v-model="localModel.politics" @update:model-value="checkValidation" outlined dense placeholder="정치성향 입력" class="auth-input" />
      </div>

      <!-- 흡연 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">흡연</label>
        <div class="row q-gutter-x-md">
          <q-radio v-for="opt in SMOKING_OPTIONS" :key="opt.code" v-model="localModel.smoking" :val="opt.code" :label="opt.name" color="primary" @update:model-value="checkValidation" />
        </div>
      </div>

      <!-- 음주 -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">음주 빈도</label>
          <q-select v-model="localModel.drinkingFreq" :options="DRINKING_FREQ_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" />
        </div>
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">선호 주종</label>
          <q-select v-model="localModel.drinkingType" :options="DRINKING_TYPE_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" :disable="localModel.drinkingFreq === 'none'" />
        </div>
      </div>

      <!-- 식습관 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">식습관 (자주 먹는 음식)</label>
        <q-select v-model="localModel.diet" :options="DIET_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" />
      </div>

      <!-- 직업 -->
      <div class="q-mt-lg">
        <q-separator class="q-my-md" />
        <label class="text-weight-bold q-mb-xs block text-auth-text">직장 / 사업 여부</label>
        <div class="row q-gutter-x-md q-mb-md">
           <q-radio v-for="opt in JOB_TYPE_OPTIONS" :key="opt.code" v-model="localModel.jobType" :val="opt.code" :label="opt.name" color="primary" @update:model-value="checkValidation" />
        </div>

        <!-- 직장인 상세 -->
        <div v-if="localModel.jobType === 'employee'" class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input v-model="localModel.job" @update:model-value="checkValidation" outlined dense placeholder="직무 (예: 개발자)" class="auth-input" />
          </div>
          <div class="col-6">
             <q-input v-model="localModel.company" @update:model-value="checkValidation" outlined dense placeholder="회사명" class="auth-input" />
          </div>
          <div class="col-6">
             <q-input v-model.number="localModel.salary" type="number" @update:model-value="checkValidation" outlined dense placeholder="연봉 (단위: 만원)" suffix="만원" class="auth-input" />
          </div>
        </div>

        <!-- 사업자 상세 -->
        <div v-if="localModel.jobType === 'business'" class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input v-model="localModel.job" @update:model-value="checkValidation" outlined dense placeholder="직무/대표 직함" class="auth-input" />
          </div>
          <div class="col-6">
             <q-input v-model="localModel.businessType" @update:model-value="checkValidation" outlined dense placeholder="업종" class="auth-input" />
          </div>
          <div class="col-6">
             <q-input v-model.number="localModel.sales" type="number" @update:model-value="checkValidation" outlined dense placeholder="매출 (단위: 만원)" suffix="만원" class="auth-input" />
          </div>
        </div>
      </div>

      <!-- 자산 -->
      <div>
        <q-separator class="q-my-md" />
        <label class="text-weight-bold q-mb-md block text-auth-text">현재 자산 상태</label>
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="text-caption text-grey-8">부동산 유무</div>
            <q-select v-model="localModel.hasRealEstate" :options="ASSET_YN_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" />
          </div>
          <div class="col-4">
            <div class="text-caption text-grey-8">금융투자 유무</div>
            <q-select v-model="localModel.hasInvestment" :options="ASSET_YN_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" />
          </div>
          <div class="col-4">
            <div class="text-caption text-grey-8">적금/예금 유무</div>
            <q-select v-model="localModel.hasSavings" :options="ASSET_YN_OPTIONS" option-value="code" option-label="name" emit-value map-options outlined dense class="auth-input" @update:model-value="checkValidation" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { 
  BODY_SHAPE_OPTIONS, 
  EDUCATION_OPTIONS, 
  SMOKING_OPTIONS, 
  DRINKING_FREQ_OPTIONS, 
  DRINKING_TYPE_OPTIONS,
  DIET_OPTIONS,
  JOB_TYPE_OPTIONS,
  ASSET_YN_OPTIONS
} from 'src/enums/code';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });

watch(localModel, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const checkValidation = () => {
  // 필수값 검증 로직
  const m = localModel.value;
  const isValid = !!(
    m.nickname && m.birthYear && m.area && m.height && m.bodyShape && m.education &&
    m.religion && m.politics && m.smoking && m.drinkingFreq && m.diet && m.jobType &&
    m.hasRealEstate && m.hasInvestment && m.hasSavings
  );
  
  // 직장/사업 상세 검증
  let isDetailValid = false;
  if (m.jobType === 'employee') isDetailValid = !!(m.job && m.company && m.salary);
  else if (m.jobType === 'business') isDetailValid = !!(m.job && m.businessType && m.sales);

  emit('validation', isValid && isDetailValid);
};

onMounted(() => checkValidation());
</script>

<style scoped>
.text-auth-text { color: var(--color-auth-text); }
</style>
