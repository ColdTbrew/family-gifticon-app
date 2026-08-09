"use client";

import { useActionState, useEffect, useRef } from "react";
import { joinFamilyWithCode } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FamilyJoinForm() {
  const initialState: FamilyInviteActionState = { status: "idle", message: null };
  const [state, formAction] = useActionState(joinFamilyWithCode, initialState);
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
          <CardTitle>가족 코드로 가입</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            가족에게 받은 코드를 입력하면 바로 같은 그룹에 합류합니다.
          </p>
          <FormStatusAlert message={state.message} status={state.status} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="family-invite-code">가족 코드</FieldLabel>
              <Input
                id="family-invite-code"
                name="inviteCode"
                placeholder="예: A1B2C3D4"
                className="uppercase tracking-[0.18em]"
                maxLength={8}
                required
              />
              <FieldDescription>코드는 대소문자 없이 입력해도 됩니다.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton
            idleLabel="가족 코드로 가입"
            pendingLabel="가입 중..."
            variant="success"
          />
        </CardFooter>
      </Card>
    </form>
  );
}
