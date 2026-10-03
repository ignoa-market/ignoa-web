import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tradeApi } from "@/api/trade";
import type { ApiError, TradePrepareResponse } from "@/types/api";

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined;

// 결제창: 결제 준비(order_id 발급) → Toss 결제위젯 렌더링 → 결제 요청
export function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tradeId = Number(searchParams.get("tradeId"));
  const itemId = Number(searchParams.get("itemId"));

  const [order, setOrder] = useState<TradePrepareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // StrictMode에서 두 번 실행돼 order_id가 두 개 발급되지 않게 막는다
    if (startedRef.current) return;
    startedRef.current = true;

    if (!Number.isFinite(tradeId) || tradeId <= 0) {
      setError("잘못된 결제 요청입니다.");
      return;
    }
    if (!TOSS_CLIENT_KEY) {
      setError("결제 설정이 올바르지 않습니다.");
      return;
    }

    (async () => {
      try {
        const prepared = await tradeApi.preparePayment(tradeId);
        setOrder(prepared);

        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        // setAmount는 렌더링보다 먼저 호출해야 한다(Toss 공식 가이드)
        await widgets.setAmount({ currency: "KRW", value: prepared.amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        setReady(true);
      } catch (err) {
        const apiError = err as Partial<ApiError>;
        setError(apiError.message ?? "결제를 시작할 수 없습니다.");
      }
    })();
  }, [tradeId]);

  const handlePay = async () => {
    if (!order || !widgetsRef.current || requesting) return;
    setRequesting(true);
    const base = `${window.location.origin}/app/payments`;
    const query = `tradeId=${tradeId}&itemId=${itemId}`;
    try {
      await widgetsRef.current.requestPayment({
        orderId: order.order_id,
        orderName: order.order_name,
        successUrl: `${base}/success?${query}`,
        failUrl: `${base}/fail?${query}`,
      });
    } catch (err) {
      // 결제창을 닫는 등 요청 단계에서 끝난 경우
      const tossError = err as { message?: string };
      toast.error(tossError.message ?? "결제를 진행하지 못했습니다.");
      setRequesting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-[280px] flex flex-col items-center gap-4 px-4">
        <p className="text-sm text-stone-600">{error}</p>
        <Button
          onClick={() => navigate(itemId ? `/app/products/${itemId}` : "/app")}
          className="bg-black hover:bg-stone-900 text-white h-11 px-6 text-sm rounded"
        >
          상품으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[170px] pb-20">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-lg font-semibold text-black mb-1">결제하기</h1>
        {order && (
          <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
            <p className="text-sm text-stone-600">{order.order_name}</p>
            <p className="text-base font-semibold text-black">{order.amount.toLocaleString()}원</p>
          </div>
        )}
        {!ready && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div id="payment-method" />
        <div id="agreement" />
        <Button
          onClick={handlePay}
          disabled={!ready || requesting}
          className="mt-6 w-full bg-black hover:bg-stone-900 text-white h-12 text-sm font-medium rounded disabled:opacity-40"
        >
          {order ? `${order.amount.toLocaleString()}원 결제하기` : "결제하기"}
        </Button>
      </div>
    </div>
  );
}
