<template>
  <section>
    <label class="section-label">
      {{ fieldLabel }}
      <span v-if="fieldRequired" class="text-negative">*</span>
    </label>
    <q-input
      :model-value="modelValue"
      @update:model-value="onUpdate"
      type="number"
      outlined
      dense
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :suffix="suffix"
      :disable="disabled"
      class="auth-input"
    />
    <p v-if="hint" class="text-caption text-grey-6 q-mt-xs">{{ hint }}</p>
  </section>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useSurveyField } from './useSurveyField';

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  code: { type: String, default: '' },
  questionsMap: { type: Object, default: () => ({}) },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  suffix: { type: String, default: '' },
  required: { type: Boolean, default: undefined },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'validation']);
const { fieldLabel, fieldRequired } = useSurveyField(props);

const numericValue = computed(() => {
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) return null;
  return Number(props.modelValue);
});

const isValid = computed(() => {
  if (fieldRequired.value && numericValue.value === null) return false;
  if (numericValue.value === null) return true;
  if (Number.isNaN(numericValue.value)) return false;
  if (props.min !== null && numericValue.value < props.min) return false;
  if (props.max !== null && numericValue.value > props.max) return false;
  return true;
});

const onUpdate = (value) => {
  emit('update:modelValue', value === '' || value === null ? null : Number(value));
};

watch(isValid, value => emit('validation', value), { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 600
  margin-bottom: 8px
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
</style>
