import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";

// Toss 결제 인증이 실패하거나 사용자가 취소했을 때 돌아오는 페이지
export function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = Number(searchParams.get("itemId"));
  const code = searchParams.get("code");
  const message = code === "PAY_PROCESS_CANCELED"
    ? "결제를 취소했습니다."
    : searchParams.get("message") ?? "결제를 진행하지 못했습니다.";

  return (
    <div className="min-h-screen bg-white pt-[280px] flex flex-col items-center gap-4 px-4 text-center">
      <p className="text-base font-semibold text-black">결제가 완료되지 않았습니다</p>
      <p className="text-sm text-stone-600">{message}</p>
      <Button
        onClick={() => navigate(itemId ? `/app/products/${itemId}` : "/app", { replace: true })}
        className="bg-black hover:bg-stone-900 text-white h-11 px-6 text-sm rounded"
      >
        상품으로 돌아가기
      </Button>
    </div>
  );
}
