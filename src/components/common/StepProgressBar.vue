<template>
  <div class="step-progress-bar q-px-md q-py-sm">
    <div class="row items-center justify-between q-mb-xs">
      <div class="progress-indicator row q-gutter-x-xs">
        <div 
          v-for="idx in total" 
          :key="idx"
          class="step-dot"
          :class="{ 
            'active': idx === current,
            'completed': idx < current
          }"
        ></div>
      </div>
      <div class="step-text text-caption text-grey-7 font-weight-medium">
        {{ current }} / {{ total }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true }
});
</script>

<style lang="sass" scoped>
.step-progress-bar
  width: 100%

.step-dot
  width: 24px
  height: 4px
  border-radius: 2px
  background-color: var(--color-auth-border, #e2e8f0)
  transition: all 0.3s ease

  &.active
    width: 32px
    background-color: var(--q-primary, #1976D2)
  
  &.completed
    background-color: var(--q-primary, #1976D2)
    opacity: 0.5
</style>
