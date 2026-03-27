<template>
  <div class="setup-basic">
    <div class="q-col-gutter-y-lg">
      
      <!-- 닉네임 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">닉네임</label>
        <q-input 
          v-model="localModel.basic.nickname" 
          @update:model-value="checkValidation" 
          outlined 
          dense 
          placeholder="사용하실 닉네임을 입력하세요" 
        />
      </div>

      <!-- 성별 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">성별</label>
        <div class="row q-gutter-x-md">
          <q-radio v-model="localModel.basic.gender_cd" val="MALE" label="남성" color="primary" @update:model-value="checkValidation" />
          <q-radio v-model="localModel.basic.gender_cd" val="FEMALE" label="여성" color="primary" @update:model-value="checkValidation" />
        </div>
      </div>

      <!-- 출생연도 -->
      <div class="row q-col-gutter-x-sm">
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">출생연도</label>
          <q-input 
            v-model.number="localModel.basic.birth_year" 
            type="number" 
            @update:model-value="checkValidation" 
            outlined 
            dense 
            placeholder="예: 1995" 
          />
        </div>
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">키</label>
          <q-input 
            v-model.number="localModel.basic.height_cm" 
            type="number" 
            @update:model-value="checkValidation" 
            outlined 
            dense 
            suffix="cm" 
            placeholder="175" 
          />
        </div>
      </div>

      <!-- 지역 / 직업 -->
      <div class="row q-col-gutter-x-sm">
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">지역</label>
          <q-select
            v-model="localModel.basic.region_cd"
            :options="regionOptions"
            emit-value
            map-options
            outlined
            dense
            placeholder="선택"
            @update:model-value="checkValidation"
          />
        </div>
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">직업</label>
          <q-input 
            v-model="localModel.basic.job_name" 
            @update:model-value="checkValidation" 
            outlined 
            dense 
            placeholder="직업 입력" 
          />
        </div>
      </div>

      <!-- 학력 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">학력</label>
        <q-select
          v-model="localModel.basic.education_level_cd"
          :options="educationOptions"
          emit-value
          map-options
          outlined
          dense
          placeholder="선택"
          @update:model-value="checkValidation"
        />
      </div>

      <!-- 혼인 상태 / 자녀 유무 -->
      <div class="row q-col-gutter-x-sm">
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">혼인 상태</label>
          <q-select
            v-model="localModel.basic.marital_status_cd"
            :options="maritalOptions"
            emit-value
            map-options
            outlined
            dense
            placeholder="선택"
            @update:model-value="checkValidation"
          />
        </div>
        <div class="col-6">
          <label class="text-weight-bold q-mb-xs block text-auth-text">자녀 유무</label>
          <div class="row q-gutter-x-sm">
            <q-radio v-model="localModel.basic.children_yn" val="Y" label="있음" color="primary" @update:model-value="checkValidation" />
            <q-radio v-model="localModel.basic.children_yn" val="N" label="없음" color="primary" @update:model-value="checkValidation" />
          </div>
        </div>
      </div>

      <!-- 흡연 / 음주 / 종교 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">기타 정보</label>
        <div class="bg-white q-pa-md rounded-borders border-light">
          
          <div class="row items-center q-mb-sm">
            <div class="col-4 text-grey-8">흡연 여부</div>
            <div class="col-8 row q-gutter-x-sm">
              <q-radio v-model="localModel.basic.smoking_yn" val="Y" label="함" color="primary" @update:model-value="checkValidation" dense />
              <q-radio v-model="localModel.basic.smoking_yn" val="N" label="안함" color="primary" @update:model-value="checkValidation" dense />
            </div>
          </div>

          <div class="row items-center q-mb-sm">
            <div class="col-3 text-grey-8">음주</div>
            <div class="col-9">
              <q-select
                v-model="localModel.basic.drinking_cd"
                :options="drinkingOptions"
                emit-value
                map-options
                outlined
                dense
                placeholder="선택"
                @update:model-value="checkValidation"
              />
            </div>
          </div>

          <div class="row items-center">
            <div class="col-3 text-grey-8">종교</div>
            <div class="col-9">
              <q-select
                v-model="localModel.basic.religion_cd"
                :options="religionOptions"
                emit-value
                map-options
                outlined
                dense
                placeholder="선택"
                @update:model-value="checkValidation"
              />
            </div>
          </div>

        </div>
      </div>

      <!-- 자기소개 -->
      <div>
        <label class="text-weight-bold q-mb-xs block text-auth-text">간략한 자기소개 <span class="text-caption text-grey-6">(선택)</span></label>
        <q-input 
          v-model="localModel.basic.intro_text" 
          @update:model-value="checkValidation" 
          outlined 
          dense 
          type="textarea"
          rows="3"
          placeholder="본인의 매력이나 성향을 가볍게 적어주세요!" 
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });

const regionOptions = [
  { label: '서울', value: 'SEOUL' },
  { label: '경기', value: 'GYEONGGI' },
  { label: '인천', value: 'INCHEON' },
  { label: '부산', value: 'BUSAN' },
  { label: '대구', value: 'DAEGU' },
  { label: '광주', value: 'GWANGJU' },
  { label: '대전', value: 'DAEJEON' },
  { label: '울산', value: 'ULSAN' },
  { label: '세종', value: 'SEJONG' },
  { label: '강원', value: 'GANGWON' },
  { label: '충북', value: 'CHUNGBUK' },
  { label: '충남', value: 'CHUNGNAM' },
  { label: '전북', value: 'JEONBUK' },
  { label: '전남', value: 'JEONNAM' },
  { label: '경북', value: 'GYEONGBUK' },
  { label: '경남', value: 'GYEONGNAM' },
  { label: '제주', value: 'JEJU' }
];

const educationOptions = [
  { label: '고등학교 졸업', value: 'HIGH_SCHOOL' },
  { label: '전문대 졸업', value: 'COLLEGE' },
  { label: '대학교 졸업', value: 'BACHELOR' },
  { label: '석사', value: 'MASTER' },
  { label: '박사', value: 'DOCTOR' }
];

const maritalOptions = [
  { label: '미혼', value: 'SINGLE' },
  { label: '돌싱', value: 'DIVORCED' }
];

const drinkingOptions = [
  { label: '마시지 않음', value: 'NONE' },
  { label: '가끔 마심', value: 'OCCASIONALLY' },
  { label: '자주 마심', value: 'OFTEN' }
];

const religionOptions = [
  { label: '무교', value: 'NONE' },
  { label: '기독교', value: 'CHRISTIANITY' },
  { label: '천주교', value: 'CATHOLICISM' },
  { label: '불교', value: 'BUDDHISM' },
  { label: '기타', value: 'OTHER' }
];

watch(localModel, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const checkValidation = () => {
  const b = localModel.value.basic || {};
  const isValid = !!(
    b.nickname && 
    b.gender_cd && 
    b.birth_year && 
    b.height_cm &&
    b.region_cd &&
    b.job_name &&
    b.education_level_cd &&
    b.marital_status_cd &&
    b.children_yn &&
    b.smoking_yn &&
    b.drinking_cd &&
    b.religion_cd
  );
  emit('validation', isValid);
};

onMounted(() => {
  if (!localModel.value.basic) {
    localModel.value.basic = {};
  }
  
  if (localModel.value.basic.genderCd && !localModel.value.basic.gender_cd) {
    localModel.value.basic.gender_cd = localModel.value.basic.genderCd;
  }
  if (localModel.value.basic.birthYear && !localModel.value.basic.birth_year) {
    localModel.value.basic.birth_year = localModel.value.basic.birthYear;
  }
  if (localModel.value.basic.heightCm && !localModel.value.basic.height_cm) {
    localModel.value.basic.height_cm = localModel.value.basic.heightCm;
  }
  
  checkValidation();
});
</script>

<style scoped>
.text-auth-text {
  color: var(--color-text, #333);
}
.border-light {
  border: 1px solid var(--color-border, #e0e0e0);
}
</style>
