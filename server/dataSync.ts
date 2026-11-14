import fs from 'node:fs';
import path from 'node:path';

const REPO = 'LUCKYBRIDGE/name';
const BRANCH = 'main';
const DATA_ROOT = path.resolve(process.cwd(), 'data', 'luckybridge');
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/`;

const STATIC_PATHS = [
  'hanja/enriched/hanja-master-enriched.csv',
  'hanja/semantics/meaning-senses.csv',
  'hanja/semantics/naming-meaning-curated.csv',
  'hanja/semantics/sense-concern-curated.csv',
  'meta/dataset-stats.json',
  'meta/quality-gates.json',
  'meta/schema-version.json',
  'meta/sources.csv',
  'meta/source-audit.csv',
  'meta/source-rights.csv',
  'meta/license-map.csv',
  'meta/distribution-policy.csv',
  'surnames/clan-history.csv',
  'surnames/clans-core-2015.csv',
  'surnames/hangul-hanja-disambiguation.csv',
  'surnames/pronunciation-heuristics.csv',
  'surnames/pronunciation-profiles.csv',
  'surnames/surnames.csv',
  'myeongri/십성_천간100.csv',
  'myeongri/십이운성_화토동궁.csv',
  'myeongri/용신_방법론_카탈로그.csv',
  'myeongri/지장간.csv',
  'myeongri/지지.csv',
  'myeongri/지지방합.csv',
  'myeongri/지지삼합.csv',
  'myeongri/지지육합.csv',
  'myeongri/지지충.csv',
  'myeongri/지지파.csv',
  'myeongri/지지해.csv',
  'myeongri/지지형.csv',
  'myeongri/천간.csv',
  'myeongri/천간합.csv',
  'rules/오행_상생상극.csv',
  'time/2026_24절기_KASI.csv',
  'time/2027_24절기_KASI.csv',
  'time/대한민국_DST_rules.csv',
  'time/대한민국_표준시_역사.csv',
] as const;

function rawUrl(relPath: string): string {
  return RAW_BASE + relPath.split('/').map(encodeURIComponent).join('/');
}

async function listSurnameEntries(): Promise<string[]> {
  const url = `https://api.github.com/repos/${REPO}/contents/data/surnames/entries?ref=${BRANCH}`;
  const resp = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!resp.ok) throw new Error(`성씨 엔트리 목록 조회 실패: HTTP ${resp.status}`);
  const items = (await resp.json()) as Array<{ name?: string; type?: string }>;
  return items
    .filter((item) => item.type === 'file' && item.name?.endsWith('.json') && !item.name.endsWith('-strokes.json'))
    .map((item) => `surnames/entries/${item.name}`);
}

async function downloadOne(relPath: string, force: boolean): Promise<boolean> {
  const target = path.join(DATA_ROOT, relPath);
  if (!force && fs.existsSync(target) && fs.statSync(target).size > 0) return false;

  const resp = await fetch(rawUrl(relPath));
  if (!resp.ok) throw new Error(`데이터 다운로드 실패: ${relPath} (HTTP ${resp.status})`);
  const bytes = Buffer.from(await resp.arrayBuffer());
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return true;
}

export async function syncNameData(options?: { force?: boolean }): Promise<{ downloaded: number; total: number }> {
  const force = options?.force ?? false;
  const entryPaths = await listSurnameEntries();
  const paths = [...STATIC_PATHS, ...entryPaths];
  let downloaded = 0;

  for (let i = 0; i < paths.length; i += 6) {
    const batch = paths.slice(i, i + 6);
    const results = await Promise.all(batch.map((p) => downloadOne(p, force)));
    downloaded += results.filter(Boolean).length;
  }

  return { downloaded, total: paths.length };
}
