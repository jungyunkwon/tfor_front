<template>
  <div class="step-relationship q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">어떤 연애를</h1>
      <h1 class="text-h5 text-weight-bold">꿈꾸시나요?</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 애정표현 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">연애할 때 애정표현은 어떻게 하는 편이세요?</label>
          <span class="text-caption" :class="expressionCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ expressionCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.expressionWay"
          @update:model-value="updateField('expressionWay', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 말로 표현도 자주 하는 편이고, 사소한 걸 챙기면서 애정을 보여줘요. 자주 연락하거나 함께 시간을 보내려는 노력으로 마음을 표현하는 편이에요."
          rows="5"
          class="auth-input"
        />
      </section>

      <!-- 연락 문제 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">상대방과 연락이 평소와 다르게 잘 안 된다면 어떻게 행동하시나요?</label>
          <span class="text-caption" :class="contactCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ contactCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.contactIssue"
          @update:model-value="updateField('contactIssue', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 바로 서운해하기보다 무슨 일이 있는지 먼저 생각해보는 편이에요. 그래도 계속 반복되면 솔직하게 대화로 풀려고 하고, 혼자 추측만 하지는 않으려고 해요."
          rows="5"
          class="auth-input"
        />
      </section>

      <!-- 데이트 스타일 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">데이트를 한다면 주로 어떤 데이트를 선호하세요?</label>
          <span class="text-caption" :class="idealCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ idealCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.idealDateStyle"
          @update:model-value="updateField('idealDateStyle', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 시끄럽기보다는 대화할 수 있는 데이트를 좋아해요. 맛집, 카페, 산책처럼 편하게 함께 시간을 보내면서 자연스럽게 가까워지는 만남을 선호해요."
          rows="5"
          class="auth-input"
        />
      </section>

      <!-- 해줄 수 있는 것 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">연인에게 이것만은 해줄 수 있다는 게 있을까요?</label>
          <span class="text-caption" :class="benefitCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ benefitCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.benefitToPartner"
          @update:model-value="updateField('benefitToPartner', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 힘들 때 옆에서 잘 들어주고, 바쁠 때도 소홀하지 않게 챙겨줄 수 있어요. 관계를 가볍게 생각하지 않고, 믿음을 주는 행동은 꾸준히 하려고 해요."
          rows="5"
          class="auth-input"
        />
      </section>

      <!-- 데이트 비용 (선택형) -->
      <section>
        <label class="section-label q-mb-sm">데이트 비용 부담은?</label>
        <RadioCard
          :model-value="form.dateExpense"
          :options="expenseOptions"
          @update:model-value="updateField('dateExpense', $event)"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import RadioCard from 'src/components/common/RadioCard.vue';
import { DATE_EXPENSE_OPTIONS } from 'src/enums/code';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      expressionWay: '',
      contactIssue: '',
      idealDateStyle: '',
      benefitToPartner: '',
      dateExpense: null
    })
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

const expenseOptions = DATE_EXPENSE_OPTIONS.map(o => ({ label: o.name, value: o.code }));

const expressionCount = computed(() => (form.value.expressionWay || '').trim().length);
const contactCount = computed(() => (form.value.contactIssue || '').trim().length);
const idealCount = computed(() => (form.value.idealDateStyle || '').trim().length);
const benefitCount = computed(() => (form.value.benefitToPartner || '').trim().length);

const isValid = computed(() => {
  return expressionCount.value >= 30 && 
         contactCount.value >= 30 && 
         idealCount.value >= 30 && 
         benefitCount.value >= 30 &&
         !!form.value.dateExpense;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 600
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
  line-height: 1.4
</style>