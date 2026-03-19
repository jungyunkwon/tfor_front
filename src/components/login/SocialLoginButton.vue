<template>
  <q-btn
    class="auth-btn-kakao full-width q-py-md hover-scale"
    unelevated
    no-caps
    @click="onClick"
  >
    <div class="row items-center justify-center full-width">
      <q-icon name="chat_bubble" size="sm" class="q-mr-sm" />
      <span>{{ label }}</span>
    </div>
  </q-btn>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '카카오 로그인'
  }
});

const emit = defineEmits(['click']);

const onClick = () => {
  emit('click');
};
</script>
