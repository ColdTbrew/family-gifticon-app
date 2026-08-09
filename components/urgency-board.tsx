import { GifticonCard } from "@/components/gifticon-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import type { UrgencyBuckets } from "@/lib/urgency";

type UrgencyBoardProps = {
  buckets: UrgencyBuckets;
};

function renderDdayLabel(daysLeft: number): string {
  return daysLeft === 0 ? "D-day" : `D-${daysLeft}`;
}

type UrgencyColumnProps = {
  title: string;
  description: string;
  badgeLabel: string;
  badgeVariant: React.ComponentProps<typeof Badge>["variant"];
  entries: UrgencyBuckets["today"];
  emptyMessage: string;
};

function UrgencyColumn({
  title,
  description,
  badgeLabel,
  badgeVariant,
  entries,
  emptyMessage
}: UrgencyColumnProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <GifticonCard
                key={entry.item.id}
                item={entry.item}
                ddayLabel={renderDdayLabel(entry.daysLeft)}
              />
            ))}
          </div>
        ) : (
          <Empty className="min-h-24">
            <EmptyHeader>
              <EmptyDescription>{emptyMessage}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

export function UrgencyBoard({ buckets }: UrgencyBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <UrgencyColumn
        title="오늘 만료"
        description="오늘 안에 먼저 확인하세요."
        badgeLabel="D-0"
        badgeVariant="destructive"
        entries={buckets.today}
        emptyMessage="오늘 만료되는 쿠폰이 없습니다."
      />
      <UrgencyColumn
        title="곧 만료"
        description="3일 안에 만료될 쿠폰입니다."
        badgeLabel="D-1 ~ D-3"
        badgeVariant="warning"
        entries={buckets.soon}
        emptyMessage="D-3 이내 쿠폰이 없습니다."
      />
      <UrgencyColumn
        title="주의"
        description="이번 주 안에 사용할 쿠폰입니다."
        badgeLabel="D-4 ~ D-7"
        badgeVariant="secondary"
        entries={buckets.caution}
        emptyMessage="D-7 이내 쿠폰이 없습니다."
      />
    </div>
  );
}
