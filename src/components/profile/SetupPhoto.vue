<template>
  <div class="setup-photo">
    <div class="text-subtitle1 q-mb-md">증명사진이나 나를 잘 나타내는 사진을 올려주세요.</div>
    <div class="q-col-gutter-y-md">
      
      <div>
        <label class="text-weight-bold q-mb-xs block">얼굴 사진 (필수 1장 이상)</label>
        <q-uploader
          url="api/upload" 
          label="사진 선택 또는 드래그"
          color="primary"
          flat
          bordered
          accept="image/*"
          multiple
          class="full-width"
          @added="onFileAdded"
          @removed="onFileRemoved"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });
const fileCount = ref(0);

watch(localModel, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const onFileAdded = (files) => {
  fileCount.value += files.length;
  checkValidation();
};
const onFileRemoved = (files) => {
  fileCount.value -= files.length;
  checkValidation();
};

const checkValidation = () => {
  // 최소 1장이 있어야 유효
  const isValid = fileCount.value > 0;
  emit('validation', isValid);
};

onMounted(() => {
  if (!localModel.value.photo) {
    localModel.value.photo = {};
  }
  checkValidation();
});
</script>
