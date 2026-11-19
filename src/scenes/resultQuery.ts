import type { InputSource } from '@/lib/events';
import type { Stats } from './sceneMachine';

// 뷰어 → 결과 화면은 쿼리스트링으로 값을 넘긴다 (서버·저장소 없음). 영상·좌표는 포함하지 않는다.

export type ResultData = { seconds: number; punches: number; sources: InputSource[]; skipped: number };

export function toResultQuery(stats: Stats): string {
  const seconds = Math.round(((stats.finishedAt ?? stats.startedAt) - stats.startedAt) / 1000);
  return new URLSearchParams({
    t: String(seconds),
    p: String(stats.punches),
    s: stats.sources.join(','),
    k: String(stats.skipped),
  }).toString();
}

const SOURCES: InputSource[] = ['camera', 'keyboard'];
const count = (v: unknown, max: number) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 0 ? Math.min(n, max) : 0;
};

/** 주소창은 누구나 고칠 수 있으므로 범위·허용값을 검사해서 읽는다 */
export function parseResultQuery(q: Record<string, string | string[] | undefined>): ResultData {
  const s = String(Array.isArray(q.s) ? q.s[0] : (q.s ?? ''));
  return {
    seconds: count(q.t, 24 * 3600),
    punches: count(q.p, 9999),
    sources: SOURCES.filter((src) => s.split(',').includes(src)),
    skipped: count(q.k, 99),
  };
}
