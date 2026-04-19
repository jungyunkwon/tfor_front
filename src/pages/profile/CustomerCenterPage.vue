<template>
  <q-page class="customer-center-page bg-white">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">고객센터</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <div class="container q-pa-md">

      <!-- ===== 문의 등록 영역 ===== -->
      <section class="form-section q-mb-xl">
        <div class="section-title text-weight-bold q-mb-md">1:1 문의 등록</div>

        <!-- 문의 유형 선택 -->
        <div class="q-mb-md">
          <label class="field-label">문의 유형 <span class="text-red">*</span></label>
          <q-select
            v-model="form.inquiryTypeCd"
            :options="inquiryTypeOptions"
            outlined
            dense
            emit-value
            map-options
            behavior="dialog"
            class="custom-input"
            placeholder="문의 유형을 선택해주세요"
          />
        </div>

        <!-- 제목 -->
        <div class="q-mb-md">
          <label class="field-label">제목 <span class="text-red">*</span></label>
          <q-input
            v-model="form.title"
            outlined
            dense
            placeholder="제목을 입력해주세요"
            class="custom-input"
            maxlength="100"
          />
        </div>

        <!-- 내용 -->
        <div class="q-mb-lg">
          <label class="field-label">내용 <span class="text-red">*</span></label>
          <q-input
            v-model="form.content"
            type="textarea"
            outlined
            dense
            rows="5"
            placeholder="문의 내용을 상세히 입력해주세요"
            class="custom-input"
          />
        </div>

        <!-- 등록 버튼 -->
        <q-btn
          label="등록하기"
          color="primary"
          unelevated
          class="full-width cta-button"
          :loading="saving"
          :disable="!isFormValid || saving"
          @click="onSubmit"
        />
      </section>

      <q-separator class="q-mb-xl" />

      <!-- ===== 내 문의 목록 영역 ===== -->
      <section>
        <div class="section-title text-weight-bold q-mb-md">내 문의 내역</div>

        <!-- 로딩 -->
        <div v-if="loading" class="flex flex-center q-pt-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- 빈 목록 -->
        <div
          v-else-if="inquiryList.length === 0"
          class="empty-state text-center q-pa-xl"
        >
          <q-icon name="inbox" size="60px" color="grey-4" class="q-mb-md" />
          <div class="text-grey-6 text-body2">등록된 문의가 없습니다.</div>
        </div>

        <!-- 목록 -->
        <div v-else class="inquiry-list">
          <div
            v-for="item in inquiryList"
            :key="item.inquiryId"
            class="inquiry-card q-mb-sm"
            :class="{ 'inquiry-card--active': selectedInquiryId === item.inquiryId }"
            @click="onSelectInquiry(item)"
          >
            <div class="row items-start justify-between q-mb-xs">
              <div class="inquiry-title text-weight-bold col">{{ item.title }}</div>
              <q-chip
                :label="getStatusLabel(item.answerStatusCd)"
                :color="getStatusColor(item.answerStatusCd)"
                text-color="white"
                dense
                class="q-ml-sm status-chip"
              />
            </div>
            <div class="row items-center justify-between">
              <span class="text-caption text-grey-6">{{ formatDate(item.createDt) }}</span>
              <span class="text-caption" :class="item.answeredYn ? 'text-primary' : 'text-grey-5'">
                {{ item.answeredYn ? '답변완료' : '답변대기' }}
              </span>
            </div>

            <!-- 상세 영역 (클릭 시 인라인 펼침) -->
            <div v-if="selectedInquiryId === item.inquiryId" class="inquiry-detail q-mt-md">
              <div v-if="detailLoading" class="flex flex-center q-py-md">
                <q-spinner-dots color="primary" size="30px" />
              </div>
              <template v-else-if="selectedInquiry">
                <!-- 문의 내용 -->
                <div class="detail-box q-pa-md q-mb-md">
                  <div class="text-caption text-grey-6 q-mb-xs">문의 내용</div>
                  <div class="text-body2 detail-content">{{ selectedInquiry.content }}</div>
                </div>

                <!-- 답변 영역 -->
                <div class="detail-box detail-box--answer q-pa-md">
                  <div class="text-caption text-grey-6 q-mb-xs">답변</div>
                  <template v-if="selectedInquiry.answerContent">
                    <div class="text-body2 detail-content q-mb-sm">{{ selectedInquiry.answerContent }}</div>
                    <div class="text-caption text-grey-5">{{ formatDate(selectedInquiry.answeredDt) }}</div>
                  </template>
                  <div v-else class="text-body2 text-grey-5">아직 답변이 등록되지 않았어요.</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { inquiryService } from 'src/services/inquiryService';
import { commonCodeService } from 'src/services/commonCodeService';
import { showSuccessToast, showErrorToast } from 'src/utils/notify';

const router = useRouter();

// ===== 상태값 =====
const loading = ref(false);
const saving = ref(false);
const detailLoading = ref(false);

const form = reactive({
  inquiryTypeCd: '',
  title: '',
  content: '',
});

const inquiryTypeOptions = ref([]);
const inquiryList = ref([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = 10;

const selectedInquiryId = ref('');
const selectedInquiry = ref(null);

// ===== Computed =====
const isFormValid = computed(() => {
  return (
    !!form.inquiryTypeCd &&
    form.title.trim().length > 0 &&
    form.content.trim().length > 0
  );
});

// ===== 코드 조회 =====
const fetchInquiryTypes = async () => {
  const { data, error } = await commonCodeService.getCodeListByGroup('inquiry_type_cd');
  if (error || !data?.codes?.length) {
    showErrorToast('문의 유형을 불러오지 못했어요.');
    return;
  }
  inquiryTypeOptions.value = data.codes.map(c => ({
    label: c.codeName,
    value: c.codeValue,
  }));
};

// ===== 목록 조회 =====
const fetchInquiryList = async () => {
  loading.value = true;
  try {
    const { data, error } = await inquiryService.getMyInquiryList({ page: page.value, pageSize });
    if (error) throw error;
    inquiryList.value = data?.items || [];
    totalCount.value = data?.totalCount || 0;
  } catch (e) {
    console.error(e);
    showErrorToast('문의 내역을 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
};

// ===== 문의 등록 =====
const onSubmit = async () => {
  if (!isFormValid.value || saving.value) return;
  saving.value = true;
  try {
    const { error } = await inquiryService.createInquiry({
      inquiryTypeCd: form.inquiryTypeCd,
      title: form.title.trim(),
      content: form.content.trim(),
    });
    if (error) throw error;

    showSuccessToast('문의가 등록되었습니다.');
    // 입력값 초기화
    form.inquiryTypeCd = '';
    form.title = '';
    form.content = '';
    // 목록 재조회
    await fetchInquiryList();
  } catch (e) {
    console.error(e);
    showErrorToast('문의를 등록하지 못했어요.');
  } finally {
    saving.value = false;
  }
};

// ===== 문의 상세 조회 =====
const onSelectInquiry = async (item) => {
  // 이미 선택된 항목 클릭 시 닫기
  if (selectedInquiryId.value === item.inquiryId) {
    selectedInquiryId.value = '';
    selectedInquiry.value = null;
    return;
  }

  selectedInquiryId.value = item.inquiryId;
  selectedInquiry.value = null;
  detailLoading.value = true;

  try {
    const { data, error } = await inquiryService.getInquiryDetail(item.inquiryId);
    if (error) throw error;
    selectedInquiry.value = data;
  } catch (e) {
    console.error(e);
    showErrorToast('문의 상세를 불러오지 못했어요.');
    selectedInquiryId.value = '';
  } finally {
    detailLoading.value = false;
  }
};

// ===== 유틸 =====
const STATUS_MAP = {
  RECEIVED: { label: '접수', color: 'grey-6' },
  IN_PROGRESS: { label: '처리중', color: 'blue-5' },
  ANSWERED: { label: '답변완료', color: 'primary' },
};

const getStatusLabel = (cd) => STATUS_MAP[cd]?.label || cd || '접수';
const getStatusColor = (cd) => STATUS_MAP[cd]?.color || 'grey-6';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const onBack = () => router.back();

// ===== 초기화 =====
onMounted(async () => {
  await Promise.all([fetchInquiryTypes(), fetchInquiryList()]);
});
</script>

<style scoped lang="scss">
.customer-center-page {
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

// 문의 카드
.inquiry-card {
  border: 1px solid #eeeeee;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: #8cc6f5;
    background: #f8fbff;
  }

  &--active {
    border-color: #1976D2;
    background: rgba(25, 118, 210, 0.03);
  }
}

.inquiry-title {
  font-size: 0.9rem;
  color: #1D1D1D;
  line-height: 1.4;
  word-break: break-all;
}

.status-chip {
  font-size: 0.7rem;
  height: 22px;
  flex-shrink: 0;
}

// 상세 영역
.inquiry-detail {
  border-top: 1px solid #eeeeee;
  padding-top: 16px;
}

.detail-box {
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eeeeee;

  &--answer {
    background: #f0f7ff;
    border-color: #d0e8ff;
  }
}

.detail-content {
  color: #1D1D1D;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  color: #bebebe;
}
</style>
