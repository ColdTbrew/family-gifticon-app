import { Alert, AlertDescription } from "@/components/ui/alert";

type FormStatusAlertProps = {
  message: string | null;
  status: "idle" | "success" | "error";
};

export function FormStatusAlert({ message, status }: FormStatusAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant={status === "error" ? "destructive" : "success"}>
      <AlertDescription role="status">{message}</AlertDescription>
    </Alert>
  );
}
