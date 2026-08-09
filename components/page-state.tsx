import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type PageStateProps = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  variant?: "default" | "error";
};

export function PageState({ title, description, action, variant = "default" }: PageStateProps) {
  if (variant === "error") {
    return (
      <Alert variant="destructive" className="max-w-xl shadow-panel">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {action ? (
            <EmptyContent>
              <Link className={cn(buttonVariants({ variant: "outline" }))} href={action.href}>
                {action.label}
              </Link>
            </EmptyContent>
          ) : null}
        </Empty>
      </CardContent>
    </Card>
  );
}
