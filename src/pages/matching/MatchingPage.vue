<template>
  <q-page class="matching-page bg-white">
    <!-- 로딩 상태 -->
    <div v-if="matchingStore.isLoading" class="flex flex-center full-height">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 데이터 로드 결과 없음 -->
    <div v-else-if="matchingStore.matchStatus === 'NONE'" class="flex flex-center full-height q-pa-xl text-center">
      <div>
        <q-icon name="person_search" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-5 q-mt-md">현재 추천할 수 있는 인연이 없습니다.</div>
        <div class="text-body2 text-grey-5 q-mt-sm">프로필을 완성하고 더 많은 인연을 만나보세요!</div>
        <q-btn
          unelevated
          color="primary"
          class="q-mt-md q-py-md text-weight-bold"
          label="프로필 완성하기"
          @click="goToProfile"
        />
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div v-else class="page-content q-pb-xl">
      <!-- 상단 브랜드 영역 -->
      <div class="brand-header q-pa-md">
        <div class="text-h5 text-weight-bold text-primary">티포</div>
        <div v-if="matchingStore.matchStatus === 'MATCHED'" class="text-subtitle1 text-weight-medium q-mt-sm text-secondary">
          매칭 진행중입니다.
        </div>
      </div>

      <!-- 프로필 요약 카드 -->
      <div class="profile-summary-section q-pa-md flex no-wrap items-center">
        <div class="profile-avatar-container">
          <q-avatar size="100px" class="shadow-1">
            <img v-if="matchingStore.currentProfile?.mainPhoto" :src="matchingStore.currentProfile.mainPhoto" />
            <q-icon v-else name="person" size="60px" color="grey-4" />
          </q-avatar>
        </div>
        <div class="profile-info-container q-ml-lg flex-1">
          <div class="flex items-end q-gutter-x-sm q-mb-xs">
            <span class="text-h6 text-weight-bold">{{ matchingStore.currentProfile?.nickname }}</span>
            <span class="text-subtitle1 text-grey-7">{{ matchingStore.currentProfile?.age }}세</span>
          </div>
          <div class="tags-container flex q-gutter-xs q-mb-sm">
            <q-badge outline color="primary" label="계획형" />
            <q-badge outline color="primary" label="비흡연" />
          </div>
          <div class="intro-text text-body2 text-grey-8 line-clamp-2">
            {{ matchingStore.currentProfile?.introText || '반가워요! 함께 즐거운 시간 보내요.' }}
          </div>
        </div>
      </div>

      <!-- 연락처 노출 영역 (매칭 완료 시) -->
      <div v-if="matchingStore.matchStatus === 'MATCHED'" class="contact-section q-mx-md q-my-lg q-pa-lg bg-primary-1 rounded-borders border-primary">
        <div class="text-weight-bold text-primary q-mb-sm">상대방 연락처</div>
        <div class="text-h6">{{ matchingStore.currentProfile?.contactInfo || '010-1234-5678' }}</div>
      </div>

      <!-- 상세 정보 (Q&A 섹션) -->
      <div class="qa-section q-pa-md">
        <div v-for="(qa, index) in qaData" :key="index" class="qa-item q-mb-xl">
          <div class="question text-h6 text-weight-bold q-mb-sm text-grey-9">
            {{ qa.question }}
          </div>
          <div class="answer text-body1 text-grey-8 leading-relaxed">
            {{ qa.answer }}
          </div>
        </div>
      </div>

      <!-- 하단 액션 버튼 영역 -->
      <div class="action-footer fixed-bottom bg-white q-pa-md flex q-gutter-x-md">
        <template v-if="matchingStore.matchStatus === 'MATCHED'">
          <q-btn
            unelevated
            color="primary"
            class="full-width q-py-md text-weight-bold"
            label="이분과의 만남을 종료하겠습니다"
            @click="onClickEndMatching"
          />
        </template>
        <template v-else>
          <q-btn
            unelevated
            color="grey-2"
            text-color="grey-7"
            class="col q-py-md text-weight-bold"
            :label="matchingStore.matchStatus === 'RECEIVED' ? '거절' : '넘기기'"
            @click="onClickRejectBtn"
          />
          <q-btn
            unelevated
            color="primary"
            class="col-8 q-py-md text-weight-bold"
            :label="matchingStore.matchStatus === 'RECEIVED' ? '수락' : '호감 보내기'"
            @click="onClickAccept"
          />
        </template>
      </div>
    </div>

    <!-- 거절 팝업 -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="min-width: 350px; border-radius: 16px;">
        <q-card-section>
          <div class="text-h6 text-weight-bold">거절메시지를 적어주세요.</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="rejectReason"
            type="textarea"
            outlined
            placeholder="상대방에게 전달될 정중한 거절 메시지를 작성해 주세요."
            rows="4"
            autofocus
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-px-md">
          <q-btn flat label="취소" v-close-popup class="text-grey-7" />
          <q-btn 
            unelevated 
            color="primary" 
            label="확인" 
            @click="onConfirmReject" 
            :loading="rejecting"
            class="q-px-lg rounded-borders"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useMatchingStore } from '../../stores/MatchingStore';
import { useAuthStore } from '../../stores/AuthStore';

const $q = useQuasar();
const router = useRouter();
const matchingStore = useMatchingStore();
const authStore = useAuthStore();

const showRejectDialog = ref(false);
const rejectReason = ref('');
const rejecting = ref(false);

const onClickRejectBtn = () => {
  if (matchingStore.matchStatus === 'RECEIVED') {
    showRejectDialog.value = true;
  } else {
    // 추천 넘기기
    matchingStore.skipRecommendation(matchingStore.currentProfile?.userId);
  }
};

const qaData = [
  { 
    question: '퇴근 후엔 뭐하나요?', 
    answer: '주로 집에서 유튜브를 보거나 조용한 카페에서 책을 읽는 걸 좋아해요. 가끔은 근처 산책로를 걷기도 합니다.' 
  },
  { 
    question: '계획형 vs 즉흥형 어느 쪽에 가까운가요?', 
    answer: '저는 큰 틀은 계획을 세우되, 그 안에서의 여정은 상황에 맞춰 유연하게 즐기는 즐기는 편이에요. 7:3 정도로 계획형인 것 같아요!' 
  },
  { 
    question: '갈등이 생기면 보통 어떻게 해결하는 편인가요?', 
    answer: '감정이 앞서기보다는 잠시 시간을 갖고 생각을 정리한 후, 솔직하고 덤덤하게 대화로 풀어가려고 노력합니다. 서로의 다름을 인정하는 게 제일 중요하다고 생각해요.' 
  }
];

const onClickAccept = async () => {
  // 매칭 횟수(다이아) 조회
  if (authStore.matchingCount <= 0) {
    $q.dialog({
      title: '매칭 불가',
      message: '매칭 가능 횟수가 없습니다. 결제를 진행해주세요.',
      ok: { label: '결제하러 가기', color: 'primary', unelevated: true },
      cancel: { label: '취소', flat: true, color: 'grey-7' }
    }).onOk(() => {
      router.push('/payment');
    });
    return;
  }

  const profile = matchingStore.currentProfile;
  if (!profile) return;

  if (matchingStore.matchStatus === 'RECEIVED') {
    // 수락 처리
    const { error } = await matchingStore.acceptLike(profile.likeId);
    if (!error) {
      $q.notify({ type: 'positive', message: '수락되었습니다! 상대방이 수락하면 연락처가 공개됩니다.' });
    } else {
      $q.notify({ type: 'negative', message: '오류가 발생했습니다. 다시 시도해 주세요.' });
    }
  } else {
    // 호감 보내기
    const { error } = await matchingStore.sendLike(profile.userId);
    if (!error) {
      $q.notify({ type: 'positive', message: '호감을 보냈습니다!' });
    } else {
      $q.notify({ type: 'negative', message: '오류가 발생했습니다.' });
    }
  }
};

const onConfirmReject = async () => {
  if (!rejectReason.value.trim()) {
    $q.notify({ type: 'warning', message: '거절 사유를 입력해 주세요.' });
    return;
  }

  rejecting.value = true;
  const { error } = await matchingStore.rejectLike(
    matchingStore.currentProfile?.likeId, 
    rejectReason.value
  );
  
  if (!error) {
    showRejectDialog.value = false;
    rejectReason.value = '';
    $q.notify({ message: '거절 처리가 완료되었습니다.', color: 'grey-8' });
  } else {
    $q.notify({ type: 'negative', message: '처리 중 오류가 발생했습니다.' });
  }
  rejecting.value = false;
};

const onClickEndMatching = () => {
  router.push('/evaluation');
};

const goToProfile = () => {
  router.push('/profile');
};

onMounted(async () => {
  await matchingStore.fetchMatchState();
});
</script>

<style scoped lang="scss">
.matching-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
}

.page-content {
  animation: fadeIn 0.5s ease-out;
}

.bg-primary-1 {
  background-color: rgba(var(--q-primary-rgb), 0.05);
}

.border-primary {
  border: 1px solid var(--q-primary);
}

.leading-relaxed {
  line-height: 1.6;
}

.flex-1 {
  flex: 1;
}

.action-footer {
  border-top: 1px solid #f0f0f0;
  max-width: 600px;
  left: 50%;
  transform: translateX(-50%);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
