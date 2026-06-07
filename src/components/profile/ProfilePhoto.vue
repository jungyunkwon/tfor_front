<template>
  <section>
    <label class="section-label q-mb-md">
      {{ label }}
      <span v-if="required" class="text-negative">*</span>
    </label>
    <div class="row q-col-gutter-sm">
      <div v-for="i in maxCount" :key="i" class="col-4">
        <q-card
          flat
          bordered
          class="photo-slot flex justify-center items-center cursor-pointer hover-scale overflow-hidden"
          @click="onPhotoClick(i - 1)"
        >
          <q-img v-if="photos[i - 1]?.previewUrl" :src="photos[i - 1].previewUrl" ratio="1" />
          <div v-else class="column items-center text-grey-6">
            <q-icon name="add_a_photo" size="24px" />
            <span class="text-caption q-mt-xs">{{ i === 1 ? '대표' : '추가' }}</span>
          </div>
        </q-card>
      </div>
    </div>
    <p v-if="photoError" class="text-caption text-negative q-mt-sm">{{ photoError }}</p>
    <p class="text-caption text-grey-6 q-mt-md">
      * {{ extensionText }} 파일만 등록할 수 있습니다. 사진은 최대 {{ maxCount }}장, 파일당 {{ maxSizeMb }}MB까지 가능합니다.
    </p>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="acceptText"
      @change="onFileChange"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '사진을 등록해주세요' },
  required: { type: Boolean, default: false },
  maxCount: { type: Number, default: 3 },
  maxSizeMb: { type: Number, default: 5 },
  acceptExtensions: { type: Array, default: () => ['jpg', 'png'] }
});

const emit = defineEmits(['update:modelValue', 'validation', 'error']);

const fileInput = ref(null);
const currentSlotIndex = ref(0);
const photoError = ref('');

const photos = computed(() => props.modelValue || []);
const maxSizeBytes = computed(() => props.maxSizeMb * 1024 * 1024);
const extensionText = computed(() => props.acceptExtensions.join(', '));
const acceptText = computed(() => props.acceptExtensions.map(ext => `.${ext}`).join(','));
const allowedMimeTypes = computed(() => {
  return props.acceptExtensions.flatMap(ext => {
    if (ext === 'jpg') return ['image/jpeg'];
    if (ext === 'png') return ['image/png'];
    return [];
  });
});

const isValid = computed(() => {
  if (!props.required) return true;
  return photos.value.some(photo => !!photo?.file || !!photo?.storagePath || !!photo?.storage_path);
});

const setError = (message) => {
  photoError.value = message;
  emit('error', message);
};

const onPhotoClick = (index) => {
  currentSlotIndex.value = index;
  fileInput.value?.click();
};

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  photoError.value = '';
  const extension = file.name.split('.').pop()?.toLowerCase();
  const photoCount = photos.value.filter(photo => !!photo).length;

  if (!extension || !props.acceptExtensions.includes(extension) || !allowedMimeTypes.value.includes(file.type)) {
    setError(`${extensionText.value} 파일만 등록할 수 있습니다.`);
    event.target.value = '';
    return;
  }

  if (file.size > maxSizeBytes.value) {
    setError(`사진은 파일당 ${props.maxSizeMb}MB까지 등록할 수 있습니다.`);
    event.target.value = '';
    return;
  }

  if (!photos.value[currentSlotIndex.value] && photoCount >= props.maxCount) {
    setError(`사진은 최대 ${props.maxCount}장까지 등록할 수 있습니다.`);
    event.target.value = '';
    return;
  }

  const newPhotos = [...photos.value];
  if (newPhotos[currentSlotIndex.value]?.previewUrl) {
    URL.revokeObjectURL(newPhotos[currentSlotIndex.value].previewUrl);
  }

  newPhotos[currentSlotIndex.value] = {
    file,
    previewUrl: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    type: file.type
  };

  emit('update:modelValue', newPhotos);
  event.target.value = '';
};

watch(isValid, value => emit('validation', value), { immediate: true });
</script>

<style lang="sass" scoped>
.section-label
  display: block
  font-weight: 600
  color: var(--color-auth-text, #1e293b)
  font-size: 0.95rem

.photo-slot
  height: 110px
  width: 100%
  border-radius: 12px
  border: 1.5px dashed #cbd5e1
  background-color: #f8fafc
</style>
