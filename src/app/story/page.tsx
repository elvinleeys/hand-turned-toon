import StoryClient from './StoryClient';

// mode(?mode=camera|keyboard)는 브라우저 전용 뷰어 안에서 주소창으로 읽는다
export default function Page() {
  return <StoryClient />;
}
