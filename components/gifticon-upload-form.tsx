"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FamilyOption } from "@/lib/data/families";
import {
  createGifticon,
  GifticonUploadState,
  initialGifticonUploadState
} from "@/app/gifticons/new/actions";

type GifticonUploadFormProps = {
  families: FamilyOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-2xl bg-[#2f5ec4] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#264eaa] disabled:cursor-not-allowed disabled:bg-[#9fb4eb]"
      disabled={pending}
    >
      {pending ? "등록 중..." : "기프티콘 등록"}
    </button>
  );
}

function StatusMessage({ state }: { state: GifticonUploadState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "error"
          ? "rounded-2xl border border-[#f2b8b5] bg-[#fff4f3] px-4 py-3 text-sm text-danger"
          : "rounded-2xl border border-[#b9dcc7] bg-[#f3fbf6] px-4 py-3 text-sm text-[#22613a]"
      }
    >
      {state.message}
    </p>
  );
}

export function GifticonUploadForm({ families }: GifticonUploadFormProps) {
  const [state, formAction] = useFormState(createGifticon, initialGifticonUploadState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
      <StatusMessage state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">가족</span>
          <select
            name="familyId"
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            defaultValue={families[0]?.id ?? ""}
            required
          >
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name} ({family.role})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">브랜드</span>
          <input
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            name="brand"
            placeholder="예: 스타벅스"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">기프티콘 이름</span>
          <input
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            name="title"
            placeholder="예: 카페 아메리카노 T"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">만료일</span>
          <input
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            name="expiresAt"
            type="date"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-ink">바코드 / 쿠폰번호</span>
          <input
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            name="barcode"
            placeholder="숫자 또는 영문 쿠폰번호를 입력하세요"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-ink">메모</span>
          <textarea
            className="min-h-[110px] w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
            name="memo"
            placeholder="사용처, 주의사항, 남은 금액 등을 적어두세요"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-ink">이미지 업로드</span>
          <input
            className="block w-full rounded-2xl border border-dashed border-line bg-slate-50 px-4 py-3 text-sm text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-[#eef3ff] file:px-3 file:py-2 file:font-semibold file:text-[#2f5ec4]"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          />
          <p className="text-xs text-muted">선택 사항입니다. JPG, PNG, WebP, HEIC 파일을 10MB 이하로 올릴 수 있습니다.</p>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <span className="text-sm text-muted">등록 후 홈과 캘린더에 바로 반영됩니다.</span>
      </div>
    </form>
  );
}
