# 놀사주 (knolname)

**놀사주**는 `LUCKYBRIDGE/name`의 구조화 데이터베이스와 규칙 엔진을 사용하는
비AI 사주·성명학·작명 웹앱입니다.

## 핵심 원칙

- 생성형 AI를 사용하지 않습니다.
- Gemini/OpenAI 등 외부 LLM API 키가 필요하지 않습니다.
- 사주·이름 분석과 후보 추천은 데이터와 TypeScript 규칙으로 결정적으로 계산합니다.
- 대규모 작명 DB는 이 저장소에 중복 복사하지 않고 `LUCKYBRIDGE/name`을 단일 원본으로 사용합니다.
- 서버 시작 시 필요한 데이터 파일을 `data/luckybridge/`에 동기화하며 이 폴더는 Git에 커밋하지 않습니다.

## 제공 기능

- 양력/음력 입력과 사주 3주·4주 계산
- 대한민국 과거 표준시·DST 및 선택적 진태양시 보정
- 천간·지지·십성·지장간·십이운성
- 합·충·형·파·해 및 오행 분포
- 신강/중화/신약 및 전통 억부용신 후보 계산
- 31대 성씨·본관·발음 프로필
- 인명용 한자 검색, 다중 의미, 원획/기술총획, 획순
- 이름 후보 자동 조합·필터·랭킹
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

## 데이터 구조

```text
LUCKYBRIDGE/name
      │
      │ 공개 원본 데이터 동기화
      ▼
server/dataSync.ts
      │
      ▼
data/luckybridge/   (런타임 캐시, Git 제외)
      │
      ├─ server/dataLoader.ts
      ├─ server/sajuEngine.ts
      └─ server/namingEngine.ts
              │
              ▼
          React UI
```

현재 데이터의 기준은 항상 `LUCKYBRIDGE/name`입니다.

## 실행

Node.js 22 이상을 권장합니다.

```bash
npm install
npm run dev
```

기본 포트는 `3000`이며 `PORT` 환경변수로 변경할 수 있습니다.

서버 최초 시작 시 `LUCKYBRIDGE/name`에서 필요한 데이터 파일을 내려받습니다.
이미 데이터가 있으면 재사용하고, 앱의 **자료 동기화** 기능을 실행하면 강제로 최신화합니다.

## 빌드 확인

```bash
npm run lint
npm run build
```

GitHub Actions에서도 위 검증과 AI 의존성 재유입 검사를 수행합니다.

## 개인정보

후보·메모·작업 프로필은 브라우저 `localStorage`에 저장됩니다.
사주·이름 계산 요청은 놀사주 서버에서 처리되지만 별도의 사용자 데이터베이스에 저장하는 기능은 없습니다.
생성형 AI 서비스로 사용자 입력을 전달하지 않습니다.

## 데이터·저작권

- 앱 코드: `COPYRIGHT.md`
- 데이터 사용 및 출처: `DATA_AND_RIGHTS.md`
- 데이터 원본: `LUCKYBRIDGE/name`
- 실제 데이터별 최신 권리 분류는 원본 저장소의 `data/meta/source-rights.csv`를 기준으로 합니다.

사주·성명학은 전통적 해석 체계이며 과학적으로 검증된 미래 예측으로 표현하지 않습니다.
출생·개명 신고 전 인명용 한자 가능 여부는 대법원 현행 서비스에서 최종 확인해야 합니다.
