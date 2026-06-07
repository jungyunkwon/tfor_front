<template>
  <q-page class="likes-page bg-white">
    <div class="page-inner q-pa-md">
      <q-tabs
        v-model="activeTab"
        dense
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="text-grey-7 q-mb-md"
        align="justify"
      >
        <q-tab name="received" label="받은 호감" />
        <q-tab name="sent" label="보낸 호감" />
      </q-tabs>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="errorMessage" class="empty-state q-pa-xl text-center">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-bold q-mt-md">호감 목록을 불러오지 못했어요.</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ errorMessage }}</div>
        <q-btn outline color="primary" label="다시 시도" class="q-mt-md" @click="loadLikes" />
      </div>

      <div v-else-if="items.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="favorite_border" size="48px" color="grey-4" />
        <div class="text-subtitle1 text-weight-bold text-grey-8 q-mt-md">{{ emptyTitle }}</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ emptyDescription }}</div>
      </div>

      <div v-else class="column q-gutter-y-sm">
        <q-card
          v-for="item in items"
          :key="item.likeId"
          flat
          bordered
          class="like-card q-pa-md cursor-pointer"
          @click="openProfile(item)"
        >
          <div class="row no-wrap justify-between items-start q-mb-sm">
            <div class="text-h6 text-weight-bold ellipsis">{{ item.profile.nickname }}</div>
            <div class="text-body2 text-grey-7 text-right meta-text">
              {{ formatMeta(item.profile) }}
            </div>
          </div>
          <div class="row q-gutter-xs">
            <q-badge
              v-for="tag in item.profile.tags"
              :key="tag"
              outline
              color="primary"
              class="tag-badge"
            >
              #{{ tag }}
            </q-badge>
            <span v-if="!item.profile.tags.length" class="text-caption text-grey-5">아직 등록된 성향 태그가 없어요.</span>
          </div>
        </q-card>
      </div>
    </div>

    <ProfileDetailDialog
      v-model="profileDialogOpen"
      :profile="selectedProfile"
      :cta-mode="activeTab === 'received' ? 'send-like' : ''"
      :status-text="activeTab === 'sent' ? '호감을 보낸 상대입니다' : ''"
      :loading="sendSubmitting"
      @cta="sendLikeBack"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { likesService } from 'src/services/likesService';
import ProfileDetailDialog from 'src/components/profile/ProfileDetailDialog.vue';

const $q = useQuasar();
const activeTab = ref('received');
const items = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const profileDialogOpen = ref(false);
const selectedItem = ref(null);
const sendSubmitting = ref(false);

const selectedProfile = computed(() => selectedItem.value?.profile || null);

const emptyTitle = computed(() => {
  return activeTab.value === 'received'
    ? '아직 받은 호감이 없어요.'
    : '아직 보낸 호감이 없어요.';
});

const emptyDescription = computed(() => {
  return activeTab.value === 'received'
    ? '프로필을 조금 더 채우면 나와 잘 맞는 사람들이 관심을 보낼 가능성이 높아져요.'
    : '마음에 드는 상대를 발견하면 가볍게 호감을 보내보세요.';
});

const formatMeta = (profile) => {
  if (!profile) return '';
  const ageText = profile.age ? `${profile.age}` : '-';
  return `${ageText} · ${profile.jobName || '-'}`;
};

const loadLikes = async () => {
  loading.value = true;
  errorMessage.value = '';

  const { data, error } = await likesService.getRecentLikeList({
    direction: activeTab.value,
    page: 1,
    pageSize: 50
  });

  loading.value = false;

  if (error) {
    errorMessage.value = error.message || '일시적인 오류가 발생했습니다.';
    items.value = [];
    return;
  }

  items.value = data?.items || [];
};

const openProfile = (item) => {
  selectedItem.value = item;
  profileDialogOpen.value = true;
};

const sendLikeBack = async () => {
  if (!selectedProfile.value?.userId || sendSubmitting.value) return;

  sendSubmitting.value = true;
  const { error } = await likesService.sendLike(selectedProfile.value.userId);
  sendSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: error.message || '호감 보내기에 실패했어요.' });
    return;
  }

  $q.notify({ type: 'positive', message: '호감을 보냈어요.' });
  profileDialogOpen.value = false;
  await loadLikes();
};

watch(activeTab, () => {
  profileDialogOpen.value = false;
  selectedItem.value = null;
  loadLikes();
});

onMounted(() => {
  loadLikes();
});
</script>

<style scoped lang="scss">
.likes-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.page-inner {
  padding-bottom: 96px;
}

.like-card {
  border-radius: 8px;
  border-color: #eef2f7;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--q-primary);
    background-color: #f8fafc;
  }
}

.meta-text {
  min-width: 96px;
}

.tag-badge {
  border-radius: 999px;
  padding: 4px 8px;
}

.empty-state {
  min-height: 360px;
}

</style>
