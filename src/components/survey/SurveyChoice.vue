<template>
  <section>
    <label class="section-label q-mb-sm">
      {{ fieldLabel }}
      <span v-if="fieldRequired" class="text-negative">*</span>
    </label>
    <SelectChip
      :model-value="modelValue"
      :options="fieldOptions"
      :multiple="multiple"
      :max="max"
      @update:model-value="onUpdate"
    />
    <p v-if="hint" class="text-caption text-grey-6 q-mt-xs">{{ hint }}</p>
  </section>
</template>

<script setup>
import { computed, watch } from 'vue';
import SelectChip from 'src/components/common/SelectChip.vue';
import { useSurveyField } from './useSurveyField';

const props = defineProps({
  modelValue: { type: [Array, String, Number, null], default: null },
  code: { type: String, default: '' },
  questionsMap: { type: Object, default: () => ({}) },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: undefined },
  multiple: { type: Boolean, default: false },
  max: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue', 'validation']);
const { fieldLabel, fieldRequired, fieldOptions } = useSurveyField(props);

const isValid = computed(() => {
  if (!fieldRequired.value) return true;
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
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
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem
  line-height: 1.4
</style>
