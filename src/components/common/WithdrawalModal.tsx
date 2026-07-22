import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/api/auth";
import type { ApiError } from "@/types/api";

interface WithdrawalModalProps {
  onClose: () => void;
  onWithdrawn: () => void;
}

const CHECKS = [
  {
    label: "탈퇴 제한 조건 확인",
    desc: "현재 진행 중인 경매(판매) 또는 활성 입찰이 없습니다. 해당 항목이 있을 경우 탈퇴가 불가합니다.",
  },
  {
    label: "30일 유예기간 안내",
    desc: "탈퇴 신청 후 30일간 계정이 유지됩니다. 이 기간 내 로그인 화면에서 계정을 복구할 수 있습니다.",
  },
  {
    label: "데이터 영구 삭제",
    desc: "유예기간 종료 후 이메일·닉네임·주소·찜 목록 등 모든 개인정보가 영구 삭제되며 복구할 수 없습니다.",
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
          className="bg-white w-full max-w-sm p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-black">회원탈퇴</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-7">아래 내용을 모두 확인하고 동의해주세요.</p>

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
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-200 text-xs text-gray-600 hover:border-black hover:text-black transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!allChecked || submitting}
              className="flex-1 h-10 text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "처리 중..." : "탈퇴하기"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
