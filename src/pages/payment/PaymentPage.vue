<template>
  <q-page class="payment-page bg-grey-2">
    <!-- 상단 헤더 영역 -->
    <div class="header-section bg-white q-px-md q-py-sm flex items-center justify-between border-bottom">
      <div class="logo-area flex items-center">
        <q-icon name="favorite" color="primary" size="24px" class="q-mr-xs" />
        <span class="text-h6 text-weight-bold text-primary">티포</span>
      </div>
      <q-btn 
        unelevated 
        color="black" 
        text-color="white" 
        label="구매하기" 
        class="rounded-borders q-px-md text-weight-medium"
        size="sm"
      />
    </div>

    <div class="page-content q-px-md q-pt-xl">
      <!-- 보유 수량 표시 영역 -->
      <div class="balance-section flex flex-center q-mb-xl">
        <div class="balance-badge bg-white shadow-subtle q-px-xl q-py-lg rounded-xl flex items-center">
          <q-icon name="diamond" color="primary" size="32px" class="q-mr-sm" />
          <span class="text-h4 text-weight-bold">{{ authStore.matchingCount }}</span>
        </div>
      </div>

      <!-- 상품 목록 영역 -->
      <div class="products-section">
        <div v-if="loading" class="flex flex-center q-py-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>
        
        <div v-else class="q-gutter-y-md">
          <q-card 
            v-for="product in products" 
            :key="product.productId"
            class="product-card bg-white shadow-subtle no-border-radius-card cursor-pointer"
            @click="onSelectProduct(product)"
            flat
          >
            <q-card-section class="flex items-center justify-between q-pa-lg">
              <div class="product-info-left">
                <div class="text-h5 text-weight-bold q-mb-xs">{{ product.diamondAmount }}</div>
                <div class="text-caption text-grey-7">{{ product.name || '매칭권 상품' }}</div>
              </div>
              <div class="product-price-right">
                <span class="text-subtitle1 text-weight-bold">{{ formatPrice(product.price) }}원</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/AuthStore';
import { paymentService } from '../../services/paymentService';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(true);
const products = ref([]);

const fetchProducts = async () => {
  loading.value = true;
  const { data, error } = await paymentService.getDiamondProductList();
  if (!error && data?.products) {
    products.value = data.products;
  } else {
    $q.notify({ type: 'negative', message: '상품 목록을 불러오는 중 오류가 발생했습니다.' });
  }
  loading.value = false;
};

const formatPrice = (price) => {
  return price.toLocaleString();
};

const onSelectProduct = (product) => {
  $q.dialog({
    title: '상품 구매',
    message: `${product.diamondAmount} 다이아를 ${formatPrice(product.price)}원에 구매하시겠습니까?`,
    cancel: true,
    ok: { label: '구매하기', color: 'black', unelevated: true }
  }).onOk(() => {
    $q.notify({ type: 'info', message: '결제 모듈 연동 준비 중입니다.' });
    // 실제 결제 로직 호출 (In-app purchase)
  });
};

onMounted(() => {
  fetchProducts();
  authStore.fetchMatchingCount(); // 최신 잔액 동기화
});
</script>

<style scoped lang="scss">
.payment-page {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

.border-bottom {
  border-bottom: 1px solid #eeeeee;
}

.shadow-subtle {
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.rounded-xl {
  border-radius: 20px;
}

.product-card {
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    background-color: #fafafa;
  }
}

.product-price-right {
  color: #333;
}
</style>
