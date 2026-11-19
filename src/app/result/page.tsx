import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { episode1, resultCut } from '@/scenes/data/episode1';
import type { Scene } from '@/scenes/types';
import { parseResultQuery } from '@/scenes/resultQuery';

const SOURCE_LABEL = { camera: '손', keyboard: '키보드·클릭' } as const;
const TOTAL_CLUES = Object.values(episode1.scenes as Record<string, Scene>).reduce(
  (n, s) => n + (s.kind === 'flashlight' ? s.clues.length : 0),
  0,
);

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

async function Stats({ searchParams }: { searchParams: PageProps<'/result'>['searchParams'] }) {
  const r = parseResultQuery(await searchParams);
  const mode = r.sources.includes('camera') ? 'camera' : 'keyboard';
  const rows = [
    ['걸린 시간', formatTime(r.seconds)],
    ['읽은 방법', r.sources.map((s) => SOURCE_LABEL[s]).join(' + ') || '-'],
    ['문을 친 횟수', `${r.punches}번`],
    ['찾은 단서', `${r.clues} / ${TOTAL_CLUES}`],
    ...(r.skipped > 0 ? [['건너뛴 장면', `${r.skipped}개`]] : []),
  ];
  return (
    <>
      {/* 결과 그림의 위쪽 절반(하늘)이 지표 자리 */}
      <dl className="absolute inset-x-0 top-0 grid gap-2 p-6 sm:p-8">
        <p className="text-sm tracking-widest text-amber-300">잠긴 연구실 · 완주</p>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between border-b border-white/20 pb-1">
            <dt className="text-sm text-white/70">{k}</dt>
            <dd className="text-xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="absolute inset-x-0 bottom-0 flex gap-3 p-6">
        <Link href={`/story?mode=${mode}`} className="flex-1 rounded-lg bg-amber-400 px-4 py-3 text-center font-bold text-black hover:bg-amber-300">
          다시 보기
        </Link>
        <Link href="/" className="flex-1 rounded-lg border border-white/50 bg-black/40 px-4 py-3 text-center hover:bg-white/10">
          처음으로
        </Link>
      </div>
    </>
  );
}

export default function Page(props: PageProps<'/result'>) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 py-6 text-white">
      <div className="relative aspect-[2/3] w-[min(92vw,calc((100dvh-3rem)*2/3))] overflow-hidden rounded-md shadow-2xl">
        <Image src={resultCut.src} alt={resultCut.alt} width={800} height={1200} priority className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/70 to-transparent" aria-hidden />
        <Suspense fallback={null}>
          <Stats searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
