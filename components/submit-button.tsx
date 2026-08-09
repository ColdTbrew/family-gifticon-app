"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
  variant = "default"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" variant={variant} disabled={disabled || pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
