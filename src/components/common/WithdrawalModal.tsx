import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/api/auth";
import type { ApiError } from "@/types/api";
import {
  ACTION_MODAL_CANCEL_CLASS,
  ACTION_MODAL_ACTION_CLASS,
  ACTION_MODAL_FOOTER_CLASS,
  ACTION_MODAL_TITLE_CLASS,
} from "@/constants/actionModal";

interface WithdrawalModalProps {
  onClose: () => void;
  onWithdrawn: () => void;
}

const CHECKS = [
  {
    label: "탈퇴 제한 조건 확인",
    desc: "판매 중인 상품, 진행 중인 경매의 입찰, 결제를 기다리거나 확인 중인 거래(구매·판매)가 없어야 합니다. 하나라도 있으면 탈퇴할 수 없습니다.",
  },
  {
    label: "30일 유예기간 안내",
    desc: "탈퇴 신청 후 30일간 계정이 유지됩니다. 이 기간 내 로그인 화면에서 계정을 복구할 수 있습니다.",
  },
  {
    label: "데이터 영구 삭제",
    desc: "유예기간 종료 후 이메일·닉네임·주소·찜 목록 등 개인정보가 영구 삭제되며 복구할 수 없습니다. 단, 결제·거래 기록은 관련 법령에 따라 보관됩니다.",
  },
];

export function WithdrawalModal({ onClose, onWithdrawn }: WithdrawalModalProps) {
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false));
  const [submitting, setSubmitting] = useState(false);

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleWithdraw = async () => {
    if (!allChecked) return;
    setSubmitting(true);
    try {
      await userApi.deleteMe();
      toast.success("회원탈퇴가 완료되었습니다.");
      onWithdrawn();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "회원탈퇴에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-sm rounded-2xl bg-white px-7 pb-6 pt-7"
          style={{ fontFamily: "Pretendard, sans-serif" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div>
            <h2 className={ACTION_MODAL_TITLE_CLASS}>회원탈퇴</h2>
          </div>
          <p className="mb-7 text-[13px] leading-5 text-gray-500">아래 내용을 모두 확인하고 동의해주세요.</p>

          {/* Checkboxes */}
          <div className="space-y-5 mb-8">
            {CHECKS.map((item, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className={`w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 border flex items-center justify-center transition-colors ${
                  checked[i] ? "bg-black border-black" : "border-gray-300"
                }`}>
                  {checked[i] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className="mb-0.5 text-[13px] font-medium leading-5 text-gray-700">{item.label}</p>
                  <p className={`text-[11px] font-normal leading-4 transition-colors ${
                    checked[i] ? "text-black" : "text-gray-400"
                  }`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className={ACTION_MODAL_FOOTER_CLASS}>
            <button
              onClick={onClose}
              className={ACTION_MODAL_CANCEL_CLASS}
            >
              취소
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!allChecked || submitting}
              className={ACTION_MODAL_ACTION_CLASS}
            >
              {submitting ? "처리 중..." : "탈퇴하기"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
