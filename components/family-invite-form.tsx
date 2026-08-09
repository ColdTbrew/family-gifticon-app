"use client";

import { useActionState, useEffect, useRef } from "react";
import { createInviteCode } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { FamilyOption } from "@/lib/data/families";

type FamilyInviteFormProps = {
  ownedFamilies: FamilyOption[];
};

export function FamilyInviteForm({ ownedFamilies }: FamilyInviteFormProps) {
  const initialState: FamilyInviteActionState = { status: "idle", message: null };
  const [state, formAction] = useActionState(createInviteCode, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (ownedFamilies.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>초대 코드는 owner만 만들 수 있습니다.</EmptyTitle>
              <EmptyDescription>
                가족을 직접 만든 계정으로 로그인하면 초대 코드를 발급할 수 있습니다.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <form ref={formRef} action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>가족 코드 만들기</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            owner 가족을 선택하면 72시간 동안 유효한 초대 코드가 생성됩니다.
          </p>
          <FormStatusAlert message={state.message} status={state.status} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-family">코드를 만들 가족</FieldLabel>
              <NativeSelect
                id="invite-family"
                name="familyId"
                className="w-full"
                defaultValue={ownedFamilies[0]?.id ?? ""}
                required
              >
                {ownedFamilies.map((family) => (
                  <NativeSelectOption key={family.id} value={family.id}>
                    {family.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>
                새 코드를 만들면 같은 가족의 이전 미사용 코드는 만료됩니다.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton idleLabel="가족 코드 만들기" pendingLabel="생성 중..." />
        </CardFooter>
      </Card>
    </form>
  );
}
