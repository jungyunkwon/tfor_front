<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="profile-dialog">
      <q-card-section>
        <div class="row justify-between items-start q-mb-md">
          <div>
            <div class="text-h5 text-weight-bold">{{ profile?.nickname || '-' }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">{{ metaText }}</div>
          </div>
          <q-btn flat round dense icon="close" @click="emit('update:modelValue', false)" />
        </div>

        <div class="profile-info column q-gutter-y-sm">
          <div class="row">
            <span class="info-label">지역</span>
            <span class="text-grey-8">{{ profile?.regionCd || '-' }}</span>
          </div>
          <div class="row">
            <span class="info-label">자기소개</span>
            <span class="text-grey-8 col">{{ profile?.introText || '아직 자기소개가 없어요.' }}</span>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">성향 태그</div>
          <div class="row q-gutter-xs">
            <q-badge
              v-for="tag in profile?.tags || []"
              :key="tag"
              outline
              color="primary"
              class="tag-badge"
            >
              #{{ tag }}
            </q-badge>
            <span v-if="!profile?.tags?.length" class="text-caption text-grey-5">아직 등록된 성향 태그가 없어요.</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn
          v-if="ctaMode === 'send-like'"
          unelevated
          color="primary"
          class="full-width q-py-sm text-weight-bold"
          :label="ctaLabel"
          :loading="loading"
          @click="emit('cta')"
        />
        <div v-else-if="statusText" class="full-width text-center text-primary text-weight-bold q-py-sm">
          {{ statusText }}
        </div>
        <q-btn
          v-else
          outline
          color="primary"
          class="full-width q-py-sm text-weight-bold"
          label="닫기"
          @click="emit('update:modelValue', false)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  profile: { type: Object, default: null },
  ctaMode: { type: String, default: '' },
  ctaLabel: { type: String, default: '나도 호감 보내기' },
  statusText: { type: String, default: '' },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'cta']);

const metaText = computed(() => {
  if (!props.profile) return '';
  const ageText = props.profile.age ? `${props.profile.age}` : '-';
  return `${ageText} · ${props.profile.jobName || '-'}`;
});
</script>

<style scoped lang="scss">
.profile-dialog {
  width: min(420px, calc(100vw - 32px));
  border-radius: 8px;
}

.tag-badge {
  border-radius: 999px;
  padding: 4px 8px;
}

.info-label {
  width: 72px;
  color: #64748b;
  font-weight: 600;
}
</style>
