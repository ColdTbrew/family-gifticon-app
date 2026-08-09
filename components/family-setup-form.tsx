"use client";

import { useActionState, useEffect, useRef } from "react";
import { createFamily } from "@/app/family/setup/actions";
import type { FamilySetupState } from "@/app/family/setup/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FamilySetupForm() {
  const initialState: FamilySetupState = { status: "idle", message: null };
  const [state, formAction] = useActionState(createFamily, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>새 가족 만들기</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormStatusAlert message={state.message} status={state.status} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="family-name">가족 이름</FieldLabel>
              <Input
                id="family-name"
                name="familyName"
                placeholder="예: 우리집, 김가네, 주말카페팀"
                required
              />
              <FieldDescription>생성 즉시 owner 권한으로 가족 그룹에 연결됩니다.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton idleLabel="가족 만들기" pendingLabel="생성 중..." />
        </CardFooter>
      </Card>
    </form>
  );
}
