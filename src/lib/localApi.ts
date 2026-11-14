import type {
  BirthInput,
  FiveElement,
  HanjaRecord,
  NameCandidateRequest,
  SajuAnalysisResult,
  StrokeMethodId,
} from '../types/naming.ts';
import {
  applyCustomHanjaOverrides,
  getKnowledgeBase,
  getRepoMetadata,
  getSnapshotInfo,
} from './dataLoader.ts';
import { analyzeSaju } from './sajuEngine.ts';
import { evaluateName, recommendNamesWithMeta } from './namingEngine.ts';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function parseBody(init?: RequestInit): unknown {
  if (typeof init?.body !== 'string' || !init.body) return {};
  return JSON.parse(init.body);
}

function searchHanja(url: URL) {
  const kb = getKnowledgeBase();
  const reading = (url.searchParams.get('reading') || '').trim();
  const query = (url.searchParams.get('q') || '').trim();
  const element = (url.searchParams.get('element') || '').trim() as FiveElement | '';
  const maxStrokes = Number(url.searchParams.get('maxStrokes') || 40);
  const excludeTaboo = url.searchParams.get('excludeTaboo') === 'true';
  const popularOnly = url.searchParams.get('popularOnly') === 'true';
  const limit = Math.min(Number(url.searchParams.get('limit') || 60), 200);

  let pool: HanjaRecord[];
  if (reading) pool = kb.hanjaByReading.get(reading) || [];
  else if (query) pool = kb.hanjaList;
  else pool = kb.hanjaList.filter((h) => Boolean(h.primaryMeaning));

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
      const matchSenseLayer = Object.values(item.sensesByReading || {}).some((senses) =>
        senses.some((sense) =>
          [sense.rawSense, sense.glossCore, sense.editorialGloss || ''].some((text) =>
            text.includes(query)
          )
        )
      );
      if (!matchChar && !matchReading && !matchMeaning && !matchAllMeanings && !matchSenseLayer) {
        return false;
      }
    }
    return true;
  });

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

  return { total: sorted.length, items: sorted.slice(0, limit) };
}

async function handleLocalApi(url: URL, init?: RequestInit): Promise<Response> {
  try {
    if (url.pathname.endsWith('/api/meta')) {
      return jsonResponse(getRepoMetadata());
    }

    if (url.pathname.endsWith('/api/hanja/search')) {
      return jsonResponse(searchHanja(url));
    }

    if (url.pathname.endsWith('/api/saju/analyze')) {
      const body = parseBody(init) as BirthInput;
      return jsonResponse(analyzeSaju(body));
    }

    if (url.pathname.endsWith('/api/naming/evaluate')) {
      const body = parseBody(init) as {
        surnameHangul?: string;
        surnameHanja?: string;
        surnameStrokeOverride: number | null;
        strokeMethod: StrokeMethodId;
        hangul1: string;
        hanja1: string;
        hangul2: string;
        hanja2: string;
        selectedSenseId1?: string | null;
        selectedSenseId2?: string | null;
        meaningSelectionPolicy?: 'suggest_default' | 'unknown_unless_selected';
        saju?: SajuAnalysisResult | null;
      };
      return jsonResponse(evaluateName(body));
    }

    if (url.pathname.endsWith('/api/naming/recommend')) {
      const body = parseBody(init) as {
        request: NameCandidateRequest;
        saju?: SajuAnalysisResult | null;
      };
      return jsonResponse(recommendNamesWithMeta(body.request, body.saju));
    }

    if (url.pathname.endsWith('/api/repo/sync')) {
      const body = parseBody(init) as {
        mode: 'github' | 'custom_overrides';
        overrides?: Array<Partial<HanjaRecord> & { hanja: string }>;
      };

      if (body.mode === 'custom_overrides' && Array.isArray(body.overrides)) {
        const updatedCount = applyCustomHanjaOverrides(body.overrides);
        return jsonResponse({
          ok: true,
          message: `브라우저 작업 중 사용자 보정 ${updatedCount}건을 반영했습니다.`,
          meta: getRepoMetadata(),
        });
      }

      const info = getSnapshotInfo();
      return jsonResponse({
        ok: true,
        message: info?.generatedAt
          ? `현재 배포 스냅샷: ${new Date(info.generatedAt).toLocaleString('ko-KR')} 생성본 · 최신화는 knolname 데이터 동기화 후 재배포됩니다.`
          : '현재 저장소에 포함된 정적 데이터 스냅샷을 사용 중입니다.',
        meta: getRepoMetadata(),
      });
    }

    return jsonResponse({ error: '알 수 없는 로컬 API 경로입니다.' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : '브라우저 계산 중 오류가 발생했습니다.';
    return jsonResponse({ error: message }, 400);
  }
}

export function installLocalApi(): void {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const url = new URL(raw, window.location.href);
    if (url.origin === window.location.origin && url.pathname.includes('/api/')) {
      return handleLocalApi(url, init);
    }
    return nativeFetch(input, init);
  };
}
