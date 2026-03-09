<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-lg">내 가치관 및 정보 설정</div>
    
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
    >
      <q-step
        :name="1"
        title="기본 정보"
        icon="person"
        :done="step > 1"
      >
        <q-input v-model="form.nickname" label="닉네임" class="q-mb-md" />
        <q-btn-toggle
          v-model="form.gender"
          toggle-color="primary"
          :options="[
            {label: '남성', value: 'M'},
            {label: '여성', value: 'F'}
          ]"
          class="q-mb-md"
        />
        <q-input v-model.number="form.height_cm" type="number" label="키 (cm)" />
        
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="다음" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="가치관 설문"
        icon="assignment"
        :done="step > 2"
      >
        <div class="q-mb-sm">Q1. 평소 여가 시간을 어떻게 보내시나요?</div>
        <q-input v-model="form.survey.q1" type="textarea" dense outlined class="q-mb-md" />

        <q-stepper-navigation>
          <q-btn @click="step = 3" color="primary" label="다음" />
          <q-btn flat @click="step = 1" label="이전" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        title="사진 등록"
        icon="add_a_photo"
      >
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-card flat bordered class="q-pa-sm text-center">
              <q-icon name="face" size="48px" color="grey-5" />
              <div class="text-caption">얼굴 사진</div>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat bordered class="q-pa-sm text-center">
              <q-icon name="accessibility" size="48px" color="grey-5" />
              <div class="text-caption">전신 사진</div>
            </q-card>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn color="primary" label="완료" :loading="isSubmitting" @click="onComplete" />
          <q-btn flat @click="step = 2" label="이전" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../stores/profile.store';

const step = ref(1);
const router = useRouter();
const profileStore = useProfileStore();
const isSubmitting = ref(false);

const form = reactive({
  nickname: '',
  gender: 'M',
  height_cm: null,
  survey: {
    q1: ''
  }
});

const onComplete = async () => {
  isSubmitting.value = true;
  const { data } = await profileStore.updateProfile(form);
  if (data) {
    router.push('/profile');
  }
  isSubmitting.value = false;
};
</script>
