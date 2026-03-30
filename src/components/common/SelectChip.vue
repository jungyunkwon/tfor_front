<template>
  <div class="select-chip-group row q-gutter-sm">
    <q-chip
      v-for="option in options"
      :key="option.value"
      :selected="isSelected(option.value)"
      :label="option.label"
      clickable
      outline
      flat
      text-color="white"
      class="custom-chip q-px-md q-py-md"
      :class="{ 
        'active-chip': isSelected(option.value),
        'inactive-chip': !isSelected(option.value)
      }"
      @click="toggleSelection(option.value)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [Array, String, Number, null], default: null },
  options: { type: Array, required: true },
  multiple: { type: Boolean, default: true },
  max: { type: Number, default: null }
});
const emit = defineEmits(['update:modelValue']);

const isSelected = (val) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(val);
  }
  return props.modelValue === val;
};

const toggleSelection = (val) => {
  if (props.multiple) {
    const list = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    if (list.includes(val)) {
      const newList = list.filter(i => i !== val);
      emit('update:modelValue', newList);
    } else {
      if (props.max && list.length >= props.max) return;
      list.push(val);
      emit('update:modelValue', list);
    }
  } else {
    emit('update:modelValue', val);
  }
};
</script>

<style lang="sass" scoped>
.custom-chip
  border-radius: 20px
  font-weight: 500
  transition: all 0.2s ease
  margin-right: -4px
  
.active-chip
  background: #87B7EC !important
  color: white !important
  border: 1px solid #87B7EC !important

.inactive-chip
  background: white !important
  color: var(--color-auth-text, #1e293b) !important
  border: 1.5px solid var(--color-auth-border, #e2e8f0) !important

.q-chip__icon--left
  display: none !important
</style>
