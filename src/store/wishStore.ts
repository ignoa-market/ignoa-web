/**
 * 모듈 레벨 찜 캐시
 * - 컴포넌트 언마운트(페이지 이동) 후 복귀 시에도 상태 유지
 * - 페이지 새로고침 시 초기화 (세션 내 캐시)
 */
const wishedIds = new Set<number>();

export const wishStore = {
  isWished: (id: number) => wishedIds.has(id),
  add:      (id: number) => wishedIds.add(id),
  remove:   (id: number) => wishedIds.delete(id),
};
