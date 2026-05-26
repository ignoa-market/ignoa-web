import { useEffect, useRef } from "react";
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

  useEffect(() => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        onSelect(data.roadAddress);
        onClose();
      },
      width: "100%",
      height: "100%",
    }).embed(embedRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white w-full max-w-[500px] mx-4 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-0.5">Address</p>
            <p className="text-sm font-bold text-black">주소 검색</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div ref={embedRef} style={{ height: "500px" }} />
      </motion.div>
    </div>
  );
}
