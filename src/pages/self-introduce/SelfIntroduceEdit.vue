<template>
  <q-page class="self-introduce-edit-page bg-white">
    <div class="page-inner q-pa-md">
      <div class="row items-center q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="onCancel" />
        <div class="text-h6 text-weight-bold q-ml-sm">{{ pageTitle }}</div>
      </div>

      <div class="guide-section q-mb-lg">
        <div class="text-h5 text-weight-bold text-grey-9">당신을 가장 잘 표현할 이야기를 들려주세요.</div>
        <div class="text-body2 text-grey-6 q-mt-sm">진심이 담긴 한 줄이 누군가의 마음을 움직일 수 있어요.</div>
      </div>
      <div class="tip-box q-pa-md q-mb-lg">
        <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm">작성 팁</div>
        <div class="text-body2 text-grey-7">솔직한 이야기가 가장 큰 매력이 될 수 있어요.</div>
        <div class="text-body2 text-grey-7 q-mt-xs">일상 속 좋아하는 것부터 가볍게 시작해보세요.</div>
        <div class="text-body2 text-grey-7 q-mt-xs">어떤 사람과 만나고 싶은지도 함께 적어보세요.</div>
      </div>

      <q-form class="column q-gutter-y-lg" @submit.prevent="onSubmit">
        <q-input
          v-model="form.title"
          outlined
          counter
          maxlength="30"
          placeholder="나를 보여줄 한 문장을 적어주세요."
          :rules="[(val) => !!val?.trim() || '제목을 입력해주세요.']"
        />

        <q-input
          v-model="form.content"
          outlined
          counter
          maxlength="500"
          type="textarea"
          class="content-textarea"
          rows="7"
          autogrow
          placeholder="좋아하는 것, 중요하게 생각하는 가치, 어떤 관계를 바라는지 자유롭게 적어주세요."
          :rules="[(val) => !!val?.trim() || '상세 글을 입력해주세요.']"
        />

        <div class="row q-gutter-x-sm q-pt-md">
          <q-btn outline color="grey-7" class="col action-btn" label="취소" @click="onCancel" />
          <q-btn
            unelevated
            color="primary"
            class="col action-btn text-weight-bold"
            label="소개하기"
            type="submit"
            :disable="!canSubmit"
            :loading="submitting"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { selfIntroduceService } from 'src/services/selfIntroduceService';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const submitting = ref(false);
const loadedInitial = ref({ title: '', content: '' });

const form = reactive({
  title: '',
  content: ''
});

const postId = computed(() => route.params.id ? String(route.params.id) : '');
const pageTitle = computed(() => postId.value ? '셀프 소개 수정' : '셀프 소개 작성');
const canSubmit = computed(() => !!form.title.trim() && !!form.content.trim());
const isDirty = computed(() => {
  return form.title !== loadedInitial.value.title || form.content !== loadedInitial.value.content;
});

const loadPost = async () => {
  if (!postId.value) return;

  const { data, error } = await selfIntroduceService.getMine(postId.value);
  if (error) {
    $q.notify({ type: 'negative', message: error.message || '셀프 소개를 불러오지 못했어요.' });
    router.replace('/self-introduce');
    return;
  }

  if (!data) {
    $q.notify({ type: 'negative', message: '수정할 셀프 소개를 찾을 수 없어요.' });
    router.replace('/self-introduce');
    return;
  }

  form.title = data.title || '';
  form.content = data.content || '';
  loadedInitial.value = { title: form.title, content: form.content };
};

const onCancel = () => {
  if (!isDirty.value) {
    router.back();
    return;
  }

  $q.dialog({
    title: '나가기',
    message: '작성 중인 내용이 사라져요. 나가시겠어요?',
    cancel: { label: '계속 작성', flat: true },
    ok: { label: '나가기', color: 'primary' }
  }).onOk(() => {
    router.back();
  });
};

const onSubmit = async () => {
  if (!canSubmit.value || submitting.value) return;

  submitting.value = true;
  const { error } = await selfIntroduceService.savePost({
    id: postId.value || undefined,
    title: form.title,
    content: form.content
  });
  submitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '셀프 소개 저장에 실패했어요.' });
    return;
  }

  $q.notify({ type: 'positive', message: '셀프 소개를 저장했어요.' });
  router.replace('/self-introduce');
};

onMounted(() => {
  loadPost();
});
</script>

<style scoped lang="scss">
.self-introduce-edit-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.page-inner {
  padding-bottom: 96px;
}

.guide-section {
  padding: 8px 0 4px;
}

.tip-box {
  border: 1px solid #edf1f5;
  border-radius: 8px;
  background: #fbfcfd;
}

.content-textarea :deep(.q-field__native) {
  min-height: 220px;
  resize: vertical;
}

.action-btn {
  min-height: 42px;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
