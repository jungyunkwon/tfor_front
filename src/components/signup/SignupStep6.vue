<template>
  <div class="step-form">
    <div class="q-col-gutter-y-lg">
      
      <div>
        <label class="text-weight-bold q-mb-sm block text-auth-text">
          기본정보(흡연, 키, 몸매, 음주, 학력, 종교, 정치성향)에서<br/>절대로 맞아야 하는 점을 순서대로 적어주세요.
        </label>
        <q-input 
          v-model="localModel.mandatoryConditions" 
          type="textarea" 
          outlined 
          placeholder="1. 종교&#10;2. 비흡연..." 
          class="auth-input" 
          autogrow 
        />
      </div>

      <div>
        <label class="text-weight-bold q-mb-sm block text-auth-text">
          가치관 영역에서 본인이 가장 중요하게 여기는 부분을<br/>순서대로 나열해주세요.<br/>
          <span class="text-caption text-grey-8 font-weight-normal">(자기계발, 커리어, 경제관념, 결혼가치관, 라이프스타일 중)</span>
        </label>
        <q-input 
          v-model="localModel.valuesPriority" 
          type="textarea" 
          outlined 
          placeholder="1. 경제관념&#10;2. 라이프스타일..." 
          class="auth-input" 
          autogrow 
        />
      </div>

      <div>
        <label class="text-weight-bold q-mb-sm block text-auth-text">
          마지막 연애의 만남과 이별, 상대가 어떤 점이 잘 맞았는지,<br/>본인은 다음 연인으로 어떤 분을 만나고 싶은지 적어주세요.
        </label>
        <q-input 
          v-model="localModel.lastRomanceFeedback" 
          type="textarea" 
          outlined 
          placeholder="답변을 입력해주세요" 
          class="auth-input" 
          autogrow 
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

const checkValidation = () => {
  const m = localModel.value;
  const isValid = !!(m.mandatoryConditions && m.valuesPriority && m.lastRomanceFeedback);
  emit('validation', isValid);
};

watch(localModel, (newVal) => {
  checkValidation();
  emit('update:modelValue', newVal);
}, { deep: true });

onMounted(() => checkValidation());
</script>

<style scoped>
.text-auth-text { color: var(--color-auth-text); }
</style>
