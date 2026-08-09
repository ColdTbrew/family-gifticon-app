"use client";

import { useActionState } from "react";
import { addAllowedFamilyEmail } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { FamilyOption } from "@/lib/data/families";

type FamilyAllowlistFormProps = {
  ownedFamilies: FamilyOption[];
};

export function FamilyAllowlistForm({ ownedFamilies }: FamilyAllowlistFormProps) {
  const initialState: FamilyInviteActionState = { status: "idle", message: null };
  const [state, formAction] = useActionState(addAllowedFamilyEmail, initialState);

  if (ownedFamilies.length === 0) {
    return null;
  }

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>사용 가능한 유저 추가</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            이메일을 미리 등록해두면 해당 계정이 로그인할 때 가족에 자동으로 연결됩니다.
          </p>
          <FormStatusAlert message={state.message} status={state.status} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="allowlist-family-id">가족</FieldLabel>
              <NativeSelect
                id="allowlist-family-id"
                name="familyId"
                className="w-full"
                defaultValue={ownedFamilies[0]?.id}
                required
              >
                {ownedFamilies.map((family) => (
                  <NativeSelectOption key={family.id} value={family.id}>
                    {family.name} ({family.role})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="allowlist-email">이메일</FieldLabel>
              <Input
                id="allowlist-email"
                name="email"
                type="email"
                placeholder="예: happytostar@gmail.com"
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton idleLabel="사용 가능한 유저 추가" pendingLabel="추가 중..." />
        </CardFooter>
      </Card>
    </form>
  );
}
