"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createFamily,
  initialFamilySetupState
} from "@/app/family/setup/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-2xl bg-[#2f5ec4] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#264eaa] disabled:cursor-not-allowed disabled:bg-[#9fb4eb]"
      disabled={pending}
    >
      {pending ? "생성 중..." : "가족 만들기"}
    </button>
  );
}

export function FamilySetupForm() {
  const [state, formAction] = useFormState(createFamily, initialFamilySetupState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "rounded-2xl border border-[#f2b8b5] bg-[#fff4f3] px-4 py-3 text-sm text-danger"
              : "rounded-2xl border border-[#b9dcc7] bg-[#f3fbf6] px-4 py-3 text-sm text-[#22613a]"
          }
        >
          {state.message}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink">가족 이름</span>
        <input
          className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
          name="familyName"
          placeholder="예: 우리집, 김가네, 주말카페팀"
          required
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <span className="text-sm text-muted">생성 즉시 owner 권한으로 가족 그룹에 연결됩니다.</span>
      </div>
    </form>
  );
}
