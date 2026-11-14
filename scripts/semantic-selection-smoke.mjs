const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function evaluate(body) {
  const resp = await fetch(`${BASE}/api/naming/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

function given1(result) {
  return result.characters.find((c) => c.role === 'given1');
}

const baseBody = {
  surnameHangul: '서',
  surnameHanja: '徐',
  surnameStrokeOverride: null,
  strokeMethod: 'wonhoek_kangxi',
  hangul1: '우',
  hanja1: '優',
  hangul2: '지',
  hanja2: '智',
  saju: null,
};

const suggested = await evaluate(baseBody);
const u = given1(suggested);
if (!u) throw new Error('given1 evaluation missing');

const selectable = u.meaningSelection?.selectableSenseIds || [];
if (selectable.length < 1) {
  throw new Error('優(우) should expose at least one naming-dictionary selectable sense');
}
if (!u.meaningSelection?.selectedSenseIds?.length) {
  throw new Error('new naming candidate should have a naming-dictionary default suggestion');
}

const nonSelectable = (u.readingSenses || []).find(
  (sense) => !selectable.includes(sense.senseId)
);
if (!nonSelectable) {
  throw new Error('優(우) fixture should contain a general-dictionary reference-only sense');
}

const rejected = await evaluate({
  ...baseBody,
  selectedSenseId1: nonSelectable.senseId,
});
const rejectedChar = given1(rejected);
if (rejectedChar?.meaningSelection?.selectedSenseIds?.includes(nonSelectable.senseId)) {
  throw new Error('general-dictionary-only sense was incorrectly accepted as naming intent');
}
if (rejectedChar?.semanticRiskLevel !== 'invalid') {
  throw new Error('non-selectable meaning request should be marked invalid');
}
if (!String(rejectedChar?.semanticNotice || '').includes('작명사전')) {
  throw new Error('rejection notice should explicitly identify naming-dictionary restriction');
}

const existing = await evaluate({
  ...baseBody,
  meaningSelectionPolicy: 'unknown_unless_selected',
});
const existingChar = given1(existing);
if ((existingChar?.meaningSelection?.selectedSenseIds || []).length !== 0) {
  throw new Error('existing-name analysis must not infer the original naming intent');
}
if (existingChar?.meaningSelection?.selectionOrigin !== 'unknown') {
  throw new Error('existing-name meaning origin should remain unknown until user selection');
}

console.log('semantic selection smoke test passed');
