<template>
  <q-page class="review-edit-page bg-white q-pb-xl">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-grey-9">
      <q-toolbar class="q-px-md">
        <q-btn flat round dense icon="arrow_back" @click="router.back()" />
        <q-toolbar-title class="text-weight-bold text-subtitle1">만남 후기 남기기</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="page-content q-pt-md">
      <!-- 안내 문구 -->
      <div class="info-banner q-px-md q-py-sm bg-grey-1 text-grey-7 text-caption">
        <div class="text-weight-bold q-mb-xs">이번 만남에 대한 후기를 남겨주세요</div>
        <div>남겨주신 평가는 더 나은 매칭 추천과 안전한 서비스 운영에 활용됩니다.</div>
        <div class="text-primary text-weight-medium q-mt-xs">※ 후기 내용은 상대방에게 그대로 공개되지 않아요.</div>
      </div>

      <!-- 상대방 요약 카드 -->
      <div class="target-card q-pa-md border-bottom">
        <div class="flex items-center no-wrap">
          <q-avatar size="60px" class="shadow-1">
            <img v-if="targetUser?.mainPhoto" :src="targetUser.mainPhoto" />
            <q-icon v-else name="person" size="40px" color="grey-3" />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-bold">{{ targetUser?.nickname || '로딩 중...' }}</div>
            <div class="text-caption text-grey-6">{{ targetUser?.info || '나이/지역 정보 미정' }}</div>
            <q-badge color="grey-2" text-color="grey-7" label="만남 종료" class="q-mt-xs" />
          </div>
        </div>
      </div>

      <!-- 1단계: 전체 만족도 -->
      <section class="review-section q-pa-md">
        <div class="section-title text-h6 text-weight-bold q-mb-md">이번 만남은 전반적으로 어땠나요?</div>
        <div class="satisfaction-row flex justify-between q-gutter-x-sm">
          <div 
            v-for="opt in satisfactionOptions" 
            :key="opt.value"
            class="satisfaction-item col flex flex-column items-center q-pa-sm rounded-borders cursor-pointer"
            :class="form.overallSatisfaction === opt.value ? 'bg-primary-1 border-primary' : 'bg-grey-1'"
            @click="form.overallSatisfaction = opt.value"
          >
            <q-icon :name="opt.icon" size="32px" :color="form.overallSatisfaction === opt.value ? 'primary' : 'grey-5'" />
            <div class="text-caption q-mt-xs" :class="form.overallSatisfaction === opt.value ? 'text-primary' : 'text-grey-7'">
              {{ opt.label }}
            </div>
          </div>
        </div>
      </section>

      <!-- 2단계: 매너 평가 -->
      <section class="review-section q-pa-md gray-bg">
        <div class="section-title text-h6 text-weight-bold q-mb-md">상대방의 매너는 어땠나요?</div>
        <div v-for="q in mannerQuestions" :key="q.id" class="q-mb-lg bg-white q-pa-md rounded-borders shadow-subtle">
          <div class="text-weight-bold q-mb-md">{{ q.text }}</div>
          <div class="flex q-gutter-x-sm">
            <q-btn
              v-for="opt in threePointOptions"
              :key="opt.value"
              unelevated
              :label="opt.label"
              class="col text-weight-medium"
              :color="form.manner[q.id] === opt.value ? opt.activeColor : 'grey-2'"
              :text-color="form.manner[q.id] === opt.value ? 'white' : 'grey-7'"
              @click="form.manner[q.id] = opt.value"
            />
          </div>
        </div>
      </section>

      <!-- 3단계: 프로필 일치 평가 -->
      <section class="review-section q-pa-md">
        <div class="section-title text-h6 text-weight-bold q-mb-md">프로필과 실제 모습은 얼마나 비슷했나요?</div>
        <div v-for="q in profileQuestions" :key="q.id" class="q-mb-lg q-pa-md border-grey rounded-borders">
          <div class="text-weight-bold q-mb-md">{{ q.text }}</div>
          <div class="flex q-gutter-x-sm">
            <q-btn
              v-for="opt in q.options || threePointOptions"
              :key="opt.value"
              unelevated
              :label="opt.label"
              class="col text-weight-medium"
              :color="form.profile[q.id] === opt.value ? 'primary' : 'grey-2'"
              :text-color="form.profile[q.id] === opt.value ? 'white' : 'grey-7'"
              @click="form.profile[q.id] = opt.value"
            />
          </div>
        </div>
      </section>

      <!-- 4단계: 궁합 평가 -->
      <section class="review-section q-pa-md gray-bg">
        <div class="section-title text-h6 text-weight-bold q-mb-md">두 분의 궁합은 어땠나요?</div>
        <div v-for="q in chemistryQuestions" :key="q.id" class="q-mb-lg bg-white q-pa-md rounded-borders shadow-subtle">
          <div class="text-weight-bold q-mb-md">{{ q.text }}</div>
          <div class="flex q-gutter-x-sm">
            <q-btn
              v-for="opt in q.options || threePointOptions"
              :key="opt.value"
              unelevated
              :label="opt.label"
              class="col text-weight-medium"
              :class="q.id === 'meetAgain' && form.chemistry[q.id] === opt.value ? 'text-h6' : ''"
              :color="form.chemistry[q.id] === opt.value ? getOptionColor(q, opt) : 'grey-2'"
              :text-color="form.chemistry[q.id] === opt.value ? 'white' : 'grey-7'"
              @click="form.chemistry[q.id] = opt.value"
            />
          </div>
        </div>
      </section>

      <!-- 5단계: 태그 선택 -->
      <section class="review-section q-pa-md">
        <div class="section-title text-h6 text-weight-bold q-mb-xs">상대방의 인상을 태그로 남겨주세요</div>
        <div class="text-caption text-grey-6 q-mb-md">잘 맞았던 점과 아쉬웠던 점을 선택해 주세요 (복수 선택 가능)</div>
        
        <div class="q-mb-lg">
          <div class="text-weight-bold text-primary q-mb-sm flex items-center">
            <q-icon name="sentiment_satisfied" class="q-mr-xs" /> 좋았던 점
          </div>
          <div class="flex wrap q-gutter-sm">
            <q-chip
              v-for="tag in positiveTags"
              :key="tag"
              clickable
              :selected="form.tags.positives.includes(tag)"
              @click="toggleTag('positives', tag)"
              color="primary"
              :outline="!form.tags.positives.includes(tag)"
              text-color="white"
            >
              {{ tag }}
            </q-chip>
          </div>
        </div>

        <div>
          <div class="text-weight-bold text-grey-7 q-mb-sm flex items-center">
            <q-icon name="sentiment_dissatisfied" class="q-mr-xs" /> 아쉬웠던 점
          </div>
          <div class="flex wrap q-gutter-sm">
            <q-chip
              v-for="tag in negativeTags"
              :key="tag"
              clickable
              :selected="form.tags.negatives.includes(tag)"
              @click="toggleTag('negatives', tag)"
              color="grey-7"
              :outline="!form.tags.negatives.includes(tag)"
              text-color="white"
            >
              {{ tag }}
            </q-chip>
          </div>
        </div>
      </section>

      <!-- 6단계: 자유 서술 -->
      <section class="review-section q-pa-md gray-bg">
        <div class="section-title text-h6 text-weight-bold q-mb-xs">추가로 남기고 싶은 후기가 있나요?</div>
        <div class="text-caption text-grey-6 q-mb-md">선택 입력이에요. 서비스 개선에 활용됩니다.</div>
        <q-input
          v-model="form.finalReview"
          type="textarea"
          outlined
          bg-color="white"
          placeholder="실제 만나보니 어떤 점이 좋았는지, 혹은 기대와 달랐던 부분이 있다면 자유롭게 작성해 주세요."
          rows="5"
          color="primary"
          counter
          maxlength="500"
        />
      </section>
    </div>

    <!-- 하단 고정 버튼 영역 -->
    <div class="action-footer fixed-bottom bg-white q-pa-md flex no-wrap items-center q-gutter-x-md">
      <q-btn outline color="grey-6" class="col-3 q-py-md" label="닫기" @click="router.back()" />
      <q-btn
        unelevated
        color="primary"
        class="col q-py-md text-weight-bold"
        :label="isCompleted ? '후기 제출하기' : '평가 항목을 완료해 주세요'"
        :disable="!isCompleted"
        :loading="submitting"
        @click="onClickSubmit"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { reviewService } from '../../services/reviewService';

const router = useRouter();
const $q = useQuasar();

const targetUser = ref(null);
const submitting = ref(false);

const satisfactionOptions = [
  { label: '매우 만족', value: 5, icon: 'sentiment_very_satisfied' },
  { label: '만족', value: 4, icon: 'sentiment_satisfied' },
  { label: '보통', value: 3, icon: 'sentiment_neutral' },
  { label: '아쉬움', value: 2, icon: 'sentiment_dissatisfied' },
  { label: '매우 아쉬움', value: 1, icon: 'sentiment_very_dissatisfied' },
];

const threePointOptions = [
  { label: '좋았어요', value: 3, activeColor: 'primary' },
  { label: '보통이에요', value: 2, activeColor: 'amber-7' },
  { label: '아쉬웠어요', value: 1, activeColor: 'red-5' },
];

const mannerQuestions = [
  { id: 'punctuality', text: '시간 약속은 잘 지켰나요?' },
  { id: 'attitude', text: '대화 태도는 예의 있었나요?' },
  { id: 'behavior', text: '불편하거나 부담스러운 행동은 없었나요?' },
];

const profileQuestions = [
  { id: 'visuals', text: '프로필과 실제 모습이 대체로 일치했나요?' },
  { id: 'personality', text: '자기소개/성격 설명이 실제와 비슷했나요?' },
  { id: 'accuracy', text: '과장되거나 다르게 느껴진 부분이 있었나요?', options: [
    { label: '없었어요', value: 3 },
    { label: '조금 있었어요', value: 2 },
    { label: '많이 있었어요', value: 1 },
  ]},
];

const chemistryQuestions = [
  { id: 'conversation', text: '대화가 잘 통했나요?' },
  { id: 'values', text: '가치관이 잘 맞는 편이었나요?' },
  { id: 'meetAgain', text: '다시 만나보고 싶은 마음이 드나요?', options: [
    { label: '만나고 싶어요', value: 3, color: 'primary' },
    { label: '잘 모르겠어요', value: 2, color: 'amber-8' },
    { label: '여기까지예요', value: 1, color: 'grey-7' },
  ]},
];

const positiveTags = ['배려있음', '대화편함', '솔직함', '유쾌함', '성실함', '리드형', '차분함', '적극적임'];
const negativeTags = ['말이 잘 안 통함', '자기중심적', '프로필과 다름', '소극적', '부담스러움', '예의 아쉬움', '가치관 차이 큼'];

const form = reactive({
  overallSatisfaction: null,
  manner: {},
  profile: {},
  chemistry: {},
  tags: {
    positives: [],
    negatives: [],
  },
  finalReview: '',
});

// 템플릿용 색상 도우미
const getOptionColor = (q, opt) => {
  if (q.id === 'meetAgain' && opt.color) return opt.color;
  return opt.activeColor || 'primary';
};

const isCompleted = computed(() => {
  if (!form.overallSatisfaction) return false;
  if (mannerQuestions.some(q => !form.manner[q.id])) return false;
  if (profileQuestions.some(q => !form.profile[q.id])) return false;
  if (chemistryQuestions.some(q => !form.chemistry[q.id])) return false;
  return true;
});

const toggleTag = (type, tag) => {
  const list = form.tags[type];
  const idx = list.indexOf(tag);
  if (idx > -1) list.splice(idx, 1);
  else list.push(tag);
};

const onClickSubmit = async () => {
  if (!isCompleted.value) return;

  $q.dialog({
    title: '후기 제출',
    message: '남겨주신 소중한 후기를 제출하시겠습니까?',
    cancel: true,
    ok: { label: '제출하기', color: 'primary', unelevated: true }
  }).onOk(async () => {
    submitting.value = true;
    
    // 간소화된manner_score 계산 (평균)
    const mannerTotal = Object.values(form.manner).reduce((a, b) => Number(a) + Number(b), 0);
    const avgScore = (Number(form.overallSatisfaction) + (Number(mannerTotal) / 3)) / 2;

    const payload = {
      matchId: targetUser.value.matchId,
      metYn: 'Y',
      contactExchangedYn: 'Y',
      ratingScore: Math.round(avgScore * 10) / 10,
      reviewText: JSON.stringify(form),
      reportYn: 'N'
    };

    const { data, error } = await reviewService.submitMatchReview(payload);
    
    if (!error && data?.success) {
      $q.notify({
        type: 'positive',
        message: `후기가 성공적으로 처리되었습니다. 보석 ${data.rewardDiamond}개가 지급되었습니다!`,
        position: 'center'
      });
      router.push('/matching');
    } else {
      $q.notify({ type: 'negative', message: '제출 중 오류가 발생했습니다.' });
    }
    submitting.value = false;
  });
};

onMounted(async () => {
  const { data } = await reviewService.getPendingReview();
  if (data?.hasPendingReview) {
    targetUser.value = {
      matchId: data.pendingMatchId,
      ...data.targetUserSummary,
      info: '나이/지역 정보 미제공' // 실제론 profileService에서 합쳐오거나 pending 정보 보강 필요
    };
  } else {
    $q.notify({ type: 'warning', message: '작성할 후기 데이터가 없습니다.' });
    router.back();
  }
});
</script>

<style scoped lang="scss">
.review-edit-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-content {
  padding-bottom: 100px;
}

.review-section {
  border-bottom: 1px solid #f2f2f2;
}

.gray-bg {
  background-color: #f9f9f9;
}

.satisfaction-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.bg-primary-1 {
  background-color: rgba(var(--q-primary-rgb), 0.05);
}

.border-primary {
  border: 1px solid var(--q-primary);
}

.border-grey {
  border: 1px solid #eeeeee;
}

.shadow-subtle {
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.action-footer {
  max-width: 600px;
  left: 50%;
  transform: translateX(-50%);
  border-top: 1px solid #eee;
  z-index: 1000;
}

.flex-column {
  flex-direction: column;
}
</style>
