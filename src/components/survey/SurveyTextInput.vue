<template>
  <section>
    <label class="section-label">
      {{ fieldLabel }}
      <span v-if="fieldRequired" class="text-negative">*</span>
    </label>
    <q-input
      :model-value="modelValue"
      @update:model-value="onUpdate"
      outlined
      dense
      :placeholder="placeholder"
      :maxlength="maxLength || undefined"
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
  modelValue: { type: [String, Number], default: '' },
  code: { type: String, default: '' },
  questionsMap: { type: Object, default: () => ({}) },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: undefined },
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'validation']);
const { fieldLabel, fieldRequired } = useSurveyField(props);

const textLength = computed(() => String(props.modelValue || '').trim().length);
const isValid = computed(() => {
  if (fieldRequired.value && !textLength.value) return false;
  if (props.minLength && textLength.value > 0 && textLength.value < props.minLength) return false;
  return true;
});

const onUpdate = (value) => {
  emit('update:modelValue', value);
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
