import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeKnowledgeBase } from './lib/dataLoader.ts';
import { installLocalApi } from './lib/localApi.ts';

async function bootstrap() {
  const root = createRoot(document.getElementById('root')!);

  try {
    await initializeKnowledgeBase();
    installLocalApi();
    root.render(<App />);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '놀사주 데이터를 불러오는 중 오류가 발생했습니다.';
    root.render(
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          background: '#FBF9F5',
          color: '#1C1917',
        }}
      >
        <section style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>놀사주를 시작할 수 없습니다.</h1>
          <p style={{ lineHeight: 1.7 }}>{message}</p>
          <p style={{ lineHeight: 1.7, color: '#78716C' }}>
            저장소의 public/data/knowledge-base.json이 함께 배포되었는지 확인해 주세요.
          </p>
        </section>
      </main>
    );
  }
}

void bootstrap();
