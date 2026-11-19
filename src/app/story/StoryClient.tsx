'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// 뷰어는 카메라·키보드·시각(Date.now)을 쓰는 브라우저 전용 화면이라 서버 렌더링에서 뺀다.
// (미리 그린 화면이 보이는데 키 입력이 아직 연결되지 않은 순간도 없어진다)
const Story = dynamic(() => import('@/components/Story'), {
  ssr: false,
  loading: () => <main className="min-h-dvh bg-neutral-950" />,
});

export default function StoryClient() {
  // cacheComponents가 켜져 있으면 Next가 방문한 페이지를 숨겨 두고 상태를 보존한다(React Activity).
  // 그러면 다 읽은 뒤 "처음으로 → 읽기"·"다시 보기"로 돌아와도 끝난 뷰어가 복원되어 곧바로 결과로 돌아간다.
  // 링크로 새로 들어올 때마다 바뀌는 bfcacheId를 key로 써서 매번 처음부터 시작한다.
  const { bfcacheId } = useRouter();
  return <Story key={bfcacheId} />;
}
