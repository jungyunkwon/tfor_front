<template>
  <div class="radio-card-group column q-gutter-y-sm">
    <div
      v-for="option in options"
      :key="option.value"
      class="radio-card q-pa-md cursor-pointer row items-center justify-between"
      :class="{ 
        'radio-card-active': modelValue === option.value,
        'radio-card-inactive': modelValue !== option.value 
      }"
      @click="onSelect(option.value)"
    >
      <div class="row items-center">
        <q-icon 
          v-if="option.icon" 
          :name="option.icon" 
          size="24px" 
          class="q-mr-md" 
          :color="modelValue === option.value ? 'primary' : 'grey-7'" 
        />
        <div class="column">
          <span class="text-subtitle1 text-weight-bold" :class="modelValue === option.value ? 'text-primary' : 'text-dark'">
            {{ option.label }}
          </span>
          <span v-if="option.description" class="text-caption text-grey-7">
            {{ option.description }}
          </span>
        </div>
      </div>
      <q-icon 
        v-if="modelValue === option.value"
        name="check_circle" 
        color="primary" 
        size="24px" 
      />
      <div 
        v-else 
        class="radio-dot"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, required: true }
});
const emit = defineEmits(['update:modelValue']);

const onSelect = (val) => {
  emit('update:modelValue', val);
};
</script>

<style lang="sass" scoped>
.radio-card
  border-radius: 12px
  border: 1.5px solid var(--color-auth-border, #e2e8f0)
  transition: all 0.2s ease
  background: white

  &:hover
    background: #f8fafc

.radio-card-active
  border-color: var(--q-primary, #1976D2)
  background: rgba(25, 118, 210, 0.05) !important
  
.radio-dot
  width: 20px
  height: 20px
  border: 1.5px solid var(--color-auth-border, #e2e8f0)
  border-radius: 50%
</style>
