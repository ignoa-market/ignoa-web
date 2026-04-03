export function Footer() {
  return (
    <footer className="bg-[#EFEFEF] mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-black text-2xl font-bold tracking-tight mb-4">IGNOA</div>
            <p className="text-gray-500 text-sm whitespace-nowrap">
              국내 최초 패션 경매 플랫폼. 희귀 아이템을 합리적인 가격에 만나보세요.
            </p>
          </div>

          <div className="flex gap-16 md:ml-auto">
            {/* Customer Care */}
            <div>
              <h4 className="text-black text-sm font-semibold mb-4">고객센터</h4>
              <ul className="space-y-2.5">
                {["자주 묻는 질문", "배송 안내", "주문 조회", "반품 및 교환"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 text-sm hover:text-black transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-black text-sm font-semibold mb-4">회사</h4>
              <ul className="space-y-2.5">
                {["개인정보 보호방침", "이용약관", "사업자 정보"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 text-sm hover:text-black transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              (주)이그노아컴퍼니 | 대표 김민철 | 사업자등록번호 766-88-01442 | 고객센터 070-4686-3377
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 Ignoa Company Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
