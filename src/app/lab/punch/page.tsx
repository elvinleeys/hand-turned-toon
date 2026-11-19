'use client';

import dynamic from 'next/dynamic';

const PunchLab = dynamic(() => import('./PunchLab'), { ssr: false });

export default function Page() {
  return <PunchLab />;
}
