"use client";

import { useActionState } from "react";
import { deleteFamily } from "@/app/family/actions";
import type { FamilyInviteActionState } from "@/app/family/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { FamilyOption } from "@/lib/data/families";

type FamilyDeleteFormProps = {
  ownedFamilies: FamilyOption[];
};

export function FamilyDeleteForm({ ownedFamilies }: FamilyDeleteFormProps) {
  const initialState: FamilyInviteActionState = { status: "idle", message: null };
  const [state, formAction] = useActionState(deleteFamily, initialState);

  if (ownedFamilies.length === 0) {
    return null;
  }

  return (
    <form id="family-delete-form" action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>가족 삭제</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            owner만 삭제할 수 있습니다. 가족, 기프티콘, 초대 코드, 이미지 연결 정보가 함께 사라집니다.
          </p>
          <FormStatusAlert message={state.message} status={state.status} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="delete-family-id">삭제할 가족</FieldLabel>
              <NativeSelect
                id="delete-family-id"
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
            </Field>
            <Field>
              <FieldLabel htmlFor="delete-family-confirmation">확인 문구</FieldLabel>
              <Input
                id="delete-family-confirmation"
                name="confirmation"
                placeholder='정말 삭제하려면 "삭제"를 입력하세요'
                required
              />
              <FieldDescription>삭제 후에는 새 가족을 다시 만들 수 있습니다.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button type="button" variant="destructive" size="lg" />}
            >
              가족 삭제
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>선택한 가족을 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 입력한 확인 문구가 정확한 경우에만 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  form="family-delete-form"
                  variant="destructive"
                >
                  영구 삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </form>
  );
}
