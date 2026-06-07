<template>
  <q-page class="self-introduce-page bg-white">
    <div class="page-inner q-pa-md">
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5 text-weight-bold text-grey-9">셀프 소개</div>
        <q-btn unelevated color="primary" label="+ 셀프 소개" @click="goToEdit" />
      </div>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="errorMessage" class="empty-state q-pa-xl text-center">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-bold q-mt-md">셀프 소개를 불러오지 못했어요.</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ errorMessage }}</div>
        <q-btn outline color="primary" label="다시 시도" class="q-mt-md" @click="loadList" />
      </div>

      <div v-else-if="items.length === 0" class="empty-state q-pa-xl text-center">
        <q-icon name="article" size="48px" color="grey-4" />
        <div class="text-subtitle1 text-weight-bold text-grey-8 q-mt-md">아직 등록된 셀프 소개가 없어요.</div>
        <div class="text-body2 text-grey-6 q-mt-sm">나를 가장 잘 보여줄 이야기를 먼저 남겨보세요.</div>
        <q-btn unelevated color="primary" label="+ 셀프 소개" class="q-mt-lg" @click="goToEdit" />
      </div>

      <div v-else class="column q-gutter-y-md">
        <q-card
          v-for="item in items"
          :key="item.id"
          flat
          bordered
          class="intro-card q-pa-md cursor-pointer"
          @click="openDetail(item)"
        >
          <div class="row no-wrap q-gutter-x-md">
            <q-avatar size="64px" class="profile-avatar">
              <img v-if="item.profile?.mainPhoto" :src="item.profile.mainPhoto" />
              <q-icon v-else name="person" size="36px" color="grey-4" />
            </q-avatar>
            <div class="col">
              <div class="profile-name-row row items-center justify-between no-wrap q-gutter-x-sm">
                <div class="text-subtitle1 text-weight-bold ellipsis">{{ item.profile.nickname }}</div>
                <div class="profile-meta text-body2 text-grey-6 text-right">{{ formatMeta(item.profile) }}</div>
              </div>
              <div class="row q-gutter-xs q-mt-sm">
                <q-badge
                  v-for="tag in item.profile.tags"
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

          <div class="intro-copy q-mt-md">
            <div class="intro-title text-h6 text-weight-bold text-grey-9">{{ item.title }}</div>
            <div class="intro-preview text-body2 text-grey-7 q-mt-sm">{{ item.content }}</div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { selfIntroduceService } from 'src/services/selfIntroduceService';

const router = useRouter();
const items = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const formatMeta = (profile) => {
  if (!profile) return '';
  const ageText = profile.age ? `${profile.age}세` : '나이 미입력';
  return `${ageText} · ${profile.jobName || '직업 미입력'}`;
};

const loadList = async () => {
  loading.value = true;
  errorMessage.value = '';

  const { data, error } = await selfIntroduceService.getList();
  loading.value = false;

  if (error) {
    errorMessage.value = error.message || '일시적인 오류가 발생했습니다.';
    items.value = [];
    return;
  }

  items.value = data?.items || [];
};

const goToEdit = () => {
  router.push('/self-introduce/new');
};

const openDetail = (item) => {
  router.push(`/self-introduce/${item.id}`);
};

onMounted(() => {
  loadList();
});
</script>

<style scoped lang="scss">
.self-introduce-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.page-inner {
  padding-bottom: 96px;
}

.intro-card {
  border-radius: 8px;
  border-color: #edf1f5;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--q-primary);
    background-color: #fbfcfd;
  }
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

.intro-title {
  line-height: 1.35;
}

.intro-copy {
  padding: 14px 4px 2px;
}

.intro-preview {
  display: -webkit-box;
  line-height: 1.6;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.empty-state {
  min-height: 360px;
}
</style>
