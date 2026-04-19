<template>
  <q-page class="profile-values-edit-page bg-white">
    <!-- Header -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">가치관 답변 수정</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <!-- Content -->
    <div class="q-pa-md container" v-if="loading">
      <div class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </div>

    <div v-else class="q-pa-md container">
      <!-- 설문 섹션 반복 -->
      <div v-for="section in sections" :key="section.code" class="q-mb-xl">
        <div class="section-title text-h6 text-weight-bold q-mb-md">{{ section.title }}</div>
        
        <div class="q-col-gutter-y-lg">
          <div v-for="q in questionGroups[section.code]" :key="q.surveyQuestionId" class="question-item">
            <div class="row justify-between items-center q-mb-sm">
              <label class="section-label">
                {{ q.questionText }}
                <span v-if="q.requiredYn === 'Y'" class="text-red q-ml-xs">*</span>
              </label>
              <!-- 텍스트 질문인 경우 글자 수 표시 (Step2-5 디자인 반영) -->
              <span 
                v-if="q.questionTypeCd === 'TEXTAREA'"
                class="text-caption"
                :class="getTextCount(q.surveyQuestionId) < 30 ? 'text-grey-6' : 'text-primary'"
              >
                {{ getTextCount(q.surveyQuestionId) }} / 30자 이상
              </span>
            </div>

            <!-- 타입별 컴폰너트 분기 -->
            <!-- 1. 선택형 (RadioCard) -->
            <RadioCard
              v-if="q.questionTypeCd === 'CHOICE' || q.questionTypeCd === 'SELECT'"
              :model-value="answerMap[q.surveyQuestionId]?.surveyOptionId"
              :options="q.options.map(o => ({ label: o.optionText, value: o.surveyOptionId }))"
              @update:model-value="updateChoiceAnswer(q.surveyQuestionId, $event)"
            />

            <!-- 2. 서술형 (TEXTAREA) -->
            <q-input
              v-else-if="q.questionTypeCd === 'TEXTAREA' || q.questionTypeCd === 'TEXT'"
              v-model="answerMap[q.surveyQuestionId].answerText"
              type="textarea"
              outlined
              dense
              rows="5"
              class="custom-input"
              placeholder="자신의 생각을 구체적으로 작성해 주세요"
            />

            <!-- 3. 숫자형 (NUMBER) -->
            <q-input
              v-else-if="q.questionTypeCd === 'NUMBER'"
              v-model.number="answerMap[q.surveyQuestionId].answerNumber"
              type="number"
              outlined
              dense
              class="custom-input"
            />

            <!-- 4. 복합형 (JSON) -> SelectChip 다중 선택으로 처리 -->
            <SelectChip
              v-else-if="q.questionTypeCd === 'JSON'"
              :model-value="answerMap[q.surveyQuestionId].answerJson?.value || []"
              :options="q.options.map(o => ({ label: o.optionText, value: o.optionValue }))"
              multiple
              @update:model-value="updateJsonAnswer(q.surveyQuestionId, $event)"
            />
          </div>
        </div>

        <!-- 해당 섹션에 질문이 없는 경우 -->
        <div v-if="!questionGroups[section.code] || questionGroups[section.code].length === 0" class="text-grey-6 text-center q-pa-md">
          질문이 없습니다.
        </div>
      </div>

      <!-- 제출 버튼 -->
      <div class="q-mt-xl q-pb-xl">
        <q-btn
          label="저장하기"
          color="primary"
          class="full-width cta-button"
          unelevated
          :loading="saving"
          :disable="!isFormValid || saving"
          @click="onSave"
        />
      </div>
    </div>

    <!-- 빈 상태 표시 -->
    <div v-if="!loading && Object.keys(questionGroups).every(k => questionGroups[k].length === 0)" class="flex flex-center q-pa-xl">
      <div class="text-center">
        <q-icon name="assignment_late" size="60px" color="grey-4" class="q-mb-md" />
        <div class="text-grey-6">등록된 질문이 없습니다.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import RadioCard from 'src/components/common/RadioCard.vue';
import SelectChip from 'src/components/common/SelectChip.vue';
import { surveyService } from 'src/services/surveyService';
import { showSuccessToast, showErrorToast } from 'src/utils/notify';

const router = useRouter();

const loading = ref(true);
const saving = ref(false);

const sections = [
  { code: 'LIFESTYLE', title: '라이프스타일' },
  { code: 'RELATIONSHIP', title: '연애 스타일' },
  { code: 'PERSONALITY', title: '성격 / 감정' },
  { code: 'VALUES', title: '가치관 / 커리어' }
];

const questionGroups = reactive({
  LIFESTYLE: [],
  RELATIONSHIP: [],
  PERSONALITY: [],
  VALUES: []
});

const answerMap = reactive({});
const rawQuestions = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    // 1. 질문 목록 조회 (모든 섹션 병렬 조회)
    const questionRequests = sections.map(s => surveyService.getSurveyQuestions(s.code));
    const questionResponses = await Promise.all(questionRequests);
    
    // 2. 답변 목록 조회
    const { data: answerData, error: answerError } = await surveyService.getMySurveyAnswers();
    if (answerError) throw answerError;

    // 질문 매핑 및 초기 답변 구조 생성
    questionResponses.forEach((res, idx) => {
      const code = sections[idx].code;
      const questions = res.data?.questions || [];
      questionGroups[code] = questions;
      
      questions.forEach(q => {
        // 모든 질문에 대해 기본 답변 객체 생성
        answerMap[q.surveyQuestionId] = {
          surveyQuestionId: q.surveyQuestionId,
          surveyOptionId: null,
          answerText: '',
          answerNumber: null,
          answerJson: null,
        };
        rawQuestions.value.push(q);
      });
    });

    // 기존 답변 세팅
    if (answerData?.answers) {
      answerData.answers.forEach(ans => {
        if (answerMap[ans.survey_question_id]) {
          answerMap[ans.survey_question_id].surveyOptionId = ans.survey_option_id;
          answerMap[ans.survey_question_id].answerText = ans.answer_text || '';
          answerMap[ans.survey_question_id].answerNumber = ans.answer_number;
          answerMap[ans.survey_question_id].answerJson = ans.answer_json;
        }
      });
    }

  } catch (error) {
    console.error('Failed to load data:', error);
    showErrorToast('가치관 답변을 불러오지 못했어요.');
  } finally {
    loading.value = false;
  }
};

const updateChoiceAnswer = (qId, optionId) => {
  answerMap[qId].surveyOptionId = optionId;
};

const updateJsonAnswer = (qId, values) => {
  answerMap[qId].answerJson = { value: values };
};

const getTextCount = (qId) => {
  return (answerMap[qId]?.answerText || '').trim().length;
};

const isFormValid = computed(() => {
  // 필수 질문 체크
  for (const qId in answerMap) {
    const ans = answerMap[qId];
    const q = rawQuestions.value.find(item => item.surveyQuestionId === qId);
    if (!q) continue;

    if (q.requiredYn === 'Y') {
      if (q.questionTypeCd === 'CHOICE' || q.questionTypeCd === 'SELECT') {
        if (!ans.surveyOptionId) return false;
      } else if (q.questionTypeCd === 'TEXTAREA' || q.questionTypeCd === 'TEXT') {
        if (ans.answerText.trim().length < 30) return false; // 기존 스텝 규칙: 30자 이상
      } else if (q.questionTypeCd === 'NUMBER') {
        if (ans.answerNumber === null) return false;
      } else if (q.questionTypeCd === 'JSON') {
        if (!ans.answerJson?.value || ans.answerJson.value.length === 0) return false;
      }
    }
  }
  return true;
});

const onSave = async () => {
  if (saving.value) return;
  saving.value = true;
  
  try {
    const answersToSave = Object.values(answerMap).filter(ans => {
      // 값이 있는 경우만 전송 (또는 전체 전송 후 upsert)
      return ans.surveyOptionId || ans.answerText || ans.answerNumber || ans.answerJson;
    });

    const { error } = await surveyService.saveSurveyAnswers(answersToSave);
    if (error) throw error;

    showSuccessToast('가치관 답변이 저장되었습니다.');
    router.back();
  } catch (error) {
    console.error('Save failed:', error);
    showErrorToast('가치관 답변 저장에 실패했어요.');
  } finally {
    saving.value = false;
  }
};

const onBack = () => {
  router.back();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="sass">
.profile-values-edit-page
  max-width: 600px
  margin: 0 auto
  min-height: 100vh

.container
  padding-top: 24px

.section-title
  font-size: 1.25rem
  color: #1D1D1D
  border-left: 4px solid var(--q-primary)
  padding-left: 12px
  margin-top: 32px

.section-label
  display: block
  font-weight: 600
  color: #1D1D1D
  font-size: 0.95rem
  line-height: 1.4

.custom-input
  :deep(.q-field__control)
    border-radius: 8px

.cta-button
  height: 52px
  border-radius: 12px
  font-weight: bold
  font-size: 1.1rem

.question-item
  padding-bottom: 8px
</style>
