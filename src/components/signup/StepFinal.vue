<template>
  <div class="step-final q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">마지막</h1>
      <h1 class="text-h5 text-weight-bold">단계입니다</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 사진 등록 -->
      <section>
        <label class="section-label q-mb-md">본인을 표현하는 사진을 등록해주세요</label>
        <div class="row q-col-gutter-sm">
          <div v-for="i in 3" :key="i" class="col-4">
            <q-card 
              flat 
              bordered 
              class="photo-slot flex justify-center items-center cursor-pointer hover-scale overflow-hidden"
              @click="onPhotoClick(i-1)"
            >
              <q-img v-if="form.photos[i-1]" :src="form.photos[i-1]" ratio="1" />
              <div v-else class="column items-center text-grey-6">
                <q-icon name="add_a_photo" size="24px" />
                <span class="text-caption q-mt-xs">{{ i === 1 ? '대표' : '추가' }}</span>
              </div>
            </q-card>
          </div>
        </div>
        <p class="text-caption text-grey-6 q-mt-md">
          * 얼굴이 잘 보이는 선명한 사진을 권장하며, 부적절한 사진은 심사 후 거절될 수 있습니다. (최대 3장)
        </p>
      </section>

      <!-- 약관 동의 -->
      <section class="q-pt-md">
        <label class="section-label q-mb-md">약관 동의</label>
        <div class="column q-gutter-y-sm">
          <q-card flat bordered class="q-pa-sm agreement-item">
            <q-checkbox 
              :model-value="form.agreements.privacy"
              @update:model-value="updateAgreement('privacy', $event)"
              label="개인정보 수집 및 이용 동의 (필수)"
              color="primary"
            />
            <q-btn flat dense icon="chevron_right" @click.prevent />
          </q-card>

          <q-card flat bordered class="q-pa-sm agreement-item">
            <q-checkbox 
              :model-value="form.agreements.service"
              @update:model-value="updateAgreement('service', $event)"
              label="서비스 이용약관 동의 (필수)"
              color="primary"
            />
            <q-btn flat dense icon="chevron_right" @click.prevent />
          </q-card>
        </div>
      </section>
    </div>

    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept="image/*" 
      @change="onFileChange" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      photos: [],
      agreements: {
        privacy: false,
        service: false
      }
    })
  }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});
const fileInput = ref(null);
const currentSlotIndex = ref(0);

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const updateAgreement = (key, val) => {
  emit('update:modelValue', {
    ...form.value,
    agreements: {
      ...form.value.agreements,
      [key]: val
    }
  });
};

const onPhotoClick = (index) => {
  currentSlotIndex.value = index;
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const newPhotos = [...form.value.photos];
    newPhotos[currentSlotIndex.value] = event.target.result;
    updateField('photos', newPhotos);
  };
  reader.readAsDataURL(file);
};

const isValid = computed(() => {
  const f = form.value;
  const hasOnePhoto = Array.isArray(f.photos) && f.photos.some(p => !!p);
  const agreementsOk = f.agreements?.privacy && f.agreements?.service;
  return hasOnePhoto && agreementsOk;
});

watch(isValid, (newVal) => {
  emit('validation', newVal);
}, { immediate: true });
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

.agreement-item
  border-radius: 12px
  display: flex
  align-items: center
  justify-content: space-between
  padding: 8px 12px
</style>