"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { GifticonCard } from "@/components/gifticon-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import type { Gifticon } from "@/lib/types";
import { cn } from "@/lib/utils";

type UsedGifticon = {
  item: Gifticon;
  ddayLabel: string;
};

type UsedGifticonsSectionProps = {
  gifticons: UsedGifticon[];
};

export function UsedGifticonsSection({ gifticons }: UsedGifticonsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CardTitle>사용 완료 기프티콘</CardTitle>
          <CardDescription>
            이미 사용 처리한 기프티콘은 목록을 펼쳐서 확인하거나 되돌릴 수 있습니다.
          </CardDescription>
          <CardAction>
            <Badge variant="warning">{gifticons.length}개</Badge>
          </CardAction>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-3">
            {gifticons.map(({ item, ddayLabel }) => (
              <GifticonCard key={item.id} item={item} ddayLabel={ddayLabel} />
            ))}
          </CardContent>
        </CollapsibleContent>

        <CardFooter>
          <CollapsibleTrigger render={<Button variant="outline" className="w-full sm:w-auto" />}>
            {isOpen ? "사용 완료 기프티콘 숨기기" : "사용 완료 기프티콘 보러가기"}
            <ChevronDownIcon
              data-icon="inline-end"
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </CollapsibleTrigger>
        </CardFooter>
      </Card>
    </Collapsible>
  );
}
