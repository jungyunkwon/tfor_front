<template>
  <div class="setup-preview text-center q-pa-md">
    
    <q-icon name="check_circle" size="4rem" color="green-5" class="q-mb-md" />
    <h3 class="text-h6 font-weight-bold q-mb-sm">프로필 작성이 완료되었습니다!</h3>
    
    <q-card class="bg-grey-2 shadow-0 q-my-lg q-pa-md" style="border-radius: 12px;">
      <div class="text-subtitle1 text-primary text-weight-bold q-mb-sm">
        현재 가입 심사 중입니다.
      </div>
      <p class="text-grey-8 q-mb-none font-size-13">
        관리자 승인 후 매칭 탭 이용 및 전체 서비스 이용이 가능합니다.<br/>
        승인까지 최대 24시간이 소요될 수 있습니다.
      </p>
    </q-card>

    <div class="preview-card-wrap q-mb-md text-left border rounded q-pa-md">
      <div class="text-weight-bold q-mb-xs">등록된 내 정보 요약</div>
      <div v-if="localModel?.basic?.nickname">
        {{ localModel.basic.nickname }} 님 ({{ localModel.basic.gender_cd === 'MALE' ? '남' : '여' }}) / {{ localModel.basic.birth_year }}년생
      </div>
      <div v-else class="text-grey">
        등록된 정보가 아직 요약으로 넘어오지 않았습니다.
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'validation']);

const localModel = ref({ ...props.modelValue });

onMounted(() => {
  // 마지막 단계인 미리보기 페이지는 항상 유효(Valid) 상태로 다음/종료 버튼을 보여준다
  emit('validation', true);
});
</script>

<style scoped>
.font-size-13 {
  font-size: 13px;
}
.border {
  border: 1px solid var(--color-border, #e0e0e0);
}
.rounded {
  border-radius: 8px;
}
</style>
