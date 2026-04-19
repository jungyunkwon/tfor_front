<template>
  <q-page class="alarm-page bg-white">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="onBack" />
        <q-toolbar-title class="text-weight-bold text-center">알림 설정</q-toolbar-title>
        <div style="width: 48px"></div>
      </q-toolbar>
    </q-header>

    <div class="container q-pa-md">

      <!-- 로딩 -->
      <div v-if="loading" class="flex flex-center q-pt-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <template v-else>
        <!-- 알림 설정 항목 -->
        <section class="setting-section q-mb-xl">
          <div class="setting-card">
            <!-- 매칭 알림 -->
            <div class="setting-item row items-center justify-between q-py-md">
              <div class="col">
                <div class="setting-label text-weight-bold">매칭 알림</div>
                <div class="setting-desc text-caption text-grey-6">새로운 매칭 추천 시 알림을 받습니다</div>
              </div>
              <q-toggle
                v-model="matchAlarm"
                color="primary"
                size="lg"
              />
            </div>

            <q-separator />

            <!-- 채팅 알림 -->
            <div class="setting-item row items-center justify-between q-py-md">
              <div class="col">
                <div class="setting-label text-weight-bold">채팅 알림</div>
                <div class="setting-desc text-caption text-grey-6">새로운 메시지 수신 시 알림을 받습니다</div>
              </div>
              <q-toggle
                v-model="chatAlarm"
                color="primary"
                size="lg"
              />
            </div>

            <q-separator />

            <!-- 공지 알림 -->
            <div class="setting-item row items-center justify-between q-py-md">
              <div class="col">
                <div class="setting-label text-weight-bold">공지 알림</div>
                <div class="setting-desc text-caption text-grey-6">서비스 공지 및 이벤트 알림을 받습니다</div>
              </div>
              <q-toggle
                v-model="noticeAlarm"
                color="primary"
                size="lg"
              />
            </div>
          </div>
        </section>

        <!-- 안내 문구 -->
        <div class="info-box q-pa-md q-mb-xl">
          <div class="row items-start q-gutter-x-sm">
            <q-icon name="info_outline" color="grey-5" size="18px" class="q-mt-xs" />
            <div class="text-caption text-grey-6 col">
              알림 수신 설정은 저장 버튼을 누른 후 반영됩니다.<br>
              기기 알림 설정이 꺼져 있으면 앱 알림이 수신되지 않을 수 있어요.
            </div>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <q-btn
          label="저장하기"
          color="primary"
          unelevated
          class="full-width cta-button"
          :loading="saving"
          :disable="saving"
          @click="onSave"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { alarmService } from 'src/services/alarmService';
import { showSuccessToast, showErrorToast } from 'src/utils/notify';

const router = useRouter();

// ===== 상태값 =====
const loading = ref(false);
const saving = ref(false);

// toggle용 boolean 상태 (Y/N 변환은 저장/조회 시 처리)
const matchAlarm = ref(true);
const chatAlarm = ref(true);
const noticeAlarm = ref(true);

// ===== 조회 =====
const fetchSettings = async () => {
  loading.value = true;
  try {
    const { data, error } = await alarmService.getMyAlarmSettings();
    if (error) throw error;

    matchAlarm.value = data?.match_alarm_yn !== 'N';
    chatAlarm.value = data?.chat_alarm_yn !== 'N';
    noticeAlarm.value = data?.notice_alarm_yn !== 'N';
  } catch (e) {
    console.error(e);
    showErrorToast('알림 설정을 불러오지 못했어요.');
    // 조회 실패 시에도 기본값(true) 유지
  } finally {
    loading.value = false;
  }
};

// ===== 저장 =====
const onSave = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    const { error } = await alarmService.saveMyAlarmSettings({
      match_alarm_yn: matchAlarm.value ? 'Y' : 'N',
      chat_alarm_yn: chatAlarm.value ? 'Y' : 'N',
      notice_alarm_yn: noticeAlarm.value ? 'Y' : 'N',
    });
    if (error) throw error;

    showSuccessToast('알림 설정이 저장되었어요.');
  } catch (e) {
    console.error(e);
    showErrorToast('알림 설정 저장에 실패했어요.');
  } finally {
    saving.value = false;
  }
};

const onBack = () => router.back();

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped lang="scss">
.alarm-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

.container {
  padding-top: 24px;
}

.setting-card {
  border: 1px solid #eeeeee;
  border-radius: 12px;
  padding: 0 16px;
  background: #fff;
}

.setting-item {
  min-height: 64px;
}

.setting-label {
  font-size: 0.95rem;
  color: #1D1D1D;
  margin-bottom: 2px;
}

.setting-desc {
  line-height: 1.4;
  letter-spacing: -0.1px;
}

.info-box {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eeeeee;
}

.cta-button {
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
}
</style>
