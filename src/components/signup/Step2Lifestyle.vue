<template>
  <div class="step-lifestyle q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">어떤 일상을</h1>
      <h1 class="text-h5 text-weight-bold">보내고 계신가요?</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 평일 활동 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">평일에는 주로 어떻게 시간을 보내시나요?</label>
          <span
            class="text-caption"
            :class="weekdayCount < 40 ? 'text-grey-6' : 'text-primary'"
          >
            {{ weekdayCount }} / 40자 이상
          </span>
        </div>
        <q-input
          :model-value="form.weekdayActivity"
          @update:model-value="updateField('weekdayActivity', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 퇴근 후에는 운동을 하거나 집에서 쉬면서 영화를 봐요. 평일에는 대체로 규칙적인 생활을 하는 편이고, 혼자 조용히 보내는 시간도 중요하게 생각해요."
          rows="4"
          class="auth-input"
        />
      </section>

      <!-- 주말/친구 활동 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">주말이나 친구들을 만날 때는 주로 어떻게 시간을 보내시나요?</label>
          <span
            class="text-caption"
            :class="weekendCount < 40 ? 'text-grey-6' : 'text-primary'"
          >
            {{ weekendCount }} / 40자 이상
          </span>
        </div>
        <q-input
          :model-value="form.weekendActivity"
          @update:model-value="updateField('weekendActivity', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 주말에는 맛집에 가거나 카페에서 시간을 보내고, 가끔은 전시나 산책도 즐겨요. 친구들과는 편하게 대화하며 오래 보는 만남을 좋아해요."
          rows="4"
          class="auth-input"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      weekdayActivity: '',
      weekendActivity: ''
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

const weekdayCount = computed(() => (form.value.weekdayActivity || '').trim().length);
const weekendCount = computed(() => (form.value.weekendActivity || '').trim().length);

const isValid = computed(() => {
  return weekdayCount.value >= 40 && weekendCount.value >= 40;
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