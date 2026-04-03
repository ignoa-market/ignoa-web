import { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const mockAddresses = [
  { zipCode: "34158", road: "대전광역시 유성구 동서대로 125", building: "한밭대학교" },
  { zipCode: "34134", road: "대전광역시 유성구 대학로 291", building: "충남대학교" },
  { zipCode: "34051", road: "대전광역시 유성구 과학로 169-84", building: "KAIST 본원" },
  { zipCode: "35235", road: "대전광역시 서구 둔산대로 100", building: "대전시청" },
  { zipCode: "34012", road: "대전광역시 유성구 엑스포로 107", building: "대전컨벤션센터" },
  { zipCode: "04524", road: "서울특별시 중구 세종대로 110", building: "서울시청" },
  { zipCode: "06241", road: "서울특별시 강남구 테헤란로 427", building: "위워크 강남" },
  { zipCode: "03155", road: "서울특별시 종로구 세종대로 175", building: "광화문빌딩" },
  { zipCode: "48058", road: "부산광역시 해운대구 해운대해변로 264", building: "해운대해수욕장" },
  { zipCode: "21565", road: "인천광역시 남동구 인주대로 590", building: "인천시청" },
];

interface AddressModalProps {
  onSelect: (address: string) => void;
  onClose: () => void;
}

export function AddressModal({ onSelect, onClose }: AddressModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof mockAddresses>([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    const filtered = mockAddresses.filter(
      (a) =>
        a.road.includes(query) ||
        a.building.includes(query) ||
        a.zipCode.includes(query)
    );
    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-black">주소 검색</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">도로명, 건물명, 지번을 입력하세요</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="예) 동서대로 125, 한밭대학교"
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-10 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {!searched ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">주소를 검색해주세요</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <Search className="w-8 h-8 mb-2" />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.zipCode}
                onClick={() => {
                  onSelect(item.road);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                      {item.zipCode}
                    </span>
                    {item.building && (
                      <span className="text-xs text-gray-400">{item.building}</span>
                    )}
                  </div>
                  <p className="text-sm text-black">{item.road}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
