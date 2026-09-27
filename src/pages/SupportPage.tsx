import { useMemo, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Gavel,
  Headphones,
  MessageCircle,
  PackagePlus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

const categories = [
  { name: "계정", icon: UserRound },
  { name: "상품 등록", icon: PackagePlus },
  { name: "경매·입찰", icon: Gavel },
  { name: "결제·거래", icon: CreditCard },
  { name: "채팅", icon: MessageCircle },
  { name: "안전거래", icon: ShieldCheck },
] as const;

const faqs = [
  { category: "계정", question: "회원정보는 어디에서 수정할 수 있나요?", answer: "계정 메뉴의 마이페이지에서 프로필 이미지와 닉네임, 주소를 수정할 수 있습니다." },
  { category: "계정", question: "탈퇴한 계정을 다시 사용할 수 있나요?", answer: "탈퇴 신청 후 30일 이내에는 로그인 화면에서 계정을 복구할 수 있습니다." },
  { category: "상품 등록", question: "상품 사진과 동영상은 어떻게 등록하나요?", answer: "상품 등록 화면에서 이미지와 동영상을 선택할 수 있습니다. 대표 이미지는 이미지 파일 중에서 지정됩니다." },
  { category: "경매·입찰", question: "입찰한 금액을 취소할 수 있나요?", answer: "입찰은 거래에 직접 영향을 주므로 제출 후에는 취소하거나 변경할 수 없습니다." },
  { category: "경매·입찰", question: "경매 마감 시간을 연장할 수 있나요?", answer: "판매자는 마이페이지의 판매 상품에서 연장 버튼을 눌러 마감 시간을 연장할 수 있습니다." },
  { category: "결제·거래", question: "즉시 구매는 어떻게 진행되나요?", answer: "상품 상세에서 즉시 구매가를 확인한 뒤 구매할 수 있으며, 완료된 거래는 취소할 수 없습니다." },
  { category: "채팅", question: "판매자에게 문의하려면 어떻게 하나요?", answer: "상품 상세의 판매자 정보 옆 메시지 버튼을 누른 뒤 채팅으로 문의할 수 있습니다." },
  { category: "안전거래", question: "외부 거래를 요청받았어요.", answer: "개인 계좌나 외부 메신저를 통한 거래는 피해주세요. 외부 거래로 발생한 문제는 보호받기 어렵습니다." },
] as const;

export function SupportPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = !category || faq.category === category;
      const matchesQuery = !keyword
        || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(keyword);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <main className="min-h-screen bg-white px-6 pb-28 pt-[230px] text-stone-900">
      <div className="mx-auto w-full max-w-[1040px]">
        <section className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Help Center</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">IGNOA 고객센터</h1>
          <p className="mt-3 text-sm text-stone-500">무엇을 도와드릴까요?</p>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="궁금한 내용을 검색해 보세요"
              className="h-14 w-full rounded-2xl border border-stone-200 bg-white pl-13 pr-5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-stone-500"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold">도움말 카테고리</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ name, icon: Icon }) => {
              const selected = category === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(selected ? null : name)}
                  className={`flex h-28 flex-col items-center justify-center gap-3 rounded-2xl border text-sm transition-all hover:-translate-y-0.5 hover:border-stone-400 ${
                    selected ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                  <span className="font-medium">{name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">FAQ</p>
              <h2 className="mt-2 text-2xl font-semibold">자주 묻는 질문</h2>
            </div>
            {category && (
              <button type="button" onClick={() => setCategory(null)} className="text-xs text-stone-400 hover:text-stone-800">
                전체 보기
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-stone-800">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => {
              const opened = openQuestion === faq.question;
              return (
                <div key={faq.question} className="border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(opened ? null : faq.question)}
                    className="flex w-full items-center gap-4 py-5 text-left"
                  >
                    <span className="w-16 flex-shrink-0 text-xs font-medium text-stone-400">{faq.category}</span>
                    <span className="flex-1 text-sm font-medium text-stone-800">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-stone-400 transition-transform ${opened ? "rotate-180" : ""}`} />
                  </button>
                  {opened && (
                    <div className="pb-6 pl-20 pr-10 text-sm leading-7 text-stone-500">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="py-16 text-center text-sm text-stone-400">검색 결과가 없습니다.</div>
            )}
          </div>
        </section>

        <section className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl bg-stone-100 px-8 py-9 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <Headphones className="h-5 w-5 text-stone-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold">원하는 답변을 찾지 못하셨나요?</h2>
              <p className="mt-1 text-sm text-stone-500">IGNOA 고객센터에 직접 문의해 주세요.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.info("1:1 문의 기능은 준비 중입니다.")}
            className="h-11 rounded-xl bg-stone-900 px-6 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            1:1 문의하기
          </button>
        </section>
      </div>
    </main>
  );
}
