import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { roadAddress: string; jibunAddress: string; zonecode: string }) => void;
        width?: string | number;
        height?: string | number;
      }) => { embed: (element: HTMLElement | null) => void };
    };
  }
}

interface AddressModalProps {
  onSelect: (address: string) => void;
  onClose: () => void;
}

export function AddressModal({ onSelect, onClose }: AddressModalProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  const [loadError, setLoadError] = useState(false);

  // Keep the latest callbacks without recreating the postcode iframe whenever
  // the parent re-renders (for example, while the signup timer is running).
  useEffect(() => {
    onSelectRef.current = onSelect;
    onCloseRef.current = onClose;
  }, [onClose, onSelect]);

  useEffect(() => {
    if (!window.daum?.Postcode) {
      setLoadError(true);
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const address = data.roadAddress || data.jibunAddress;
        if (!address) return;
        onSelectRef.current(address);
        onCloseRef.current();
      },
      width: "100%",
      height: "100%",
    }).embed(embedRef.current);

    return () => {
      embedRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="mx-4 w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-medium tracking-[-0.02em] text-black">주소 검색</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        {loadError ? (
          <div className="h-[500px] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[13px] leading-5 text-gray-500">주소 검색 서비스를 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full border border-gray-200 px-6 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
            >
              닫기
            </button>
          </div>
        ) : (
          <div ref={embedRef} style={{ height: "500px" }} />
        )}
      </motion.div>
    </div>
  );
}
