import fs from 'node:fs';
import path from 'node:path';
import { syncNameData } from '../server/dataSync.ts';
import { getKnowledgeBase } from '../server/dataLoader.ts';

const outPath = path.resolve(process.cwd(), 'public', 'data', 'knowledge-base.json');

await syncNameData({ force: true });
const kb = getKnowledgeBase(true);

const snapshot = {
  schemaVersion: 'knolname-static-kb-v1',
  generatedAt: new Date().toISOString(),
  sourceRepository: 'LUCKYBRIDGE/name',
  sourceBranch: 'main',
  hanjaList: kb.hanjaList,
  surnameSeo: kb.surnameSeo,
  surnames: kb.surnames,
  disambiguationNotes: kb.disambiguationNotes,
  datasetStats: kb.datasetStats,
  pronunciationHeuristics: kb.pronunciationHeuristics,
  clanHistoryRows: kb.clanHistoryRows,
  yongsinMethods: kb.yongsinMethods,
  elementRelations: kb.elementRelations,
  tenGodMap: Array.from(kb.tenGodMap.entries()),
  hiddenStemsMap: Array.from(kb.hiddenStemsMap.entries()),
  twelveStagesMap: Array.from(kb.twelveStagesMap.entries()),
  stemsInfo: Array.from(kb.stemsInfo.entries()),
  branchesInfo: Array.from(kb.branchesInfo.entries()),
  stemCombos: kb.stemCombos,
  branchClashes: kb.branchClashes,
  branchSixCombos: kb.branchSixCombos,
  branchThreeCombos: kb.branchThreeCombos,
  branchDirectionalCombos: kb.branchDirectionalCombos,
  branchPunishments: kb.branchPunishments,
  branchHarms: kb.branchHarms,
  branchDestructions: kb.branchDestructions,
  dstRules: kb.dstRules,
  stdTimeHistory: kb.stdTimeHistory,
  kasiTerms2026: kb.kasiTerms2026,
  kasiTerms2027: kb.kasiTerms2027,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(snapshot), 'utf8');

console.log(
  `[static-data] wrote ${snapshot.hanjaList.length} Hanja and ${snapshot.surnames.length} surnames to public/data/knowledge-base.json`
);
