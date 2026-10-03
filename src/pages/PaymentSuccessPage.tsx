import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tradeApi } from "@/api/trade";
import type { ApiError } from "@/types/api";

type ViewState =
  | { kind: "confirming" }
  | { kind: "pending" }
  | { kind: "failed"; message: string };

const POLL_INTERVAL_MS = 3_000;
const POLL_LIMIT = 10;

// Toss 인증 성공 후 돌아오는 페이지: ignoa-api에 승인을 요청하고 결과를 보여준다
export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tradeId = Number(searchParams.get("tradeId"));
  const itemId = Number(searchParams.get("itemId"));
  const paymentKey = searchParams.get("paymentKey") ?? "";
  const orderId = searchParams.get("orderId") ?? "";
  const amount = Number(searchParams.get("amount"));

  const [view, setView] = useState<ViewState>({ kind: "confirming" });
  const startedRef = useRef(false);

  useEffect(() => {
    // 승인 요청은 한 번만 보낸다(StrictMode 이중 실행 방지)
    if (startedRef.current) return;
    startedRef.current = true;

    const goToItem = () => navigate(`/app/products/${itemId}`, { replace: true });
    let timer: ReturnType<typeof setTimeout> | undefined;

    // 결과를 모르면(UNKNOWN) 결제 서버 콜백이 반영될 때까지 거래 상태를 다시 조회한다
    const pollTrade = (count: number) => {
      timer = setTimeout(async () => {
        try {
          const trade = await tradeApi.getMyTrade(itemId);
          if (trade.status === "PAID") {
            toast.success("결제가 완료되었습니다.");
            goToItem();
            return;
          }
          if (trade.status === "PAYMENT_PENDING" || trade.status === "CANCELED") {
            setView({ kind: "failed", message: "결제가 완료되지 않았습니다." });
            return;
          }
        } catch {
          // 조회 실패는 다음 시도에서 다시 확인한다
        }
        if (count + 1 < POLL_LIMIT) pollTrade(count + 1);
      }, POLL_INTERVAL_MS);
    };

    (async () => {
      try {
        const result = await tradeApi.confirmPayment(tradeId, {
          order_id: orderId,
          payment_key: paymentKey,
          amount,
        });
        if (result.status === "DONE") {
          toast.success("결제가 완료되었습니다.");
          goToItem();
        } else if (result.status === "FAILED") {
          setView({ kind: "failed", message: result.failure_message ?? "결제에 실패했습니다." });
        } else {
          setView({ kind: "pending" });
          pollTrade(0);
        }
      } catch (err) {
        const apiError = err as Partial<ApiError>;
        setView({ kind: "failed", message: apiError.message ?? "결제를 승인하지 못했습니다." });
      }
    })();

    return () => clearTimeout(timer);
  }, [amount, itemId, navigate, orderId, paymentKey, tradeId]);

  return (
    <div className="min-h-screen bg-white pt-[280px] flex flex-col items-center gap-4 px-4 text-center">
      {view.kind !== "failed" ? (
        <>
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-600">
            {view.kind === "confirming" ? "결제를 승인하고 있습니다." : "결제 결과를 확인하고 있습니다. 잠시만 기다려주세요."}
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-black">결제에 실패했습니다</p>
          <p className="text-sm text-stone-600">{view.message}</p>
          <Button
            onClick={() => navigate(`/app/products/${itemId}`, { replace: true })}
            className="bg-black hover:bg-stone-900 text-white h-11 px-6 text-sm rounded"
          >
            상품으로 돌아가기
          </Button>
        </>
      )}
    </div>
  );
}
