import { useState } from 'react';
import { Database, Info, ShieldAlert, X } from 'lucide-react';

interface FirstVisitNoticeModalProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export function FirstVisitNoticeModal({ open, onClose }: FirstVisitNoticeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nolsaju-first-notice-title"
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90dvh] bg-[#FBF9F5] border-t sm:border border-[#E7E2D8] rounded-t-2xl sm:rounded-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-white">
          <span className="w-10 h-1 rounded-full bg-[#D6CEBE]" />
        </div>

        <div className="px-5 py-4 bg-white border-b border-[#E7E2D8] flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-[#9A3412] tracking-wide">놀사주 이용 전 안내</div>
            <h2 id="nolsaju-first-notice-title" className="font-serif-kr text-lg sm:text-xl font-bold text-[#1C1917] mt-0.5">
              데이터·개인정보 및 해석 기준 안내
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            aria-label="안내 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs sm:text-[13px] text-[#1C1917] leading-relaxed">
          <div className="p-3.5 bg-white border border-[#E7E2D8] rounded-sm space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
              <Database className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>1. LUCKYBRIDGE/name 데이터베이스 연동</span>
            </div>
            <p className="text-[#57534E]">
              놀사주는 <strong>LUCKYBRIDGE/name</strong>의 한자·성씨·명리 구조화 데이터를 불러와
              사주 계산, 이름 평가, 후보 추천과 한자 검색을 수행합니다. 앱 저장소에는 대규모 데이터 복사본을
              중복 보관하지 않고 서버 시작 시 필요한 기준 파일을 동기화합니다.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-[#E7E2D8] rounded-sm space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
              <Info className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>2. 생성형 AI 없이 규칙·데이터로 계산합니다</span>
            </div>
            <p className="text-[#57534E]">
              사주 원국, 오행, 전통 명리 해석 보조값, 이름 후보, 수리·음양·발음오행·자원오행 및 비교 리포트는
              저장된 데이터와 코드화된 규칙으로 산출합니다. 외부 생성형 AI 모델에 이름이나 생년월일을 보내
              해설을 생성하는 기능은 포함하지 않습니다.
            </p>
          </div>

          <div className="p-3.5 bg-[#FFF7ED]/70 border border-[#FED7AA] rounded-sm space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#9A3412]">
              <ShieldAlert className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>3. 개인정보와 로컬 저장</span>
            </div>
            <p className="text-[#57534E]">
              저장한 후보·메모·작업 프로필은 브라우저 로컬 저장소에 보관됩니다. 계산을 위해 입력값이 놀사주
              서버에 전달되지만 별도 사용자 DB에 저장하는 기능은 두지 않았습니다.
            </p>
          </div>

          <p className="text-[11px] text-[#78716C] px-0.5">
            ※ 사주·성명학은 전통적 해석 체계에 따른 참고 정보입니다. 출생·개명 신고 전에는 대법원
            전자가족관계등록시스템에서 최신 인명용 한자 가능 여부를 최종 확인하세요.
          </p>
        </div>

        <div className="px-5 py-4 bg-white border-t border-[#E7E2D8] pb-safe flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-[32px] text-xs text-[#57534E] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 accent-[#9A3412]"
            />
            다음부터 이 안내 다시 보지 않기
          </label>
          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[40px] px-6 py-2 text-sm font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-sm transition-colors cursor-pointer"
          >
            내용을 확인하고 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
