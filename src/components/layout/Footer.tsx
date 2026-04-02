export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Navigation */}
        <nav className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            이용약관
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            고객센터
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            판매
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-semibold">
            개인정보 보호방침
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            사업자 정보
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            다운로드
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            인스타그램
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            페이스북
          </a>
        </nav>

        {/* Company Information */}
        <div className="text-center text-xs text-gray-500 mb-6 leading-relaxed">
          <p className="mb-2">
            (주)이그노아컴퍼니(온라) | 대표이사 김민철 / 소재지: 서울특별시 성수구 연무장길 22B 303호 / 사업자 등록번호: 766-88-01442{' '}
            <a href="#" className="underline hover:text-gray-700">
              사업자 정보확인
            </a>{' '}
            | 통신판매업 신고: 2018-서울성수-0725 호 / 고객센터: 070-4686-3377 / 고객센터 운영시간: 평일 오전 10시~오후 5시, 점심시간 12시~1시 /{' '}
            <a href="mailto:support@ignoa.com" className="underline hover:text-gray-700">
              support@ignoa.com
            </a>
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mb-6">
          <p>Copyright © Ignoa Company Inc. All rights reserved.</p>
        </div>

        {/* Legal Notice */}
        <div className="text-center text-xs text-gray-500 mb-8 leading-relaxed max-w-4xl mx-auto">
          <p>
            플랫폼에서(이)가 등록한판매자가 판매하는 거래 상품에 대한 책임은 전적으로 등록한판매자에게 있으며, 판매자를 통한 거래에서 발생하는 모든 문제는 해당 상품을 등록한 판매자와 고객 간의 문제입니다. 플랫폼에서(이)는 등록한판매자와 고객 간의 거래 중개 역할만을 수행하며 등록한판매자(이)가 판매한 상품에 대한 책임은 지지 않습니다.
          </p>
        </div>

        {/* Logo/Badge */}
        <div className="flex justify-center">
          <div className="text-gray-400 text-2xl font-bold">
            IGNOA
          </div>
        </div>
      </div>
    </footer>
  );
}
