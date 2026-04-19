<template>
  <q-page class="block-contacts-page bg-white">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">아는사람 만나지 않기</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <div class="container q-pa-md">

      <!-- ===== 안내 문구 ===== -->
      <div class="info-box q-pa-md q-mb-xl">
        <div class="row items-start q-gutter-x-sm">
          <q-icon name="block" color="grey-5" size="18px" class="q-mt-xs" />
          <div class="text-caption text-grey-6 col">
            차단한 사용자는 매칭 후보에서 제외되며, 서로 볼 수 없게 됩니다.<br>
            차단은 언제든지 해제할 수 있습니다.
          </div>
        </div>
      </div>

      <!-- ===== 차단 등록 영역 ===== -->
      <section class="form-section q-mb-xl">
        <div class="section-title text-weight-bold q-mb-md">차단 등록</div>

        <!-- 차단 대상 사용자 ID 입력 -->
        <div class="q-mb-md">
          <label class="field-label">차단할 사용자 ID <span class="text-red">*</span></label>
          <q-input
            v-model="form.blocked_user_id"
            outlined
            dense
            placeholder="차단할 사용자의 ID를 입력하세요"
            class="custom-input"
            clearable
          />
          <div class="text-caption text-grey-5 q-mt-xs">
            · 상대방 프로필 또는 채팅에서 사용자 ID를 확인할 수 있습니다
          </div>
        </div>

        <!-- 차단 사유 선택 -->
        <div class="q-mb-lg">
          <label class="field-label">차단 사유</label>
          <q-select
            v-model="form.block_reason_cd"
            :options="reasonOptions"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="custom-input"
            clearable
            placeholder="사유 선택 (선택사항)"
          />
        </div>

        <q-btn
          label="차단 등록"
          color="primary"
          unelevated
          class="full-width cta-button"
          :loading="saving"
          :disable="!form.blocked_user_id.trim() || saving"
          @click="onBlock"
        />
      </section>

      <q-separator class="q-mb-xl" />

      <!-- ===== 차단 목록 ===== -->
      <section>
        <div class="section-title text-weight-bold q-mb-md">차단 목록</div>

        <!-- 로딩 -->
        <div v-if="loading" class="flex flex-center q-pt-lg">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- 빈 목록 -->
        <div v-else-if="blockList.length === 0" class="empty-state text-center q-py-xl">
          <q-icon name="person_off" size="60px" color="grey-4" class="q-mb-md" />
          <div class="text-body2 text-grey-6">차단된 사용자가 없습니다.</div>
        </div>

        <!-- 차단 목록 -->
        <div v-else class="block-list">
          <div
            v-for="block in blockList"
            :key="block.blockId"
            class="block-card q-mb-sm row items-center justify-between"
          >
            <div class="col">
              <div class="block-user-id text-weight-bold text-body2 q-mb-xs">
                <q-icon name="person_off" size="16px" color="grey-6" class="q-mr-xs" />
                {{ block.blockedUserId }}
              </div>
              <div class="row items-center q-gutter-x-sm">
                <q-chip
                  v-if="block.blockReasonCd"
                  :label="getReasonLabel(block.blockReasonCd)"
                  color="grey-3"
                  text-color="grey-8"
                  dense
                  class="q-px-sm reason-chip"
                />
                <span class="text-caption text-grey-5">{{ formatDate(block.createDt) }}</span>
              </div>
            </div>

            <q-btn
              flat
              dense
              label="해제"
              color="grey-6"
              class="unblock-btn q-ml-md"
              :loading="unblockingId === block.blockId"
              @click="onUnblock(block)"
            />
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { blockService } from 'src/services/blockService';
import { showSuccessToast, showErrorToast } from 'src/utils/notify';

const router = useRouter();
const $q = useQuasar();

// ===== 상태값 =====
const loading = ref(false);
const saving = ref(false);
const unblockingId = ref('');

const form = reactive({
  blocked_user_id: '',
  block_reason_cd: '',
});

const blockList = ref([]);

// ===== 차단 사유 옵션 (정적 정의 - block_reason_cd 코드그룹 미확인) =====
const reasonOptions = [
  { label: '불쾌한 행동', value: 'RUDE_BEHAVIOR' },
  { label: '스팸/도배', value: 'SPAM' },
  { label: '아는 사람', value: 'ACQUAINTANCE' },
  { label: '기타', value: 'ETC' },
];

const getReasonLabel = (cd) =>
  reasonOptions.find(r => r.value === cd)?.label || cd || '';

// ===== 목록 조회 =====
const fetchBlockList = async () => {
  loading.value = true;
  try {
    const { data, error } = await blockService.getMyBlockList();
    if (error) throw error;
    blockList.value = data?.items || [];
  } catch (e) {
    console.error(e);
    showErrorToast('차단 목록을 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
};

// ===== 차단 등록 =====
const onBlock = async () => {
  if (!form.blocked_user_id.trim() || saving.value) return;

  saving.value = true;
  try {
    const { error } = await blockService.createBlock({
      blockedUserId: form.blocked_user_id.trim(),
      blockReasonCd: form.block_reason_cd || undefined,
    });

    if (error) throw new Error(error.message);

    showSuccessToast('차단이 등록되었습니다.');
    form.blocked_user_id = '';
    form.block_reason_cd = '';
    await fetchBlockList();
  } catch (e) {
    console.error(e);
    showErrorToast(e.message || '차단 정보를 처리하지 못했어요.');
  } finally {
    saving.value = false;
  }
};

// ===== 차단 해제 =====
const onUnblock = (block) => {
  $q.dialog({
    title: '차단 해제',
    message: `해당 사용자의 차단을 해제하시겠습니까?`,
    cancel: { label: '취소', flat: true },
    ok: { label: '해제', color: 'primary', flat: true },
  }).onOk(async () => {
    unblockingId.value = block.blockId;
    try {
      const { error } = await blockService.removeBlock(block.blockId);
      if (error) throw error;
      showSuccessToast('차단이 해제되었습니다.');
      await fetchBlockList();
    } catch (e) {
      console.error(e);
      showErrorToast('차단 해제에 실패했어요.');
    } finally {
      unblockingId.value = '';
    }
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const onBack = () => router.back();

onMounted(() => {
  fetchBlockList();
});
</script>

<style scoped lang="scss">
.block-contacts-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

.container {
  padding-top: 24px;
}

.section-title {
  font-size: 1rem;
  color: #1D1D1D;
  letter-spacing: -0.3px;
}

.field-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1D1D1D;
  margin-bottom: 8px;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.cta-button {
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
}

.info-box {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eeeeee;
}

// 차단 카드
.block-card {
  border: 1px solid #eeeeee;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fff;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #d0d0d0;
  }
}

.block-user-id {
  color: #1D1D1D;
  word-break: break-all;
}

.reason-chip {
  font-size: 0.7rem;
  height: 20px;
}

.unblock-btn {
  font-size: 0.82rem;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 4px 12px;
  flex-shrink: 0;
}

.empty-state {
  color: #bebebe;
}
</style>
