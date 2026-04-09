export function Footer() {
  const links = ["이용약관", "고객센터", "판매", "개인정보 처리방침", "사업자 정보", "다운로드", "인스타그램", "페이스북"];

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        {/* Nav Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
          {links.map((link, i) => (
            <a
              key={link}
              href="#"
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Company Info */}
        <p className="text-center text-xs text-gray-400 leading-relaxed mb-3">
          (주)이그노아컴퍼니 · 대표이사 김민철 / 소재지: 서울특별시 강남구 테헤란로 328, 201호 / 사업자 등록번호: 766-88-01442&nbsp;&nbsp;
          사업자 정보확인&nbsp;&nbsp;통신판매업신고: 2024-서울강남-0723 호 / 고객센터: 070-4686-3377 /&nbsp;
          고객센터 문의는 이그노아 앱 다운로드 후 문의가능합니다 / support@ignoa.kr
        </p>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400 mb-4">
          Copyright © Ignoa Company Inc. All right reserved
        </p>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6 whitespace-pre-line">
          {`이그노아(주)는 통신판매중개자로서 거래 당사자가 아니며, 상품, 상품정보, 거래에 관한 의무와 책임은 각 판매자에게 있으며,\n이그노아(주)는 원칙적으로 판매 회원과 구매 회원 간의 거래에 대하여 책임을 지지 않습니다.\n다만, 이그노아에서 직접 판매하는 상품에 대한 책임은 이그노아(주)에 있습니다.`}
        </p>

        {/* Escrow Badge */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1 border border-gray-200 rounded px-4 py-2">
            <div className="text-[10px] font-bold text-gray-500 tracking-widest">ESCROW</div>
            <div className="text-[9px] text-gray-400">구매안전서비스</div>
          </div>
        </div>

      </div>
    </footer>
  );
}
