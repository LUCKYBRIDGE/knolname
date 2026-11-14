# 놀사주 (knolname)

**놀사주**는 `LUCKYBRIDGE/name`의 구조화 데이터베이스와 규칙 엔진을 사용하는
비AI 사주·성명학·작명 웹앱입니다.

## 핵심 원칙

- 생성형 AI를 사용하지 않습니다.
- Gemini/OpenAI 등 외부 LLM API 키가 필요하지 않습니다.
- 사주·이름 분석과 후보 추천은 데이터와 TypeScript 규칙으로 결정적으로 계산합니다.
- `LUCKYBRIDGE/name`을 데이터의 단일 원본으로 유지합니다.
- 공개 앱은 `name`에서 생성한 `public/data/knowledge-base.json` 정적 스냅샷을 이 저장소에 함께 커밋합니다.
- 사용자 접속 중에는 GitHub API, Node/Express 서버, 외부 DB를 호출하지 않습니다.

## 제공 기능

- 양력/음력 입력과 사주 3주·4주 계산
- 대한민국 과거 표준시·DST 및 선택적 진태양시 보정
- 천간·지지·십성·지장간·십이운성
- 합·충·형·파·해 및 오행 분포
- 신강/중화/신약 및 전통 억부용신 후보 계산
- 31대 성씨·본관·발음 프로필
- 인명용 한자 검색, 다중 의미, 원획/기술총획, 획순
- 이름 후보 자동 조합·필터·랭킹
- 한자+독음별 다중의미 확인
- `LUCKYBRIDGE/name/data/hanja/semantics/naming-meaning-curated.csv`에 등록되고
  `primary_name_explanation_allowed=true`인 뜻만 작명 중심 뜻으로 선택
- 일반 사전의 다른 뜻은 숨기지 않고 참고용으로 표시하되 작명 뜻으로는 선택 불가
- 기존 이름은 사용자가 뜻을 직접 지정하지 않은 경우 작명 의도를 자동 추정하지 않음
- 81수리 4격, 음양, 발음오행, 자원오행 분석
- 기존 이름과 후보 비교 리포트
- 후보 보관, 메모, 작업 프로필 브라우저 저장
- JSON 내보내기/불러오기
- `LUCKYBRIDGE/name` 최신 기준 데이터 다시 불러오기

## AI를 제거한 범위

원본 AI Studio 앱의 Gemini 기반 `/api/naming/interpret` 심층 해설 기능을 제거했습니다.

현재 저장소에는 다음이 없습니다.

- `@google/genai`
- `GEMINI_API_KEY`
- Gemini 호출 코드
- 생성형 AI 심층 해설 버튼
- 사용자 이름·생년월일·메모를 외부 LLM으로 보내는 코드

기본 리포트의 설명 문장은 `src/lib/plainKoreanHelper.ts`의 규칙 기반 템플릿으로 생성합니다.

## 정적 배포 구조

```text
LUCKYBRIDGE/name          ← 원본 DB
      │
      │ npm run sync:data (관리/배포 시)
      ▼
public/data/knowledge-base.json
      │
      ▼
src/lib/dataLoader.ts
      ├─ sajuEngine.ts
      ├─ namingEngine.ts
      └─ localApi.ts
              │
              ▼
          React/Vite
              │
              ▼
   GitHub Pages / Cloudflare Pages
```

현재 데이터의 기준은 항상 `LUCKYBRIDGE/name`이며, `knolname`에는 공개 앱 실행에 필요한 정적 스냅샷만 포함합니다.

## 실행

개발·빌드에는 Node.js 22 이상을 권장하지만 운영 서버로 Node.js를 사용하지 않습니다.

```bash
npm install
npm run dev
```

원본 `name` 데이터가 변경되었을 때만 관리자가 다음 명령으로 앱용 스냅샷을 갱신합니다.

```bash
npm run sync:data
```

일반 사용자는 배포된 정적 스냅샷을 사용하며 GitHub 원본 저장소를 직접 호출하지 않습니다.

## 빌드 확인

```bash
npm run lint
npm run build
```

GitHub Actions에서도 위 검증과 AI 의존성 재유입 검사를 수행합니다.

## 개인정보

후보·메모·작업 프로필은 브라우저 `localStorage`에 저장됩니다.
사주·이름 계산은 사용자의 브라우저에서 처리되며 생년월일시와 이름 입력을 별도 놀사주 서버로 전송하지 않습니다.
생성형 AI 서비스로 사용자 입력을 전달하지 않습니다.

## 데이터·저작권

- 앱 코드: `COPYRIGHT.md`
- 데이터 사용 및 출처: `DATA_AND_RIGHTS.md`
- 데이터 원본: `LUCKYBRIDGE/name`
- 실제 데이터별 최신 권리 분류는 원본 저장소의 `data/meta/source-rights.csv`를 기준으로 합니다.

사주·성명학은 전통적 해석 체계이며 과학적으로 검증된 미래 예측으로 표현하지 않습니다.
출생·개명 신고 전 인명용 한자 가능 여부는 대법원 현행 서비스에서 최종 확인해야 합니다.


## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- 별도 Node 서버/Functions/Workers 불필요
- 배포 시 `public/data/knowledge-base.json`이 그대로 포함됩니다.
