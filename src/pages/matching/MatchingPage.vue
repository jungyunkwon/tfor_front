<template>
  <q-page class="matching-page bg-white">
    <!-- 로딩 상태 -->
    <div v-if="pageMode === 'loading'" class="flex flex-center full-height q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 에러 표시 상태 -->
    <div v-else-if="pageMode === 'error'" class="flex flex-center full-height q-pa-xl text-center">
      <div>
        <q-icon name="error_outline" size="64px" color="negative" />
        <div class="text-h6 text-grey-8 q-mt-md">시스템 오류</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ errorMessage }}</div>
        <q-btn
          unelevated
          outline
          color="primary"
          class="q-mt-lg"
          label="다시 시도"
          @click="initMatchingState"
        />
      </div>
    </div>

    <!-- 추천 없음 상태 -->
    <div v-else-if="pageMode === 'empty'" class="flex flex-center full-height q-pa-xl text-center">
      <div>
        <q-icon name="person_search" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-7 q-mt-md">매칭할 상대를 찾고 있어요.</div>
        <div class="text-body2 text-grey-5 q-mt-sm">기다리는 동안 프로필을 수정해봐요.</div>
        <q-btn
          unelevated
          color="primary"
          class="q-mt-lg q-px-xl q-py-sm text-weight-bold"
          label="프로필 수정"
          @click="goToProfile"
        />
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 (통합) -->
    <div v-else class="page-content q-pb-xl">
      <!-- 상단 브랜드/상태 타이틀 영역 -->
      <div class="brand-header q-pa-md">
        <div class="text-h5 text-weight-bold text-primary">티포</div>
      </div>

      <!-- Case 2-성사완료: 매칭 진행중 타이틀 -->
      <div v-if="pageMode === 'matched'" class="q-px-md q-pt-sm q-pb-md">
        <div class="text-h5 text-weight-bold text-grey-9">매칭 진행중입니다.</div>
      </div>

      <!-- 프로필 렌더링 영역 (case1, case2, matched 공통 재사용) -->
      <div class="profile-summary-section q-pa-md flex no-wrap items-center">
        <div class="profile-avatar-container">
          <!-- 추천 카드 이미지 (case1 / case2 용) 또는 activeTargetUser 이미지 (matched용) -->
          <q-avatar size="100px" class="shadow-1">
            <template v-if="pageMode === 'matched'">
              <img v-if="activeTargetUser?.mainPhoto" :src="activeTargetUser.mainPhoto" />
              <q-icon v-else name="person" size="60px" color="grey-4" />
            </template>
            <template v-else>
              <img v-if="recommendationProfile?.mainPhoto" :src="recommendationProfile.mainPhoto" />
              <q-icon v-else name="person" size="60px" color="grey-4" />
            </template>
          </q-avatar>
        </div>
        
        <div class="profile-info-container q-ml-lg flex-1">
          <!-- 닉네임, 나이 -->
          <div class="flex items-end q-gutter-x-sm q-mb-xs">
            <span class="text-h6 text-weight-bold">
              {{ pageMode === 'matched' ? activeTargetUser?.nickname : recommendationProfile?.nickname }}
            </span>
            <span v-if="pageMode !== 'matched' && recommendationProfile?.age" class="text-subtitle1 text-grey-7">
              {{ recommendationProfile.age }}세
            </span>
          </div>
          <!-- 지역, 태그 등 (추천일 때만 노출) -->
          <div v-if="pageMode !== 'matched'" class="tags-container flex q-gutter-xs q-mb-sm">
            <q-badge v-if="recommendationProfile?.regionCd" outline color="primary" :label="recommendationProfile.regionCd" />
          </div>
          <!-- 소개 영역 -->
          <div v-if="pageMode !== 'matched'" class="intro-text text-body2 text-grey-8 line-clamp-2">
            {{ recommendationProfile?.introText || '반가워요!' }}
          </div>
        </div>
      </div>

      <!-- Case 2 (waiting) 한정 UI: 응답 대기 타이머 -->
      <div v-if="pageMode === 'waiting'" class="q-px-md q-py-lg">
        <div class="bg-primary-1 q-pa-lg rounded-borders text-center border-primary">
          <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm">
            {{ recommendationProfile?.nickname }}님이 프로필을 읽어보고 있어요.
          </div>
          <div class="text-body2 text-grey-7 q-mb-md">답장할 시간은 48시간임</div>
          <div class="text-primary text-h4 text-weight-bold">
            {{ formattedRemainingTime }}
          </div>
        </div>
      </div>

      <!-- Case 1 (recommendation) 한정 UI: 상세 질문 등 (기존 UI 유지) -->
      <div v-if="pageMode === 'recommendation'" class="qa-section q-pa-md">
        <!-- 서버 상세 데이터가 있다면 여기에 반영하나 임시 스텁 유지 -->
        <div class="text-weight-bold text-grey-6 q-mb-md">
          {{ recommendationReason || '관심사가 비슷한 분이에요' }}
        </div>
      </div>

      <!-- Case 3 (matched) 한정 UI: 연락처 노출 정보 및 제공 동의 -->
      <div v-if="pageMode === 'matched'" class="contact-section q-mx-md q-my-lg q-pa-lg bg-primary-1 rounded-borders border-primary">
        <template v-if="contactVisibleYn">
          <div class="text-weight-bold text-primary q-mb-sm">상대방 연락처</div>
          <div class="text-h6 text-grey-9">{{ targetContactInfo || '연락처 정보 교환 성공' }}</div>
        </template>
        <template v-else>
          <div class="text-weight-bold text-grey-8 q-mb-md">연락처를 공개하고 대화를 시작할까요?</div>
          <div class="flex q-gutter-x-sm">
            <q-btn unelevated color="primary" class="col text-weight-bold" @click="handleContactExchange('Y')" label="동의하기" />
            <q-btn unelevated outline color="primary" class="col text-weight-bold" @click="handleContactExchange('N')" label="미루기" />
          </div>
        </template>
      </div>

      <!-- 하단 액션 버튼 영역 -->
      <div v-if="pageMode === 'recommendation' || pageMode === 'matched'" class="action-footer fixed-bottom bg-white q-pa-md flex q-gutter-x-md">
        <!-- Matched (case3) 버튼 -->
        <template v-if="pageMode === 'matched'">
          <q-btn
            unelevated
            color="primary"
            class="full-width q-py-md text-weight-bold"
            label="이분과의 만남을 종료하겠습니다"
            :loading="endSubmitting"
            @click="onClickEndMatching"
          />
        </template>
        
        <!-- Recommendation (case1) 버튼 -->
        <template v-if="pageMode === 'recommendation'">
          <q-btn
            unelevated
            color="grey-2"
            text-color="grey-7"
            class="col q-py-md text-weight-bold"
            label="관심없어요"
            :loading="skipSubmitting"
            :disable="!recommendationUserId || likeSubmitting"
            @click="onClickSkip"
          />
          <q-btn
            unelevated
            color="primary"
            class="col-8 q-py-md text-weight-bold"
            label="대화해보고 싶어요"
            :loading="likeSubmitting"
            :disable="!recommendationUserId || skipSubmitting"
            @click="onClickSendLike"
          />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { reviewService } from '../../services/reviewService';
import { matchingService } from '../../services/matchingService';
import { likesService } from '../../services/likesService';
import { chatService } from '../../services/chatService';

// -- 화면 상태값 변수들 --
const pageMode = ref<'loading' | 'recommendation' | 'waiting' | 'matched' | 'empty' | 'error'>('loading');

// Case 1 추천 관련
const recommendationUserId = ref<string>('');
const recommendationProfile = ref<any>(null);
const recommendationReason = ref<string>('');

// Case 2 호감 대기 관련
const pendingLikeId = ref<string>('');
const pendingLikeStatusCd = ref<string>('');
const expireDt = ref<string>('');
const remainingSeconds = ref<number>(0);

// Case 2 성사 완료 (Matched) 관련
const activeMatchId = ref<string>('');
const activeChatRoomId = ref<string>('');
const activeTargetUser = ref<any>(null);
const contactVisibleYn = ref<boolean>(false);
const targetContactInfo = ref<string | null>(null);

// 통신 중복방지 및 오류 메시지
const loading = ref<boolean>(true);
const likeSubmitting = ref<boolean>(false);
const skipSubmitting = ref<boolean>(false);
const endSubmitting = ref<boolean>(false);
const errorMessage = ref<string>('');

const $q = useQuasar();
const router = useRouter();
let timerId: ReturnType<typeof setInterval> | null = null;

// 남은 시간 포맷 계산 (HH:mm:ss)
const formattedRemainingTime = computed(() => {
  if (remainingSeconds.value <= 0) return '00:00:00';
  const h = Math.floor(remainingSeconds.value / 3600).toString().padStart(2, '0');
  const m = Math.floor((remainingSeconds.value % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(remainingSeconds.value % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
});

// 타이머 시작 함수
const startTimer = () => {
  if (timerId) clearInterval(timerId);
  
  const expireTime = new Date(expireDt.value).getTime();
  
  const updateTimer = () => {
    const now = Date.now();
    const diff = Math.floor((expireTime - now) / 1000);
    if (diff <= 0) {
      remainingSeconds.value = 0;
      if (timerId) clearInterval(timerId);
      // 타이머 만료시 상태 재조회
      initMatchingState();
    } else {
      remainingSeconds.value = diff;
    }
  };

  updateTimer();
  timerId = setInterval(updateTimer, 1000);
};

const stopTimer = () => {
  if (timerId) clearInterval(timerId);
};

/**
 * 에러 노출용 내부 함수
 */
const setPageToError = (msg: string) => {
  errorMessage.value = msg;
  pageMode.value = 'error';
  loading.value = false;
};

/**
 * 1. 최초 상태 초기화
 */
const initMatchingState = async () => {
  pageMode.value = 'loading';
  loading.value = true;
  stopTimer();

  try {
    // 1) 후기 작성 확인 여부
    const { data: reviewData, error: reviewError } = await reviewService.getPendingReview();
    if (reviewError) {
      setPageToError('매칭 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (reviewData?.hasPendingReview) {
      // 미작성 후기 존재 -> 이동
      await router.replace('/review/edit');
      return;
    }

    // 2) 매칭 상태 확인
    const { data: matchData, error: matchError } = await matchingService.getMatchingState();
    if (matchError) {
      setPageToError('상태 정보를 불러오지 못했어요.');
      return;
    }

    if (matchData?.hasActiveMatch) {
      // 활성 매칭 존재 처리
      activeMatchId.value = matchData.matchId;
      activeChatRoomId.value = matchData.chatRoomId;
      
      const { data: chatData, error: chatError } = await chatService.getMyActiveChatRoom();
      if (chatError) {
        setPageToError('활성 매칭 정보를 불러오지 못했어요.');
        return;
      }
      if (chatData) {
        activeTargetUser.value = chatData.targetUser;
        // 연락처 정보가 바로 있다면 연동(구현 정책에 맞춰)
        contactVisibleYn.value = false; // 이후 요청이나 데이터로 갱신
      }
      
      pageMode.value = 'matched';
      return;
    }

    // 3) 대기 중인 호감(내가 보낸 호감)이 있는지 확인
    const { data: sentLikeData, error: sentLikeError } = await likesService.getSentLikeList({ page: 1, pageSize: 1, statusCd: 'SENT' });
    if (sentLikeError) {
      setPageToError('호감 목록을 불러오지 못했어요.');
      return;
    }

    if (sentLikeData && sentLikeData.items.length > 0) {
      // 응답 대기 상태
      const pendingItem = sentLikeData.items[0];
      pendingLikeId.value = pendingItem.like_id;
      pendingLikeStatusCd.value = pendingItem.like_status_cd;
      expireDt.value = pendingItem.expire_dt;
      
      // 대기 프로필 세팅
      recommendationProfile.value = {
        nickname: pendingItem.receiver?.nickname,
        regionCd: pendingItem.receiver?.region_cd,
      };

      pageMode.value = 'waiting';
      startTimer();
      return;
    }

    // 4) 추천 가능하면 다음 추천 가져오기
    if (matchData?.canReceiveRecommendation) {
      await getRecommendation();
    } else {
      pageMode.value = 'empty';
    }

  } catch (err) {
    setPageToError('일시적인 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

/**
 * 2. 추천 대상 조회
 */
const getRecommendation = async () => {
  const { data: recoData, error: recoError } = await matchingService.getNextRecommendation({});
  if (recoError) {
    setPageToError('추천 프로필을 불러오지 못했어요.');
    return;
  }
  
  if (recoData && recoData.recommendationUserId) {
    recommendationUserId.value = recoData.recommendationUserId;
    recommendationProfile.value = recoData.profileCard;
    recommendationReason.value = recoData.recommendationReason;
    pageMode.value = 'recommendation';
  } else {
    pageMode.value = 'empty';
  }
};

/**
 * 3. 대화해보고 싶어요 (호감 보내기)
 */
const onClickSendLike = async () => {
  if (!recommendationUserId.value || likeSubmitting.value) return;
  
  likeSubmitting.value = true;
  const { data, error } = await likesService.sendLike(recommendationUserId.value);
  likeSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: '호감 표시 처리에 실패했어요.' });
    return;
  }

  if (data) {
    pendingLikeId.value = data.likeId;
    pendingLikeStatusCd.value = data.likeStatusCd;
    expireDt.value = data.expireDt;
    
    pageMode.value = 'waiting';
    startTimer();
  }
};

/**
 * 4. 관심없어요 (추천 넘기기)
 */
const onClickSkip = async () => {
  if (!recommendationUserId.value || skipSubmitting.value) return;

  skipSubmitting.value = true;
  const { data, error } = await matchingService.skipRecommendation(recommendationUserId.value);
  skipSubmitting.value = false;

  if (error) {
    $q.notify({ type: 'negative', message: '추천 넘기기 처리에 실패했어요.' });
    return;
  }

  if (data && data.nextRecommendationAvailable) {
    // 새로운 추천 즉시 조회
    pageMode.value = 'loading'; // 깜빡임 방지용 임시 로딩
    await getRecommendation();
  } else {
    pageMode.value = 'empty';
  }
};

/**
 * 5. 연락처 공개 동의 처리
 */
const handleContactExchange = async (agreeYn: 'Y' | 'N') => {
  if (!activeMatchId.value) return;
  
  const { data, error } = await chatService.requestContactExchange(activeMatchId.value, agreeYn);
  
  if (error) {
    $q.notify({ type: 'negative', message: '연락처 공개 처리에 실패했어요.' });
    return;
  }
  
  if (data) {
    contactVisibleYn.value = data.contactVisibleYn;
    if (data.contactVisibleYn) {
      targetContactInfo.value = data.targetContactInfo;
      $q.notify({ type: 'positive', message: '연락처 공개가 완료되었습니다.' });
    } else {
      if (agreeYn === 'Y') {
        $q.notify({ message: '상대방의 동의를 기다리고 있습니다.', color: 'primary' });
      } else {
        $q.notify({ message: '연락처 공개를 보류했습니다.' });
      }
    }
  }
};

/**
 * 6. 매칭 종료 처리
 */
const onClickEndMatching = async () => {
  if (!activeMatchId.value || endSubmitting.value) return;
  
  $q.dialog({
    title: '매칭 종료',
    message: '정말 만남을 종료하시겠습니까? (이후 후기 작성 페이지로 이동합니다.)',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    endSubmitting.value = true;
    const { data, error } = await chatService.endChatMatch(activeMatchId.value, 'ENDED_BY_USER');
    endSubmitting.value = false;

    if (error) {
      $q.notify({ type: 'negative', message: '매칭 종료 처리에 실패했어요.' });
      return;
    }

    if (data?.reviewRequiredYn === 'Y') {
      router.replace('/review/edit');
    } else {
      // 리뷰 불필요 시 초기화면 복귀
      await initMatchingState();
    }
  });
};

const goToProfile = () => {
  router.push('/profile');
};

onMounted(() => {
  initMatchingState();
});

onUnmounted(() => {
  stopTimer();
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
  animation: fadeIn 0.4s ease-out;
}

.bg-primary-1 {
  background-color: rgba(var(--q-primary-rgb), 0.05);
}

.border-primary {
  border: 1px solid var(--q-primary);
}

.flex-1 {
  flex: 1;
}

.leading-relaxed {
  line-height: 1.6;
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
