"use client";

import { useFormState, useFormStatus } from "react-dom";
import { deleteFamily } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import type { FamilyOption } from "@/lib/data/families";

type FamilyDeleteFormProps = {
  ownedFamilies: FamilyOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl border border-[#e7b1b1] bg-[#fff3f3] px-4 py-3 text-sm font-bold text-[#9d2f2f] transition hover:bg-[#ffe7e7] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "삭제 중..." : "가족 삭제"}
    </button>
  );
}

export function FamilyDeleteForm({ ownedFamilies }: FamilyDeleteFormProps) {
  const initialState: FamilyInviteActionState = {
    status: "idle",
    message: null
  };
  const [state, formAction] = useFormState(deleteFamily, initialState);

  if (ownedFamilies.length === 0) {
    return null;
  }

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-[#f0d3d3] bg-[#fff8f8] p-5 shadow-panel">
      <div>
        <h2 className="text-base font-bold text-ink">가족 삭제</h2>
        <p className="mt-2 text-sm text-muted">
          owner만 삭제할 수 있습니다. 가족, 기프티콘, 초대 코드, 이미지 연결 정보가 함께 사라집니다.
        </p>
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
        <span className="text-sm font-semibold text-ink">삭제할 가족</span>
        <select
          name="familyId"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#c95d5d]"
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

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink">확인 문구</span>
        <input
          name="confirmation"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#c95d5d]"
          placeholder='정말 삭제하려면 "삭제"를 입력하세요'
          required
        />
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <span className="text-sm text-muted">삭제 후에는 새 가족을 다시 만들 수 있습니다.</span>
      </div>
    </form>
  );
}
