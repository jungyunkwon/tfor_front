<template>
  <div class="step-personality q-pa-md anim-fade">
    <div class="header-section q-mb-lg">
      <h1 class="text-h5 text-weight-bold q-mb-sm">성격 및 성향을</h1>
      <h1 class="text-h5 text-weight-bold">알려주세요</h1>
    </div>

    <div class="q-col-gutter-y-lg">
      <!-- 스트레스 해소 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">스트레스를 받는 상황에서 어떻게 행동하는 편이세요?</label>
          <span class="text-caption" :class="stressCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ stressCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.stressRelief"
          @update:model-value="updateField('stressRelief', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 바로 감정을 터뜨리기보다는 혼자 생각을 정리하는 편이에요. 어느 정도 정리가 되면 산책을 하거나 쉬면서 풀고, 필요한 경우에는 대화를 통해 해소하려고 해요."
          rows="3"
          class="auth-input"
        />
      </section>

      <!-- 갈등 해결 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">연인과의 갈등을 해결하는 방식</label>
          <span class="text-caption" :class="conflictCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ conflictCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.conflictResolution"
          @update:model-value="updateField('conflictResolution', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 감정적으로 몰아붙이기보다는 서로의 입장을 차분히 이야기하는 편이에요. 문제를 피하지 않고, 왜 그런 상황이 생겼는지 같이 정리하면서 풀어가고 싶어요."
          rows="3"
          class="auth-input"
        />
      </section>

      <!-- 안 해줬으면 하는 행동 -->
      <section>
        <div class="row justify-between items-center q-mb-sm">
          <label class="section-label">상대방이 이것만은 안 해줬으면 좋겠다.</label>
          <span class="text-caption" :class="avoidCount < 30 ? 'text-grey-6' : 'text-primary'">
            {{ avoidCount }} / 30자 이상
          </span>
        </div>
        <q-input
          :model-value="form.avoidBehavior"
          @update:model-value="updateField('avoidBehavior', $event)"
          type="textarea"
          outlined
          dense
          placeholder="예: 감정을 무시하거나, 화가 났다고 연락을 끊어버리는 행동은 힘들 것 같아요. 서로 다를 수는 있지만 기본적인 존중과 솔직한 대화는 꼭 있었으면 좋겠어요."
          rows="3"
          class="auth-input"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      stressRelief: '',
      conflictResolution: '',
      avoidBehavior: ''
    })
  }
});

const emit = defineEmits(['update:modelValue', 'validation']);

const form = computed(() => props.modelValue ?? {});

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...form.value,
    [key]: value
  });
};

const stressCount = computed(() => (form.value.stressRelief || '').trim().length);
const conflictCount = computed(() => (form.value.conflictResolution || '').trim().length);
const avoidCount = computed(() => (form.value.avoidBehavior || '').trim().length);

const isValid = computed(() => {
  return stressCount.value >= 30 && conflictCount.value >= 30 && avoidCount.value >= 30;
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
  line-height: 1.4
</style>