import { useEffect, useState } from "react";
import { VideoOff } from "lucide-react";

interface VideoMediaProps {
  src: string;
  className?: string;
  controls?: boolean;
}

export function VideoMedia({ src, className, controls = false }: VideoMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (failed) {
    return (
      <div className={`${className ?? ""} flex flex-col items-center justify-center gap-2 bg-stone-100 p-3 text-center`}>
        <VideoOff className="h-6 w-6 text-stone-400" />
        <p className="text-xs text-stone-500">이 브라우저에서 재생할 수 없는 동영상입니다.</p>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-stone-700 underline underline-offset-2"
        >
          동영상 열기
        </a>
      </div>
    );
  }

  return (
    <video
      src={src}
      controls={controls}
      muted={!controls}
      playsInline
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
