# 놀사주 데이터·출처·권리 운영

## 1. 단일 데이터 원본

놀사주는 대규모 작명 데이터를 자체 저장소에 복제하지 않고
`LUCKYBRIDGE/name`을 단일 기준 데이터베이스로 사용합니다.

서버의 `server/dataSync.ts`가 실행 시 필요한 공개 원본 파일을
`data/luckybridge/` 런타임 캐시로 내려받습니다. 이 폴더는 Git 추적 대상이 아닙니다.

## 2. 최신 권리 판단 기준

데이터의 이용 가능 범위는 놀사주 코드의 추측이나 파일 위치로 판단하지 않습니다.
다음 `LUCKYBRIDGE/name` 자료를 최신 기준으로 사용합니다.

- `COPYRIGHT_AND_DATA_USE.md`
- `THIRD_PARTY_NOTICES.md`
- `APP_ATTRIBUTION.md`
- `RIGHTS_AUDIT.md`
- `data/meta/source-rights.csv`
- `data/meta/distribution-policy.csv`
- `data/meta/license-map.csv`

## 3. 앱 표시 원칙

- KOSIS 기반 통계는 국가통계포털(KOSIS) 출처를 표시합니다.
- 한국민족문화대백과사전(AKS) 텍스트를 직접 근거로 표시하는 경우 항목별 출처·저작권 표기를 유지합니다.
- KASI 자료는 확인된 공공누리 범위 안에서 한국천문연구원 출처를 표시합니다.
- 논문·족보·2차 사이트는 원문·표·도표를 앱에 복제하지 않고 참고·교차검증·자체 요약 원칙을 적용합니다.
- 인명용 한자 신고 가능 여부는 앱 내부 미러만으로 법적 확정을 하지 않습니다.

## 4. 생성형 AI 없음

놀사주는 사용자 입력을 Gemini, OpenAI 또는 다른 생성형 AI 모델로 보내지 않습니다.
사주·작명 결과는 저장된 데이터와 코드화된 규칙으로 계산합니다.

## 5. 광범위 공개 전 점검

앱의 공개 범위를 확대하거나 상업적 배포를 시작하기 전에는
`LUCKYBRIDGE/name`의 최신 권리 감사 상태를 다시 확인해야 합니다.
특히 `review_before_broad_public_release`, `reference_only`,
`official_reference_bulk_reuse_unverified` 등으로 분류된 자료를 앱에 원문 형태로 노출하지 않습니다.
