'use client';

import dynamic from 'next/dynamic';

// 뷰어는 카메라·키보드·시각(Date.now)을 쓰는 브라우저 전용 화면이라 서버 렌더링에서 뺀다.
// (미리 그린 화면이 보이는데 키 입력이 아직 연결되지 않은 순간도 없어진다)
const Story = dynamic(() => import('@/components/Story'), {
  ssr: false,
  loading: () => <main className="min-h-dvh bg-neutral-950" />,
});

export default function StoryClient() {
  return <Story />;
}
