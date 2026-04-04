<template>
  <q-page class="profile-page bg-grey-2">
    <!-- 상단 프로필 영역 -->
    <div class="profile-header bg-white q-py-xl flex flex-center flex-column text-center border-bottom">
      <div class="avatar-container q-mb-lg flex flex-center">
        <q-avatar size="120px" class="q-pa-sm bg-grey-1 shadow-subtle border-grey">
          <img v-if="profile?.mainPhoto" :src="profile.mainPhoto" />
          <q-icon v-else name="person" size="70px" color="grey-4" />
        </q-avatar>
      </div>
      
      <div class="status-message q-px-md">
        <div class="text-h6 text-weight-bold q-mb-xs">{{ profile?.nickname || '닉네임을 적어주세요' }}</div>
        <div class="text-caption text-grey-6 text-body2">프로필을 완성하면 매칭이 시작됩니다.</div>
      </div>
    </div>

    <!-- 메뉴 리스트 영역 -->
    <div class="menu-list-section q-mt-md bg-white q-pb-xl shadow-subtle">
      <q-list padding class="q-py-none">
        <template v-for="menu in menuList" :key="menu.id">
          <q-item 
            clickable 
            v-ripple 
            class="q-py-lg q-px-lg border-bottom-subtle"
            @click="onSelectMenu(menu)"
          >
            <q-item-section>
              <q-item-label class="text-body1 text-weight-bold">{{ menu.label }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-4" size="24px" />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="logout-section q-pa-xl flex flex-center">
        <q-btn flat color="grey-6" class="text-caption" label="로그아웃" @click="onClickLogout" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/AuthStore';
import { profileService } from '../../services/profileService';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const profile = ref(null);

const menuList = [
  { id: 'basic_info', label: '기본정보' },
  { id: 'values_qna', label: '가치관 답변' },
  { id: 'block_acquaintances', label: '아는사람 만나지 않기' },
  { id: 'counseling', label: '고민 상담' },
  { id: 'customer_center', label: '고객센터' },
  { id: 'terms', label: '이용약관' },
  { id: 'alarm_settings', label: '알림설정' },
  { id: 'match_criteria', label: '매칭 기준 설정' },
];

const fetchProfile = async () => {
    const { data, error } = await profileService.getMeProfile();
    if (!error && data) {
        profile.value = data;
        // 메인 사진은 별도로 가져오거나 getProfilePreview 사용 권장
        const previewRes = await profileService.getProfilePreview();
        if (previewRes.data?.mainPhoto) {
            profile.value.mainPhoto = previewRes.data.mainPhoto.storage_path;
        }
    }
}

const onSelectMenu = (menu) => {
  $q.notify({ message: `[${menu.label}] 메뉴 준비 중입니다.`, color: 'grey-8' });
};

const onClickLogout = async () => {
    $q.dialog({
        title: '로그아웃',
        message: '정말 로그아웃 하시겠습니까?',
        cancel: true,
        ok: { label: '로그아웃', color: 'red', flat: true }
    }).onOk(async () => {
        await authStore.logout();
        router.push('/auth/login');
    });
};

onMounted(() => {
    fetchProfile();
});
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.border-bottom {
  border-bottom: 2px solid #f2f2f2;
}

.border-bottom-subtle {
  border-bottom: 1px solid #fcfcfc;
}

.border-grey {
  border: 4px solid #fff;
}

.shadow-subtle {
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.avatar-container {
  border-radius: 50%;
  position: relative;
}

.flex-column {
  flex-direction: column;
}
</style>
