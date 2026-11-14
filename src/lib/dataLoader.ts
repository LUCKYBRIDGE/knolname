import type {
  FiveElement,
  HanjaRecord,
  NormalizedSurnameProfile,
  RepoMetadata,
  SurnameEntry,
} from '../types/naming.ts';

interface StaticKnowledgeSnapshot {
  schemaVersion: string;
  generatedAt: string;
  sourceRepository: string;
  sourceBranch: string;
  hanjaList: HanjaRecord[];
  surnameSeo: SurnameEntry;
  surnames: NormalizedSurnameProfile[];
  disambiguationNotes: Array<{
    hangul: string;
    hanjaForms: string[];
    relationType: string;
    notes: string;
  }>;
  datasetStats: Record<string, unknown>;
  pronunciationHeuristics: Array<Record<string, string>>;
  clanHistoryRows: Array<Record<string, string>>;
  yongsinMethods: Array<Record<string, string>>;
  elementRelations: Array<Record<string, string>>;
  tenGodMap: Array<[string, string]>;
  hiddenStemsMap: Array<
    [string, Array<{ stem: string; hangul: string; element: FiveElement; role: string }>]
  >;
  twelveStagesMap: Array<[string, string]>;
  stemsInfo: Array<
    [string, { hangul: string; hanja: string; yinYang: '양' | '음'; element: FiveElement }]
  >;
  branchesInfo: Array<
    [
      string,
      {
        hangul: string;
        hanja: string;
        yinYang: '양' | '음';
        element: FiveElement;
        zodiac: string;
      },
    ]
  >;
  stemCombos: Array<{ s1: string; s2: string; name: string; element: string }>;
  branchClashes: Array<{ b1: string; b2: string; relation: string }>;
  branchSixCombos: Array<{ b1: string; b2: string; relation: string }>;
  branchThreeCombos: Array<{ b1: string; b2: string; b3: string; element: string }>;
  branchDirectionalCombos: Array<{ b1: string; b2: string; b3: string; element: string }>;
  branchPunishments: Array<{ b1: string; b2: string; b3?: string; label: string }>;
  branchHarms: Array<{ b1: string; b2: string }>;
  branchDestructions: Array<{ b1: string; b2: string }>;
  dstRules: Array<{ fromYear: number; toYear: number; startRule: string; endRule: string; save: string }>;
  stdTimeHistory: Array<{ start: string; end: string; meridian: string; utcOffset: string; notes: string }>;
  kasiTerms2026: Array<{ year: number; term: string; month: number; day: number; hour: number; minute: number }>;
  kasiTerms2027: Array<{ year: number; term: string; month: number; day: number; hour: number; minute: number }>;
}

export interface LoadedKnowledgeBase
  extends Omit<
    StaticKnowledgeSnapshot,
    | 'schemaVersion'
    | 'generatedAt'
    | 'sourceRepository'
    | 'sourceBranch'
    | 'tenGodMap'
    | 'hiddenStemsMap'
    | 'twelveStagesMap'
    | 'stemsInfo'
    | 'branchesInfo'
  > {
  hanjaByChar: Map<string, HanjaRecord>;
  hanjaByReading: Map<string, HanjaRecord[]>;
  surnameByHanja: Map<string, NormalizedSurnameProfile>;
  tenGodMap: Map<string, string>;
  hiddenStemsMap: Map<
    string,
    Array<{ stem: string; hangul: string; element: FiveElement; role: string }>
  >;
  twelveStagesMap: Map<string, string>;
  stemsInfo: Map<
    string,
    { hangul: string; hanja: string; yinYang: '양' | '음'; element: FiveElement }
  >;
  branchesInfo: Map<
    string,
    {
      hangul: string;
      hanja: string;
      yinYang: '양' | '음';
      element: FiveElement;
      zodiac: string;
    }
  >;
}

let cachedKB: LoadedKnowledgeBase | null = null;
let snapshotInfo:
  | Pick<StaticKnowledgeSnapshot, 'schemaVersion' | 'generatedAt' | 'sourceRepository' | 'sourceBranch'>
  | null = null;

function buildIndexes(snapshot: StaticKnowledgeSnapshot): LoadedKnowledgeBase {
  const hanjaByChar = new Map<string, HanjaRecord>();
  const hanjaByReading = new Map<string, HanjaRecord[]>();
  for (const item of snapshot.hanjaList) {
    hanjaByChar.set(item.hanja, item);
    for (const reading of item.legalReadings) {
      const arr = hanjaByReading.get(reading) || [];
      arr.push(item);
      hanjaByReading.set(reading, arr);
    }
  }

  const surnameByHanja = new Map<string, NormalizedSurnameProfile>();
  for (const surname of snapshot.surnames) {
    surnameByHanja.set(surname.hanja, surname);
  }

  return {
    hanjaList: snapshot.hanjaList,
    hanjaByChar,
    hanjaByReading,
    surnameSeo: snapshot.surnameSeo,
    surnames: snapshot.surnames,
    surnameByHanja,
    disambiguationNotes: snapshot.disambiguationNotes,
    datasetStats: snapshot.datasetStats,
    pronunciationHeuristics: snapshot.pronunciationHeuristics,
    clanHistoryRows: snapshot.clanHistoryRows,
    yongsinMethods: snapshot.yongsinMethods,
    elementRelations: snapshot.elementRelations,
    tenGodMap: new Map(snapshot.tenGodMap),
    hiddenStemsMap: new Map(snapshot.hiddenStemsMap),
    twelveStagesMap: new Map(snapshot.twelveStagesMap),
    stemsInfo: new Map(snapshot.stemsInfo),
    branchesInfo: new Map(snapshot.branchesInfo),
    stemCombos: snapshot.stemCombos,
    branchClashes: snapshot.branchClashes,
    branchSixCombos: snapshot.branchSixCombos,
    branchThreeCombos: snapshot.branchThreeCombos,
    branchDirectionalCombos: snapshot.branchDirectionalCombos,
    branchPunishments: snapshot.branchPunishments,
    branchHarms: snapshot.branchHarms,
    branchDestructions: snapshot.branchDestructions,
    dstRules: snapshot.dstRules,
    stdTimeHistory: snapshot.stdTimeHistory,
    kasiTerms2026: snapshot.kasiTerms2026,
    kasiTerms2027: snapshot.kasiTerms2027,
  };
}

export async function initializeKnowledgeBase(): Promise<LoadedKnowledgeBase> {
  if (cachedKB) return cachedKB;

  const url = new URL('data/knowledge-base.json', document.baseURI);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`놀사주 데이터 스냅샷을 불러오지 못했습니다. (HTTP ${response.status})`);
  }

  const snapshot = (await response.json()) as StaticKnowledgeSnapshot;
  if (snapshot.schemaVersion !== 'knolname-static-kb-v1') {
    throw new Error('지원하지 않는 놀사주 데이터 스냅샷 형식입니다.');
  }

  snapshotInfo = {
    schemaVersion: snapshot.schemaVersion,
    generatedAt: snapshot.generatedAt,
    sourceRepository: snapshot.sourceRepository,
    sourceBranch: snapshot.sourceBranch,
  };
  cachedKB = buildIndexes(snapshot);
  return cachedKB;
}

export function getKnowledgeBase(): LoadedKnowledgeBase {
  if (!cachedKB) {
    throw new Error('놀사주 데이터가 아직 초기화되지 않았습니다.');
  }
  return cachedKB;
}

export function getSnapshotInfo() {
  return snapshotInfo;
}

export function getRepoMetadata(): RepoMetadata {
  const kb = getKnowledgeBase();
  return {
    datasetStats: kb.datasetStats,
    surnameSeo: kb.surnameSeo,
    surnames: kb.surnames,
    disambiguationNotes: kb.disambiguationNotes,
    pronunciationHeuristics: kb.pronunciationHeuristics,
    clanHistoryRows: kb.clanHistoryRows,
    yongsinMethods: kb.yongsinMethods,
    elementRelations: kb.elementRelations,
    hanjaCount: kb.hanjaList.length,
    readingCount: kb.hanjaByReading.size,
  };
}

export function applyCustomHanjaOverrides(
  overrides: Array<Partial<HanjaRecord> & { hanja: string }>
): number {
  const kb = getKnowledgeBase();
  let updated = 0;
  for (const item of overrides) {
    const existing = kb.hanjaByChar.get(item.hanja);
    if (!existing) continue;

    if (item.wonhoekStrokes !== undefined) {
      existing.wonhoekStrokes = item.wonhoekStrokes;
      existing.wonhoekEstimated = false;
      existing.yinYangWonhoek =
        item.wonhoekStrokes !== null ? (item.wonhoekStrokes % 2 === 1 ? '양' : '음') : null;
    }
    if (item.resourceElement !== undefined) {
      existing.resourceElement = item.resourceElement;
      existing.resourceElementBasis = item.resourceElementBasis || '사용자 브라우저 보정 규칙';
    }
    if (item.primaryMeaning) existing.primaryMeaning = item.primaryMeaning;
    if (item.tabooWarning !== undefined) existing.tabooWarning = item.tabooWarning;
    updated += 1;
  }
  return updated;
}
