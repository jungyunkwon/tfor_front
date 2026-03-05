<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>TFOR</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-footer elevated class="bg-white text-grey-8">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="transparent"
        align="justify"
      >
        <q-route-tab name="matching" icon="favorite" label="매칭" to="/matching" />
        <q-route-tab name="likes" icon="people" label="호감" to="/likes" />
        <q-route-tab name="chats" icon="chat" label="채팅" to="/chats" />
        <q-route-tab name="profile" icon="person" label="프로필" to="/profile" />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
const tab = ref('matching');
</script>
