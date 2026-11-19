import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutral-950 px-4 py-10 text-white">
      <Image
        src="/cuts/01-intro.webp"
        alt="지하 연구실 철문 앞에 선 하린."
        width={800}
        height={1200}
        priority
        className="aspect-[2/3] w-[min(70vw,calc((100dvh-22rem)*2/3))] rounded-md object-cover shadow-2xl"
      />
      <div className="text-center">
        <p className="text-sm tracking-widest text-amber-400">손으로 넘기는 웹툰</p>
        <h1 className="mt-1 text-3xl font-bold">잠긴 연구실</h1>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link href="/story?mode=camera" className="rounded-lg bg-amber-400 px-4 py-3 text-center font-bold text-black hover:bg-amber-300">
          ✋ 손으로 읽기
        </Link>
        <Link href="/story?mode=keyboard" className="rounded-lg border border-white/40 px-4 py-3 text-center hover:bg-white/10">
          ⌨️ 키보드로 읽기
        </Link>
      </div>

      <p className="max-w-xs text-center text-xs leading-relaxed text-white/60">
        카메라 영상과 손 좌표는 이 브라우저 안에서만 처리되며, 기기 밖으로 전송되지 않습니다.
        카메라를 쓸 수 없으면 키보드·클릭으로 끝까지 볼 수 있어요.
      </p>

      <nav className="flex gap-4 text-xs text-white/40">
        <Link href="/lab/vision" className="underline">lab: 손 인식</Link>
        <Link href="/lab/punch" className="underline">lab: PUNCH</Link>
        <Link href="/lab/gestures" className="underline">lab: 전체 제스처</Link>
      </nav>
    </main>
  );
}
