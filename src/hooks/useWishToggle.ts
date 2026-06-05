import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { wishStore } from "@/store/wishStore";
import type { WishState } from "@/store/wishStore";

export function useWishToggle(
  itemId: number,
  initialWished?: boolean,
  initialCount?: number
) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<WishState>(
    () =>
      wishStore.get(itemId) ?? {
        wished: initialWished ?? false,
        count: initialCount ?? 0,
      }
  );

  useEffect(() => {
    return wishStore.subscribe((id, next) => {
      if (id === itemId) setState(next);
    });
  }, [itemId]);

  useEffect(() => {
    if (initialWished === undefined || initialCount === undefined) return;
    wishStore.sync(itemId, initialWished, initialCount);
    const synced = wishStore.get(itemId);
    if (synced) setState(synced);
  }, [itemId, initialWished, initialCount]);

  const toggle = async (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await wishStore.toggle(itemId, state);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "찜 처리에 실패했습니다.");
    }
  };

  return { wished: state.wished, wishCount: state.count, toggle };
}
