import Link from 'next/link';

// 임시 인트로. 실제 인트로 화면은 M2(S0)에서 만든다.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">손으로 넘기는 웹툰</h1>
      <ul className="list-disc pl-5">
        <li><Link className="underline" href="/lab/vision">Lab · 손 랜드마크 확인</Link></li>
        <li><Link className="underline" href="/lab/punch">Lab · PUNCH 판정</Link></li>
      </ul>
    </main>
  );
}
