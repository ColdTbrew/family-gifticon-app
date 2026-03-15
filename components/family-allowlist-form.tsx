"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addAllowedFamilyEmail } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import type { FamilyOption } from "@/lib/data/families";

type FamilyAllowlistFormProps = {
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
      {pending ? "추가 중..." : "사용 가능한 유저 추가"}
    </button>
  );
}

export function FamilyAllowlistForm({ ownedFamilies }: FamilyAllowlistFormProps) {
  const initialState: FamilyInviteActionState = {
    status: "idle",
    message: null
  };
  const [state, formAction] = useFormState(addAllowedFamilyEmail, initialState);

  if (ownedFamilies.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
      <div>
        <h2 className="text-base font-bold text-ink">사용 가능한 유저 추가</h2>
        <p className="mt-2 text-sm text-muted">
          이메일을 미리 등록해두면 해당 계정이 로그인할 때 가족에 자동으로 연결됩니다.
        </p>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="allowlist-family-id">
            가족
          </label>
          <select
            id="allowlist-family-id"
            name="familyId"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4]"
            defaultValue={ownedFamilies[0]?.id}
            required
          >
            {ownedFamilies.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name} ({family.role})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="allowlist-email">
            이메일
          </label>
          <input
            id="allowlist-email"
            name="email"
            type="email"
            placeholder="예: happytostar@gmail.com"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2f5ec4]"
            required
          />
        </div>

        <SubmitButton />

        {state.message ? (
          <p
            className={`text-sm ${state.status === "error" ? "text-[#b42318]" : "text-[#1f7a4f]"}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
