import express from 'express';
import path from 'node:path';
import { syncNameData } from './server/dataSync.ts';
import {
  applyCustomHanjaOverrides,
  getKnowledgeBase,
  getRepoMetadata,
} from './server/dataLoader.ts';
import { analyzeSaju } from './server/sajuEngine.ts';
import { evaluateName, recommendNamesWithMeta } from './server/namingEngine.ts';
import type {
  BirthInput,
  FiveElement,
  HanjaRecord,
  NameCandidateRequest,
  SajuAnalysisResult,
  StrokeMethodId,
} from './src/types/naming.ts';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const syncSummary = await syncNameData();
  console.log(`[name-sync] Ready ${syncSummary.total} files (${syncSummary.downloaded} downloaded)`);

  // Warm up LUCKYBRIDGE/name dataset in memory
  const kb = getKnowledgeBase();
  console.log(
    `[knowledge-base] Loaded ${kb.hanjaList.length} legal Hanja (${kb.hanjaByReading.size} readings) & Surname ${kb.surnameSeo.identity.hanja}`
  );

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/meta', (_req, res) => {
    res.json(getRepoMetadata());
  });

  app.get('/api/hanja/search', (req, res) => {
    const reading = String(req.query.reading || '').trim();
    const query = String(req.query.q || '').trim();
    const element = String(req.query.element || '').trim() as FiveElement | '';
    const maxStrokes = req.query.maxStrokes ? Number(req.query.maxStrokes) : 40;
    const excludeTaboo = req.query.excludeTaboo === 'true';
    const popularOnly = req.query.popularOnly === 'true';
    const limit = Math.min(Number(req.query.limit) || 60, 200);

    let pool: HanjaRecord[] = [];
    if (reading) {
      pool = kb.hanjaByReading.get(reading) || [];
    } else if (query) {
      pool = kb.hanjaList;
    } else {
      pool = kb.hanjaList.filter((h) => Boolean(h.primaryMeaning));
    }

    const filtered = pool.filter((item) => {
      if (excludeTaboo && item.tabooWarning) return false;
      if (popularOnly && !item.isPopularNaming) return false;
      if (element && item.resourceElement !== element) return false;
      const strokes = item.wonhoekStrokes ?? item.unihanTotalStrokes ?? 0;
      if (strokes > maxStrokes) return false;
      if (query) {
        const matchChar = item.hanja.includes(query);
        const matchReading = item.legalReadings.some((r) => r.includes(query));
        const matchMeaning = item.primaryMeaning.includes(query);
        const matchAllMeanings = Object.values(item.meaningByReading).some((arr) =>
          arr.some((m) => m.includes(query))
        );
        if (!matchChar && !matchReading && !matchMeaning && !matchAllMeanings) return false;
      }
      return true;
    });

    // Prefer popular everyday naming Hanja, verified meanings, exact matches, and practical stroke counts
    const sorted = [...filtered].sort((a, b) => {
      const aExactChar = query && a.hanja === query ? 1 : 0;
      const bExactChar = query && b.hanja === query ? 1 : 0;
      if (aExactChar !== bExactChar) return bExactChar - aExactChar;

      const aPop = a.isPopularNaming ? 1 : 0;
      const bPop = b.isPopularNaming ? 1 : 0;
      if (aPop !== bPop) return bPop - aPop;

      const aHasMeaning = a.primaryMeaning ? 1 : 0;
      const bHasMeaning = b.primaryMeaning ? 1 : 0;
      if (aHasMeaning !== bHasMeaning) return bHasMeaning - aHasMeaning;

      if (query) {
        const aExactRead = a.legalReadings.includes(query) ? 1 : 0;
        const bExactRead = b.legalReadings.includes(query) ? 1 : 0;
        if (aExactRead !== bExactRead) return bExactRead - aExactRead;
      }

      const aS = a.wonhoekStrokes ?? a.unihanTotalStrokes ?? 99;
      const bS = b.wonhoekStrokes ?? b.unihanTotalStrokes ?? 99;
      return aS - bS;
    });

    res.json({
      total: sorted.length,
      items: sorted.slice(0, limit),
    });
  });

  app.post('/api/saju/analyze', (req, res) => {
    try {
      const input = req.body as BirthInput;
      const result = analyzeSaju(input);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '사주 계산 중 오류가 발생했습니다.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/naming/evaluate', (req, res) => {
    try {
      const body = req.body as {
        surnameHangul?: string;
        surnameHanja?: string;
        surnameStrokeOverride: number | null;
        strokeMethod: StrokeMethodId;
        hangul1: string;
        hanja1: string;
        hangul2: string;
        hanja2: string;
        saju?: SajuAnalysisResult | null;
      };
      const result = evaluateName(body);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '이름 감정 중 오류가 발생했습니다.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/naming/recommend', (req, res) => {
    try {
      const body = req.body as {
        request: NameCandidateRequest;
        saju?: SajuAnalysisResult | null;
      };
      const result = recommendNamesWithMeta(body.request, body.saju);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '이름 후보 추천 중 오류가 발생했습니다.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/repo/sync', async (req, res) => {
    try {
      const body = req.body as {
        mode: 'github' | 'custom_overrides';
        overrides?: Array<Partial<HanjaRecord> & { hanja: string }>;
      };

      if (body.mode === 'custom_overrides' && Array.isArray(body.overrides)) {
        const updatedCount = applyCustomHanjaOverrides(body.overrides);
        res.json({
          ok: true,
          message: `사용자 규칙 ${updatedCount}건을 메모리에 반영했습니다.`,
          meta: getRepoMetadata(),
        });
        return;
      }

      const synced = await syncNameData({ force: true });
      getKnowledgeBase(true);
      res.json({
        ok: true,
        message: `LUCKYBRIDGE/name에서 기준 데이터 ${synced.total}개를 확인하고 ${synced.downloaded}개를 최신화했습니다.`,
        meta: getRepoMetadata(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '저장소 동기화 중 오류가 발생했습니다.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
