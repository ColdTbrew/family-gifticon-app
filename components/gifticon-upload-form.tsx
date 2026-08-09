"use client";

import { useActionState, useEffect, useRef } from "react";
import { createGifticon } from "@/app/gifticons/new/actions";
import type { GifticonUploadState } from "@/app/gifticons/new/actions";
import { FormStatusAlert } from "@/components/form-status-alert";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { FamilyOption } from "@/lib/data/families";

type GifticonUploadFormProps = {
  families: FamilyOption[];
  readOnly?: boolean;
};

export function GifticonUploadForm({ families, readOnly = false }: GifticonUploadFormProps) {
  const initialState: GifticonUploadState = { status: "idle", message: null };
  const [state, formAction] = useActionState(createGifticon, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={readOnly ? undefined : formAction}
      onSubmit={readOnly ? (event) => event.preventDefault() : undefined}
    >
      <Card>
        <CardHeader>
          <CardTitle>기프티콘 정보</CardTitle>
          <CardDescription>필수 항목부터 입력하고 필요한 정보는 나중에 보완할 수 있습니다.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <FormStatusAlert message={state.message} status={state.status} />

          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="gifticon-family">가족</FieldLabel>
              <NativeSelect
                id="gifticon-family"
                name="familyId"
                className="w-full"
                defaultValue={families[0]?.id ?? ""}
                required
              >
                {families.map((family, index) => (
                  <NativeSelectOption
                    key={`${family.id}-${family.role}-${index}`}
                    value={family.id}
                  >
                    {family.name} ({family.role})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="gifticon-brand">브랜드 (필수)</FieldLabel>
              <Input id="gifticon-brand" name="brand" placeholder="예: 스타벅스" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="gifticon-title">기프티콘 이름 (선택)</FieldLabel>
              <Input
                id="gifticon-title"
                name="title"
                placeholder="예: 카페 아메리카노 T"
              />
              <FieldDescription>비워두면 브랜드를 사용해 이름을 자동 생성합니다.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="gifticon-expires-at">만료일 (필수)</FieldLabel>
              <Input id="gifticon-expires-at" name="expiresAt" type="date" required />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="gifticon-barcode">바코드 / 쿠폰번호 (선택)</FieldLabel>
              <Input
                id="gifticon-barcode"
                name="barcode"
                placeholder="사진만 먼저 올리고 나중에 입력해도 됩니다"
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="gifticon-memo">메모 (선택)</FieldLabel>
              <Textarea
                id="gifticon-memo"
                name="memo"
                placeholder="사용처, 주의사항, 남은 금액 등을 적어두세요"
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="gifticon-image">이미지 업로드 (필수)</FieldLabel>
              <Input
                id="gifticon-image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                required
              />
              <FieldDescription>
                JPG, PNG, WebP, HEIC 파일을 10MB 이하로 올릴 수 있습니다.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <SubmitButton
            idleLabel={readOnly ? "UI 프리뷰" : "기프티콘 등록"}
            pendingLabel="등록 중..."
            disabled={readOnly}
          />
          <span className="text-sm text-muted-foreground">
            등록 후 홈과 캘린더에 바로 반영됩니다.
          </span>
        </CardFooter>
      </Card>
    </form>
  );
}
