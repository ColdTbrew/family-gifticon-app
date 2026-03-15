"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createInviteCode } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import type { FamilyOption } from "@/lib/data/families";

type FamilyInviteFormProps = {
  ownedFamilies: FamilyOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-2xl bg-[#2f5ec4] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#264eaa] disabled:cursor-not-allowed disabled:bg-[#9fb4eb]"
      disabled={pending}
    >
      {pending ? "생성 중..." : "가족 코드 만들기"}
    </button>
  );
}

export function FamilyInviteForm({ ownedFamilies }: FamilyInviteFormProps) {
  const initialState: FamilyInviteActionState = {
    status: "idle",
    message: null
  };
  const [state, formAction] = useFormState(createInviteCode, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (ownedFamilies.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
        <p className="text-base font-bold text-ink">초대 코드는 owner만 만들 수 있습니다.</p>
        <p className="mt-2 text-sm text-muted">
          가족을 직접 만든 계정으로 로그인하면 초대 코드를 발급할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
      <div>
        <h2 className="text-base font-bold text-ink">가족 코드 만들기</h2>
        <p className="mt-2 text-sm text-muted">owner 가족을 선택하면 72시간 동안 유효한 초대 코드가 생성됩니다.</p>
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
        <span className="text-sm font-semibold text-ink">코드를 만들 가족</span>
        <select
          name="familyId"
          className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4] focus:bg-white"
          defaultValue={ownedFamilies[0]?.id ?? ""}
          required
        >
          {ownedFamilies.map((family) => (
            <option key={family.id} value={family.id}>
              {family.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <span className="text-sm text-muted">같은 가족에서 새 코드를 만들면 이전 미사용 코드는 만료됩니다.</span>
      </div>
    </form>
  );
}
