"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { GifticonCard } from "@/components/gifticon-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { Gifticon } from "@/lib/types";

type CalendarGifticon = {
  item: Gifticon;
  ddayLabel: string;
};

export type ExpiryCalendarDay = {
  key: string;
  day: number;
  items: CalendarGifticon[];
};

type ExpiryCalendarProps = {
  days: ExpiryCalendarDay[];
  firstWeekday: number;
  monthLabel: string;
  previousMonthHref: string;
  nextMonthHref: string;
  todayKey: string;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function ExpiryCalendar({
  days,
  firstWeekday,
  monthLabel,
  previousMonthHref,
  nextMonthHref,
  todayKey
}: ExpiryCalendarProps) {
  const firstEventDay = days.find((day) => day.items.length > 0);
  const today = days.find((day) => day.key === todayKey);
  const [selectedKey, setSelectedKey] = useState(firstEventDay?.key ?? today?.key ?? days[0]?.key);
  const selectedDay = days.find((day) => day.key === selectedKey) ?? days[0];
  const monthGifticonCount = days.reduce((sum, day) => sum + day.items.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 py-0">
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDaysIcon className="size-5 text-primary" aria-hidden="true" />
            {monthLabel}
          </CardTitle>
          <CardDescription>날짜를 누르면 만료되는 기프티콘을 확인할 수 있습니다.</CardDescription>
          <CardAction className="flex items-center gap-1">
            <Link
              href={previousMonthHref}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              aria-label="이전 달"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Link>
            <Link
              href={nextMonthHref}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              aria-label="다음 달"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="px-0">
          <div className="grid grid-cols-7 border-t border-border bg-muted/50" aria-hidden="true">
            {weekdayLabels.map((label, index) => (
              <div
                key={label}
                className={cn(
                  "py-2 text-center text-xs font-semibold text-muted-foreground",
                  index === 0 && "text-destructive",
                  index === 6 && "text-primary"
                )}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-border">
            {Array.from({ length: firstWeekday }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-14 border-b border-r border-border bg-muted/25 sm:min-h-20"
                aria-hidden="true"
              />
            ))}

            {days.map((day) => {
              const isSelected = day.key === selectedDay?.key;
              const isToday = day.key === todayKey;
              const hasGifticons = day.items.length > 0;

              return (
                <Button
                  key={day.key}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "relative h-auto min-h-14 min-w-0 flex-col justify-start gap-1 rounded-none border-b border-r border-border px-1 py-1.5 text-sm font-semibold sm:min-h-20 sm:items-start sm:p-2",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    !isSelected && isToday && "bg-primary/10 text-primary hover:bg-primary/15",
                    !isSelected && !isToday && "hover:bg-muted"
                  )}
                  onClick={() => setSelectedKey(day.key)}
                  aria-label={`${monthLabel} ${day.day}일, 만료 기프티콘 ${day.items.length}개`}
                  aria-pressed={isSelected}
                >
                  <span>{day.day}</span>
                  {hasGifticons ? (
                    <>
                      <span
                        className={cn(
                          "size-1.5 rounded-full sm:hidden",
                          isSelected ? "bg-primary-foreground" : "bg-destructive"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "hidden text-[0.7rem] font-medium sm:block",
                          isSelected ? "text-primary-foreground/85" : "text-destructive"
                        )}
                      >
                        {day.items.length}개 만료
                      </span>
                    </>
                  ) : null}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDay ? `${monthLabel} ${selectedDay.day}일` : monthLabel}</CardTitle>
          <CardDescription>선택한 날짜에 만료되는 기프티콘입니다.</CardDescription>
          <CardAction>
            <Badge variant={selectedDay?.items.length ? "secondary" : "outline"}>
              {selectedDay?.items.length ?? 0}개
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {selectedDay && selectedDay.items.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedDay.items.map(({ item, ddayLabel }) => (
                <GifticonCard key={item.id} item={item} ddayLabel={ddayLabel} />
              ))}
            </div>
          ) : (
            <Empty className="min-h-40 border border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDaysIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>이 날짜에 만료되는 기프티콘이 없습니다.</EmptyTitle>
                <EmptyDescription>
                  이번 달에는 총 {monthGifticonCount}개의 만료 일정이 있습니다.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link
                  href="/gifticons/new"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  기프티콘 등록하기
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
