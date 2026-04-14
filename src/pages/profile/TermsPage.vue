<template>
  <q-page class="terms-page bg-white">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">이용약관</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <div class="container q-pa-md">

      <!-- 로딩 -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- 빈 상태 -->
      <div
        v-else-if="termsList.length === 0"
        class="empty-state text-center q-py-xl"
      >
        <q-icon name="description" size="60px" color="grey-4" class="q-mb-md" />
        <div class="text-body2 text-grey-6">현재 표시할 약관이 없습니다.</div>
      </div>

      <template v-else>
        <!-- 전체 동의 영역 -->
        <div class="all-agree-box q-pa-md q-mb-lg" @click="toggleAll">
          <div class="row items-center q-gutter-x-md">
            <q-checkbox
              v-model="allAgreed"
              color="primary"
              @click.stop
            />
            <div class="col">
              <div class="text-weight-bold text-body1">전체 동의하기</div>
              <div class="text-caption text-grey-6">필수 및 선택 약관에 모두 동의합니다</div>
            </div>
          </div>
        </div>

        <q-separator class="q-mb-lg" />

        <!-- 약관 목록 -->
        <div class="terms-list q-col-gutter-y-sm">
          <div
            v-for="term in termsList"
            :key="term.termsId"
            class="terms-card"
          >
            <div
              class="terms-card-header row items-center q-pa-md"
              @click="onToggleExpand(term.termsId)"
            >
              <q-checkbox
                v-model="agreementMap[term.termsId]"
                color="primary"
                @click.stop
              />
              <div class="col q-ml-sm">
                <div class="row items-center q-gutter-x-xs">
                  <q-chip
                    :label="term.requiredYn === 'Y' ? '필수' : '선택'"
                    :color="term.requiredYn === 'Y' ? 'primary' : 'grey-4'"
                    :text-color="term.requiredYn === 'Y' ? 'white' : 'grey-8'"
                    dense
                    class="required-chip"
                  />
                  <span class="text-body2 text-weight-bold">{{ term.title }}</span>
                </div>
                <div class="text-caption text-grey-5 q-mt-xs">ver {{ term.version }}</div>
              </div>
              <q-icon
                :name="expandedTermsId === term.termsId ? 'expand_less' : 'expand_more'"
                color="grey-5"
                size="20px"
              />
            </div>

            <!-- 약관 내용 (확장 시 표시) -->
            <q-slide-transition>
              <div v-if="expandedTermsId === term.termsId" class="terms-content q-pa-md">
                <div v-if="term.content" class="text-body2 text-grey-8 terms-text">
                  {{ term.content }}
                </div>
                <div v-else class="text-caption text-grey-5 text-center q-py-md">
                  약관 본문은 별도 페이지에서 확인하실 수 있습니다.
                </div>
              </div>
            </q-slide-transition>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <div class="q-mt-xl q-pb-xl">
          <q-btn
            label="동의 저장하기"
            color="primary"
            unelevated
            class="full-width cta-button"
            :loading="saving"
            :disable="!isRequiredAllAgreed || saving"
            @click="onSave"
          />
          <div v-if="!isRequiredAllAgreed" class="text-caption text-negative text-center q-mt-sm">
            필수 약관에 모두 동의해 주세요.
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { termsService } from 'src/services/termsService';
import { showSuccessToast, showErrorToast } from 'src/utils/notify';

const router = useRouter();

// ===== 상태값 =====
const loading = ref(false);
const saving = ref(false);
const termsList = ref([]);
const agreementMap = reactive({});
const expandedTermsId = ref('');

// ===== Computed =====
const allAgreed = computed({
  get: () => termsList.value.length > 0 && termsList.value.every(t => !!agreementMap[t.termsId]),
  set: (val) => termsList.value.forEach(t => { agreementMap[t.termsId] = val; })
});

const isRequiredAllAgreed = computed(() =>
  termsList.value
    .filter(t => t.requiredYn === 'Y')
    .every(t => !!agreementMap[t.termsId])
);

// ===== 전체 동의 토글 =====
const toggleAll = () => {
  const next = !allAgreed.value;
  termsList.value.forEach(t => { agreementMap[t.termsId] = next; });
};

// ===== 약관 내용 펼치기/접기 =====
const onToggleExpand = (termsId) => {
  expandedTermsId.value = expandedTermsId.value === termsId ? '' : termsId;
};

// ===== 약관 목록 조회 =====
const fetchTerms = async () => {
  loading.value = true;
  try {
    const { data, error } = await termsService.getCurrentTermsList();
    if (error) throw error;

    termsList.value = data?.termsList || [];

    // 동의 초기값 false로 세팅
    termsList.value.forEach(t => {
      agreementMap[t.termsId] = false;
    });
  } catch (e) {
    console.error(e);
    showErrorToast('약관 정보를 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
};

// ===== 동의 저장 =====
const onSave = async () => {
  if (!isRequiredAllAgreed.value || saving.value) return;
  saving.value = true;

  try {
    const agreements = termsList.value.map(t => ({
      termsId: t.termsId,
      agreedYn: agreementMap[t.termsId] ? 'Y' : 'N',
    }));

    const { data, error } = await termsService.agreeTerms({
      agreements,
      ipAddress: '',  // 클라이언트에서 IP 취득 불가 - 빈 값으로 전송
      userAgent: navigator.userAgent,
    });

    if (error) throw error;

    showSuccessToast('약관 동의가 저장되었습니다.');
    router.back();
  } catch (e) {
    console.error(e);
    showErrorToast('약관 동의 저장에 실패했어요.');
  } finally {
    saving.value = false;
  }
};

const onBack = () => router.back();

onMounted(() => {
  fetchTerms();
});
</script>

<style scoped lang="scss">
.terms-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

.container {
  padding-top: 24px;
}

// 전체 동의 박스
.all-agree-box {
  border: 2px solid #1976D2;
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.03);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(25, 118, 210, 0.06);
  }
}

// 약관 카드
.terms-card {
  border: 1px solid #eeeeee;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.terms-card-header {
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f8f9fa;
  }
}

.required-chip {
  font-size: 0.7rem;
  height: 20px;
  flex-shrink: 0;
}

// 약관 내용
.terms-content {
  border-top: 1px solid #eeeeee;
  background: #f8f9fa;
}

.terms-text {
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: keep-all;
  max-height: 200px;
  overflow-y: auto;
}

.cta-button {
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
}

.empty-state {
  color: #bebebe;
}
</style>
