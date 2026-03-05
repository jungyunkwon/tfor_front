<template>
  <q-page>
    <!-- Hero Section -->
    <section class="hero-section text-center q-pa-xl">
      <div style="max-width: 800px">
        <h1 class="text-h1 text-weight-bold q-mb-md text-gradient">
          Find Your Perfect Match
        </h1>
        <p class="text-h5 text-grey-4 q-mb-xl">
          Join TFor today and connect with people who share your interests and passions.
        </p>
        <div class="q-gutter-md">
          <q-btn
            unelevated
            rounded
            size="lg"
            label="Get Started"
            class="bg-gradient-primary text-white q-px-xl hover-scale"
          />
          <q-btn
            outline
            rounded
            size="lg"
            label="Learn More"
            color="white"
            class="q-px-xl hover-scale shadow-glow"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="q-pa-xl">
      <div class="row q-col-gutter-xl">
        <div v-for="feature in features" :key="feature.title" class="col-12 col-md-4">
          <q-card class="glass-card full-height hover-scale q-pa-lg text-center">
            <q-avatar size="80px" font-size="40px" :icon="feature.icon" :color="feature.color" text-color="white" class="q-mb-md shadow-glow" />
            <div class="text-h5 text-weight-bold q-mb-md">{{ feature.title }}</div>
            <p class="text-grey-4">{{ feature.description }}</p>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="q-pa-xl text-center bg-transparent">
      <div class="glass-card q-pa-xl">
        <h2 class="text-h3 text-weight-bold q-mb-md">Ready to start your journey?</h2>
        <p class="text-h6 text-grey-4 q-mb-lg">Thousands of people have already found their love through TFor.</p>
        <q-btn
          unelevated
          rounded
          size="lg"
          label="Sign Up Now"
          class="bg-gradient-primary text-white q-px-xl hover-scale"
        />
      </div>
    </section>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const features = [
      {
        title: 'Smart Matching',
        description: 'Our AI-powered algorithm finds matches based on deep compatibility, not just superficial traits.',
        icon: 'psychology',
        color: 'primary'
      },
      {
        title: 'Secure & Private',
        description: 'Your privacy is our top priority. We use end-to-end encryption for all your conversations.',
        icon: 'verified_user',
        color: 'accent'
      },
      {
        title: 'Live Chat',
        description: 'Connect instantly with real-time messaging, video calls, and interactive shared activities.',
        icon: 'chat',
        color: 'info'
      }
    ];

    return {
      features
    };
  }
});
</script>

<style lang="sass" scoped>
.shadow-glow
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3)
</style>
