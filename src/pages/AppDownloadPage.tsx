import { Star } from "lucide-react";
import logoImage from "@/assets/logo-optimized.png";
import appStoreBadge from "@/assets/download-on-app-store.svg";
import googlePlayBadge from "@/assets/get-it-on-google-play.png";
import { toast } from "sonner";

const QR_SIZE = 25;

function isFinderCell(x: number, y: number, originX: number, originY: number) {
  const localX = x - originX;
  const localY = y - originY;
  if (localX < 0 || localX > 6 || localY < 0 || localY > 6) return false;
  const outer = localX === 0 || localX === 6 || localY === 0 || localY === 6;
  const center = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
  return outer || center;
}

function isFinderArea(x: number, y: number) {
  return (x <= 7 && y <= 7)
    || (x >= QR_SIZE - 8 && y <= 7)
    || (x <= 7 && y >= QR_SIZE - 8);
}

function TemporaryQr() {
  const cells = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const x = index % QR_SIZE;
    const y = Math.floor(index / QR_SIZE);
    const finder = isFinderCell(x, y, 0, 0)
      || isFinderCell(x, y, QR_SIZE - 7, 0)
      || isFinderCell(x, y, 0, QR_SIZE - 7);
    const data = !isFinderArea(x, y) && ((x * 3 + y * 5 + x * y) % 11 < 5);
    return finder || data;
  });

  return (
    <div
      aria-label="IGNOA 앱 다운로드 임시 QR 코드"
      className="grid h-36 w-36 bg-white"
      style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}
    >
      {cells.map((filled, index) => (
        <span key={index} className={filled ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

export function AppDownloadPage() {
  const showPreparing = () => toast.info("앱 출시를 준비 중입니다.");

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 pb-16 pt-[186px] text-black">
      <section className="flex w-full max-w-xl flex-col items-center text-center">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          앱에서 IGNOA를<br />제대로 즐겨보세요!
        </h1>

        <div className="relative my-12 flex h-72 w-72 items-center justify-center">
          <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-[6px] border-t-[6px] border-gray-200" />
          <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-[6px] border-t-[6px] border-gray-200" />
          <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-[6px] border-l-[6px] border-gray-200" />
          <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-[6px] border-r-[6px] border-gray-200" />
          <TemporaryQr />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-2">
            <img src={logoImage} alt="IGNOA" className="h-full w-full object-contain" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-500">IGNOA 앱 평점</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-base font-bold">4.9</span>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
              </div>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-gray-100" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={showPreparing} className="flex h-20 items-center justify-center transition-opacity hover:opacity-80" aria-label="App Store에서 다운로드">
            <img src={appStoreBadge} alt="Download on the App Store" className="h-12 w-auto" />
          </button>
          <button onClick={showPreparing} className="flex h-20 items-center justify-center transition-opacity hover:opacity-80" aria-label="Google Play에서 다운로드">
            <img src={googlePlayBadge} alt="Get it on Google Play" className="h-[72px] w-auto" />
          </button>
        </div>
      </section>
    </main>
  );
}
