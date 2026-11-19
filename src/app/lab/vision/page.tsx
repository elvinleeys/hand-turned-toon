'use client';

import dynamic from 'next/dynamic';

// MediaPipe·카메라는 브라우저 전용이라 서버 렌더링에서 제외한다.
const VisionLab = dynamic(() => import('./VisionLab'), { ssr: false });

export default function Page() {
  return <VisionLab />;
}
