<template>
  <div class="step-values q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold">가치관과 커리어를</h1>
      <h1 class="text-h5 text-weight-bold">알려주세요</h1>
      <p class="text-grey-7">공개되지 않고 매칭에만 사용되는 정보입니다.</p>
    </div>

    <div class="q-col-gutter-y-lg">
      <SurveyTextArea
        :model-value="form.currentJob"
        code="currentJob"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 현재는 회사에서 맡은 일을 성실하게 해나가고 있고, 제 일에 대한 책임감이 큰 편이에요. 바쁘더라도 제 생활과 미래를 위해 꾸준히 노력하고 있어요."
        @update:model-value="updateField('currentJob', $event)"
      />

      <SurveyTextArea
        :model-value="form.careerGoal"
        code="careerGoal"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 지금 하는 일을 더 잘하게 되는 것이 우선 목표예요. 장기적으로는 제가 잘하는 분야를 더 전문적으로 키우고, 안정감과 성장 모두 갖춘 방향으로 가고 싶어요."
        @update:model-value="updateField('careerGoal', $event)"
      />

      <SurveyTextArea
        :model-value="form.futurePlan"
        code="futurePlan"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 3~5년 안에는 지금보다 더 안정된 생활 기반을 만들고 싶어요. 일적으로도 성장해 있고, 개인적으로도 좋은 사람과 서로 의지할 수 있는 관계를 이루고 싶어요."
        @update:model-value="updateField('futurePlan', $event)"
      />

      <SurveyTextArea
        :model-value="form.familyAtmosphere"
        code="familyAtmosphere"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 가족끼리 자주 대화하는 편이었고, 서로의 일상에 관심이 많은 분위기였어요. 아주 표현이 많은 편은 아니어도 필요할 때 힘이 되어주는 안정적인 분위기에서 자랐어요."
        @update:model-value="updateField('familyAtmosphere', $event)"
      />

      <SurveyTextArea
        :model-value="form.familyConflict"
        code="familyConflict"
        :questions-map="questionsMap"
        :min-length="30"
        placeholder="예: 감정적으로 바로 맞서기보다는 조금 시간을 두고 이야기하는 편이에요. 서로 입장이 다를 수 있다고 생각해서, 대화를 통해 오해를 줄이고 풀어가려고 해요."
        @update:model-value="updateField('familyConflict', $event)"
      />

      <SurveyChoice
        :model-value="form.marriagePlan"
        code="marriagePlan"
        :questions-map="questionsMap"
        :options="marriageOptions"
        @update:model-value="updateField('marriagePlan', $event)"
      />

      <SurveyChoice
        :model-value="form.spendingHabit"
        code="spendingHabit"
        :questions-map="questionsMap"
        :options="spendingOptions"
        @update:model-value="updateField('spendingHabit', $event)"
      />

      <SurveyChoice
        :model-value="form.investment"
        code="investment"
        :questions-map="questionsMap"
        :options="investmentOptions"
        @update:model-value="updateField('investment', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SurveyChoice from 'src/components/survey/SurveyChoice.vue';
import SurveyTextArea from 'src/components/survey/SurveyTextArea.vue';
import { 
  MARRIAGE_PLAN_OPTIONS, 
  SALARY_BEHAVIOR_OPTIONS, 
  INVESTMENT_IDEA_OPTIONS 
} from 'src/enums/code';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      currentJob: '',
      careerGoal: '',
      futurePlan: '',
      familyAtmosphere: '',
      familyConflict: '',
      marriagePlan: null,
      spendingHabit: null,
      investment: null
    })
  },
  questionsMap: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const marriageOptions = MARRIAGE_PLAN_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const spendingOptions = SALARY_BEHAVIOR_OPTIONS.map(o => ({ label: o.name, value: o.code }));
const investmentOptions = INVESTMENT_IDEA_OPTIONS.map(o => ({ label: o.name, value: o.code }));

const jobCount = computed(() => (form.value.currentJob || '').trim().length);
const careerCount = computed(() => (form.value.careerGoal || '').trim().length);
const futureCount = computed(() => (form.value.futurePlan || '').trim().length);
const famAtmCount = computed(() => (form.value.familyAtmosphere || '').trim().length);
const famConfCount = computed(() => (form.value.familyConflict || '').trim().length);

const isValid = computed(() => {
  return jobCount.value >= 30 && 
         careerCount.value >= 30 && 
         futureCount.value >= 30 && 
         famAtmCount.value >= 30 && 
         famConfCount.value >= 30 && 
         !!form.value.marriagePlan && 
         !!form.value.spendingHabit && 
         !!form.value.investment;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>
