<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent text-white" height-hint="98">
      <q-toolbar class="q-py-md q-px-lg glass-card q-ma-md" style="margin-bottom: 0">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="hover-scale"
        />

        <q-toolbar-title class="text-weight-bold text-h5 text-gradient">
          TFor
        </q-toolbar-title>

        <div class="q-gutter-sm">
          <q-btn flat round dense icon="notifications" class="hover-scale" />
          <q-btn flat round dense icon="person" class="hover-scale" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-dark text-white"
    >
      <q-list class="q-pa-md">
        <q-item-label header class="text-grey-5 text-uppercase text-weight-bold">
          Menu
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          class="q-my-sm rounded-borders hover-scale"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Home',
    caption: 'Discover new people',
    icon: 'home',
    link: '/'
  },
  {
    title: 'Matches',
    caption: 'Your potential partners',
    icon: 'favorite',
    link: '/matches'
  },
  {
    title: 'Messages',
    caption: 'Chat with your matches',
    icon: 'chat',
    link: '/messages'
  },
  {
    title: 'Settings',
    caption: 'Profile and preferences',
    icon: 'settings',
    link: '/settings'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>

<style lang="sass">
.q-drawer
  background: rgba(15, 23, 42, 0.9) !important
  backdrop-filter: blur(10px)

.q-item--active
  background: rgba(56, 189, 248, 0.1) !important
  color: #38bdf8 !important
</style>
