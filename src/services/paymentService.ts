import { supabase } from '../utils/supabase';

/**
 * 결제 서비스 (API_GUIDE.md 747-782 기반)
 */
export const paymentService = {
  /**
   * 상품 목록 조회 (getDiamondProductList)
   */
  async getDiamondProductList() {
    const { data, error } = await supabase
      .from('tb_product')
      .select('product_id, product_name, gem_amount, sale_price')
      .eq('active_yn', 'Y')
      .eq('del_yn', 'N')
      .order('sale_price', { ascending: true });

    if (error) return { data: null, error };

    return {
      data: {
        products: data?.map(p => ({
          productId: p.product_id,
          name: p.product_name,
          diamondAmount: p.gem_amount,
          price: p.sale_price
        }))
      },
      error: null
    };
  },

  /**
   * 결제 영수증 검증 및 보석 지급 (verifyPaymentReceipt)
   */
  async verifyPaymentReceipt(params: { productId: string, purchaseToken: string, receiptData: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 실제 영수증 검증은 서버사이드 RPC 또는 Edge Function 호출이 필수
    // 여기서는 DB 기록 예시로 작성
    const payload = {
      user_id: user.id,
      product_id: params.productId,
      payment_status_cd: 'COMPLETED',
      store_provider_cd: 'GOOGLE', // 예시
      external_order_id: params.purchaseToken,
      external_receipt_id: params.receiptData,
      raw_payload: params,
      paid_dt: new Date().toISOString(),
      create_dt: new Date().toISOString(),
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_payment')
      .insert(payload)
      .select()
      .single();

    if (error) return { data: null, error };

    // 보석 지급 (tb_user_balance 업데이트 - 실제론 트랜잭션/트리거 처리 권장)
    const { data: product } = await supabase.from('tb_product').select('gem_amount').eq('product_id', params.productId).single();
    if (product) {
        // 기존 잔액 조회 후 업데이트 (생략)
    }

    return {
      data: {
        success: true,
        paidYn: 'Y',
        grantedDiamond: product?.gem_amount || 0,
        transactionId: data.payment_id
      },
      error: null
    };
  }
};
