'use client';

import dynamic from 'next/dynamic';

const GesturesLab = dynamic(() => import('./GesturesLab'), { ssr: false });

export default function Page() {
  return <GesturesLab />;
}
