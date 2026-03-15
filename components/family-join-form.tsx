"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { joinFamilyWithCode } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-2xl bg-[#1f7a4f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#19653f] disabled:cursor-not-allowed disabled:bg-[#97c8af]"
      disabled={pending}
    >
      {pending ? "가입 중..." : "가족 코드로 가입"}
    </button>
  );
}

export function FamilyJoinForm() {
  const initialState: FamilyInviteActionState = {
    status: "idle",
    message: null
  };
  const [state, formAction] = useFormState(joinFamilyWithCode, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
      <div>
        <h2 className="text-base font-bold text-ink">가족 코드로 가입</h2>
        <p className="mt-2 text-sm text-muted">가족에게 받은 코드를 입력하면 바로 같은 그룹에 합류합니다.</p>
      </div>

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
        <span className="text-sm font-semibold text-ink">가족 코드</span>
        <input
          name="inviteCode"
          placeholder="예: A1B2C3D4"
          className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm uppercase tracking-[0.18em] text-ink outline-none transition focus:border-[#1f7a4f] focus:bg-white"
          maxLength={8}
          required
        />
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <span className="text-sm text-muted">코드는 대소문자 없이 입력해도 됩니다.</span>
      </div>
    </form>
  );
}
