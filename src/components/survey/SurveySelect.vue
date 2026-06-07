<template>
  <section>
    <label class="section-label">
      {{ fieldLabel }}
      <span v-if="fieldRequired" class="text-negative">*</span>
    </label>
    <q-select
      :model-value="modelValue"
      @update:model-value="onUpdate"
      :options="fieldOptions"
      outlined
      dense
      emit-value
      map-options
      behavior="dialog"
      :placeholder="placeholder"
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
  modelValue: { type: [String, Number, null], default: null },
  code: { type: String, default: '' },
  questionsMap: { type: Object, default: () => ({}) },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'validation']);
const { fieldLabel, fieldRequired, fieldOptions } = useSurveyField(props);

const isValid = computed(() => {
  if (!fieldRequired.value) return true;
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
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
