"use client";

import { deleteGifticon } from "@/app/gifticons/actions";

type DeleteGifticonButtonProps = {
  id: string;
};

export function DeleteGifticonButton({ id }: DeleteGifticonButtonProps) {
  return (
    <button
      formAction={async (formData: FormData) => {
        const confirmed = window.confirm("이 기프티콘을 삭제할까요?");
        if (!confirmed) {
          return;
        }

        await deleteGifticon(formData);
      }}
      formNoValidate
      name="id"
      value={id}
      className="danger"
      type="submit"
    >
      삭제
    </button>
  );
}
