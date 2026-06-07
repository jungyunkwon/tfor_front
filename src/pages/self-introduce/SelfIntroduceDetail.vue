<template>
  <q-page class="self-introduce-detail-page bg-white">
    <div class="page-inner q-pa-md">
      <div class="row items-center q-mb-md">
        <q-btn flat round dense icon="arrow_back" @click="router.back()" />
      </div>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="errorMessage" class="empty-state q-pa-xl text-center">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-bold q-mt-md">셀프 소개를 불러오지 못했어요.</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ errorMessage }}</div>
        <q-btn outline color="primary" label="목록으로" class="q-mt-md" @click="router.replace('/self-introduce')" />
      </div>

      <template v-else-if="post">
        <div class="profile-section row no-wrap items-center q-gutter-x-md q-mb-xl">
          <q-avatar size="72px" class="profile-avatar">
            <img v-if="post.profile?.mainPhoto" :src="post.profile.mainPhoto" />
            <q-icon v-else name="person" size="42px" color="grey-4" />
          </q-avatar>
          <div class="col">
            <div class="row items-center justify-between no-wrap">
              <div class="col">
                <div class="profile-name-row row items-center justify-between no-wrap q-gutter-x-sm">
                  <div class="text-h6 text-weight-bold ellipsis">{{ post.profile?.nickname }}</div>
                  <div class="profile-meta text-body2 text-grey-6 text-right">{{ formatMeta(post.profile) }}</div>
                </div>
              </div>
              <q-btn
                v-if="post.isMine"
                outline
                color="primary"
                icon="edit"
                label="수정"
                @click="goToEdit"
              />
              <q-btn
                v-else
                unelevated
                color="primary"
                icon="favorite"
                label="관심 전하기"
                :loading="interestSubmitting"
                @click="sendInterest(post.userId)"
              />
            </div>
            <div class="row q-gutter-xs q-mt-sm">
              <q-badge
                v-for="tag in post.profile?.tags || []"
                :key="tag"
                outline
                color="primary"
                class="tag-badge"
              >
                #{{ tag }}
              </q-badge>
            </div>
          </div>
        </div>

        <article class="article-section q-mb-xl">
          <h1 class="article-title">{{ post.title }}</h1>
          <p class="article-content">{{ post.content }}</p>
        </article>

        <section v-if="!post.isMine" class="interest-form q-pa-md q-mb-xl">
          <div class="text-subtitle1 text-weight-bold text-grey-9">어떤 점이 인상적이었나요?</div>
          <q-input
            v-model="commentForm"
            outlined
            counter
            maxlength="300"
            type="textarea"
            autogrow
            class="q-mt-md"
            placeholder="소개글을 읽고 느낀 관심을 전해보세요."
          />
          <div class="row justify-end q-mt-sm">
            <q-btn
              unelevated
              color="primary"
              label="관심 전하기"
              :disable="!commentForm.trim()"
              :loading="commentSubmitting"
              @click="submitComment()"
            />
          </div>
        </section>

        <section>
          <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">전해진 관심</div>

          <div v-if="rootComments.length === 0" class="interest-empty q-pa-lg text-center">
            <q-icon name="favorite_border" size="40px" color="grey-4" />
            <div class="text-body2 text-grey-6 q-mt-sm">아직 전해진 관심이 없어요.</div>
          </div>

          <div v-else class="column q-gutter-y-md">
            <div v-for="comment in rootComments" :key="comment.id" class="interest-item q-pa-md">
              <CommentBlock
                :comment="comment"
                :post="post"
                :editing-id="editingCommentId"
                :edit-content="editContent"
                :replying-id="replyingCommentId"
                :reply-content="replyContent"
                :submitting="commentSubmitting || interestSubmitting"
                @start-edit="startEdit"
                @cancel-edit="cancelEdit"
                @update-edit-content="setEditContent"
                @save-edit="saveCommentEdit"
                @start-reply="startReply"
                @cancel-reply="cancelReply"
                @update-reply-content="setReplyContent"
                @save-reply="submitReply"
                @send-interest="sendInterest"
              />

              <div v-if="childComments(comment.id).length" class="reply-list q-mt-md">
                <CommentBlock
                  v-for="reply in childComments(comment.id)"
                  :key="reply.id"
                  :comment="reply"
                  :post="post"
                  :editing-id="editingCommentId"
                  :edit-content="editContent"
                  :replying-id="replyingCommentId"
                  :reply-content="replyContent"
                  :submitting="commentSubmitting || interestSubmitting"
                  is-reply
                  @start-edit="startEdit"
                  @cancel-edit="cancelEdit"
                  @update-edit-content="setEditContent"
                  @save-edit="saveCommentEdit"
                  @start-reply="startReply"
                  @cancel-reply="cancelReply"
                  @update-reply-content="setReplyContent"
                  @save-reply="submitReply"
                  @send-interest="sendInterest"
                />
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, resolveComponent } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { selfIntroduceService } from 'src/services/selfIntroduceService';

const CommentBlock = defineComponent({
  props: {
    comment: { type: Object, required: true },
    post: { type: Object, required: true },
    editingId: { type: String, default: '' },
    editContent: { type: String, default: '' },
    replyingId: { type: String, default: '' },
    replyContent: { type: String, default: '' },
    submitting: { type: Boolean, default: false },
    isReply: { type: Boolean, default: false }
  },
  emits: [
    'start-edit',
    'cancel-edit',
    'update-edit-content',
    'save-edit',
    'start-reply',
    'cancel-reply',
    'update-reply-content',
    'save-reply',
    'send-interest'
  ],
  setup(props, { emit }) {
    const QBtn = resolveComponent('q-btn');
    const QInput = resolveComponent('q-input');
    const isEditing = () => props.editingId === props.comment.id;
    const isReplying = () => props.replyingId === props.comment.id;
    const canSendInterest = () => props.post.isMine && props.comment.userId !== props.post.userId;

    return () => h('div', { class: ['comment-block', props.isReply ? 'is-reply' : ''] }, [
      h('div', { class: 'row items-start justify-between no-wrap q-gutter-x-sm' }, [
        h('div', { class: 'col' }, [
          h('div', { class: 'row items-center q-gutter-x-sm' }, [
            h('span', { class: 'text-subtitle2 text-weight-bold text-grey-9' }, props.comment.profile?.nickname || '알 수 없음'),
            h('span', { class: 'text-caption text-grey-5' }, formatDate(props.comment.createdAt))
          ])
        ]),
        h('div', { class: 'row no-wrap q-gutter-x-xs' }, [
          canSendInterest() && h(QBtn, {
            flat: true,
            dense: true,
            round: true,
            icon: 'favorite',
            color: 'primary',
            loading: props.submitting,
            onClick: () => emit('send-interest', props.comment.userId)
          }),
          props.comment.isMine && h(QBtn, {
            flat: true,
            dense: true,
            round: true,
            icon: 'edit',
            color: 'grey-7',
            onClick: () => emit('start-edit', props.comment)
          })
        ])
      ]),
      isEditing()
        ? h('div', { class: 'q-mt-sm' }, [
            h(QInput, {
              modelValue: props.editContent,
              outlined: true,
              dense: true,
              counter: true,
              maxlength: 300,
              type: 'textarea',
              autogrow: true,
              'onUpdate:modelValue': (value) => emit('update-edit-content', value)
            }),
            h('div', { class: 'row justify-end q-gutter-x-sm q-mt-sm' }, [
              h(QBtn, { flat: true, label: '취소', onClick: () => emit('cancel-edit') }),
              h(QBtn, {
                unelevated: true,
                color: 'primary',
                label: '저장',
                disable: !props.editContent.trim(),
                loading: props.submitting,
                onClick: () => emit('save-edit', props.comment)
              })
            ])
          ])
        : h('div', { class: 'comment-content text-body2 text-grey-8 q-mt-sm' }, props.comment.content),
      !props.isReply && h('div', { class: 'q-mt-sm' }, [
        h(QBtn, {
          flat: true,
          dense: true,
          color: 'grey-7',
          icon: 'reply',
          label: '답장',
          onClick: () => emit('start-reply', props.comment)
        })
      ]),
      isReplying() && h('div', { class: 'q-mt-sm' }, [
        h(QInput, {
          modelValue: props.replyContent,
          outlined: true,
          dense: true,
          counter: true,
          maxlength: 300,
          type: 'textarea',
          autogrow: true,
          placeholder: '답장을 남겨보세요.',
          'onUpdate:modelValue': (value) => emit('update-reply-content', value)
        }),
        h('div', { class: 'row justify-end q-gutter-x-sm q-mt-sm' }, [
          h(QBtn, { flat: true, label: '취소', onClick: () => emit('cancel-reply') }),
          h(QBtn, {
            unelevated: true,
            color: 'primary',
            label: '답장',
            disable: !props.replyContent.trim(),
            loading: props.submitting,
            onClick: () => emit('save-reply', props.comment)
          })
        ])
      ])
    ]);
  }
});

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const post = ref(null);
const comments = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const commentForm = ref('');
const commentSubmitting = ref(false);
const interestSubmitting = ref(false);
const editingCommentId = ref('');
const editContent = ref('');
const replyingCommentId = ref('');
const replyContent = ref('');

const postId = computed(() => String(route.params.id || ''));
const rootComments = computed(() => comments.value.filter((comment) => !comment.parentCommentId));

const formatMeta = (profile) => {
  if (!profile) return '';
  const ageText = profile.age ? `${profile.age}세` : '나이 미입력';
  return `${ageText} · ${profile.jobName || '직업 미입력'}`;
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const childComments = (commentId) => {
  return comments.value.filter((comment) => comment.parentCommentId === commentId);
};

const loadDetail = async () => {
  loading.value = true;
  errorMessage.value = '';

  const { data, error } = await selfIntroduceService.getDetail(postId.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message || '일시적인 오류가 발생했습니다.';
    return;
  }

  post.value = data.post;
  comments.value = data.comments || [];
};

const goToEdit = () => {
  router.push(`/self-introduce/${post.value.id}/edit`);
};

const submitComment = async () => {
  if (!commentForm.value.trim() || commentSubmitting.value) return;

  commentSubmitting.value = true;
  const { error } = await selfIntroduceService.addComment(postId.value, commentForm.value);
  commentSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '관심 전하기에 실패했어요.' });
    return;
  }

  commentForm.value = '';
  await loadDetail();
};

const startEdit = (comment) => {
  editingCommentId.value = comment.id;
  editContent.value = comment.content;
};

const setEditContent = (value) => {
  editContent.value = value;
};

const cancelEdit = () => {
  editingCommentId.value = '';
  editContent.value = '';
};

const saveCommentEdit = async (comment) => {
  if (!editContent.value.trim() || commentSubmitting.value) return;

  commentSubmitting.value = true;
  const { error } = await selfIntroduceService.updateComment(comment.id, editContent.value);
  commentSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '관심 메시지 수정에 실패했어요.' });
    return;
  }

  cancelEdit();
  await loadDetail();
};

const startReply = (comment) => {
  replyingCommentId.value = comment.id;
  replyContent.value = '';
};

const setReplyContent = (value) => {
  replyContent.value = value;
};

const cancelReply = () => {
  replyingCommentId.value = '';
  replyContent.value = '';
};

const submitReply = async (comment) => {
  if (!replyContent.value.trim() || commentSubmitting.value) return;

  commentSubmitting.value = true;
  const { error } = await selfIntroduceService.addComment(postId.value, replyContent.value, comment.id);
  commentSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '답장을 남기지 못했어요.' });
    return;
  }

  cancelReply();
  await loadDetail();
};

const sendInterest = async (receiverUserId) => {
  if (!receiverUserId || interestSubmitting.value) return;

  interestSubmitting.value = true;
  const { error } = await selfIntroduceService.sendInterest(receiverUserId);
  interestSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '관심 보내기에 실패했어요.' });
    return;
  }

  $q.notify({ type: 'positive', message: '관심을 보냈어요.' });
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped lang="scss">
.self-introduce-detail-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.page-inner {
  padding-bottom: 96px;
}

.profile-avatar {
  background: #f3f5f7;
  flex: 0 0 auto;
}

.profile-name-row {
  min-width: 0;
}

.profile-meta {
  flex: 0 0 auto;
  max-width: 150px;
}

.tag-badge {
  border-radius: 999px;
  padding: 4px 8px;
}

.article-section {
  padding: 16px 6px 28px;
}

.article-title {
  margin: 0;
  color: #1f2937;
  font-size: 28px;
  line-height: 1.35;
  font-weight: 800;
}

.article-content {
  margin: 24px 0 0;
  color: #374151;
  font-size: 16px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.interest-form,
.interest-item,
.interest-empty {
  border: 1px solid #edf1f5;
  border-radius: 8px;
  background: #fbfcfd;
}

.reply-list {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #edf1f5;
}

.comment-block + .comment-block {
  margin-top: 16px;
}

.comment-content {
  line-height: 1.7;
  white-space: pre-wrap;
}

.empty-state {
  min-height: 360px;
}
</style>
