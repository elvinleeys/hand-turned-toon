import type { CSSProperties, ReactNode } from 'react';

// 타격 횟수에 따라 흔들림이 세지고, 마지막 타격에 번쩍임 + 파편. 좌표는 모르고 "몇 번 맞았는지"만 안다.
const AMP_PX = [0, 5, 10, 18]; // 0회, 1회, 2회, 3회(파괴)

// 렌더마다 같은 값이 나오도록 난수 대신 고정 공식으로 파편 방향을 정한다
const SHARDS = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.4;
  const dist = 180 + ((i * 53) % 140);
  return {
    dx: `${Math.round(Math.cos(angle) * dist)}px`,
    dy: `${Math.round(Math.sin(angle) * dist + 80)}px`, // 아래로 떨어지는 느낌
    rot: `${((i * 97) % 540) - 270}deg`,
    size: 14 + ((i * 7) % 22),
  };
});

export default function DoorScene({ hits, broken, children }: { hits: number; broken: boolean; children: ReactNode }) {
  const amp = AMP_PX[Math.min(hits, AMP_PX.length - 1)];
  return (
    // key가 바뀌면 다시 마운트되어 흔들림 애니메이션이 매 타격마다 재생된다
    <div key={hits} className={`relative h-full w-full ${hits > 0 ? 'shake' : ''}`} style={{ '--amp': `${amp}px` } as CSSProperties}>
      {children}
      {broken && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="flash absolute inset-0 bg-white" />
          {SHARDS.map((s, i) => (
            <span
              key={i}
              className="shard absolute top-1/2 left-1/2 bg-slate-500"
              style={
                {
                  width: s.size,
                  height: s.size,
                  clipPath: 'polygon(0 0, 100% 20%, 70% 100%, 10% 70%)',
                  '--dx': s.dx,
                  '--dy': s.dy,
                  '--rot': s.rot,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
