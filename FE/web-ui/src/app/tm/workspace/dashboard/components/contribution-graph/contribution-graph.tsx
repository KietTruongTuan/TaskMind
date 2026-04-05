"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { useThemeContext } from "@/app/contexts/theme-context/theme-context";
import { Flex } from "@radix-ui/themes/dist/cjs/components/flex";
import { ActivityIcon } from "lucide-react";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";

const data = [
  {
    date: "2026-01-01",
    count: 5,
    level: 3,
  },
  {
    date: "2026-04-03",
    count: 13,
    level: 1,
  },
  {
    date: "2026-04-03",
    count: 13,
    level: 1,
  },
  {
    date: "2026-05-04",
    count: 2,
    level: 1,
  },
  {
    date: "2026-06-05",
    count: 12,
    level: 4,
  },
  {
    date: "2026-12-31",
    count: 10,
    level: 2,
  },
];

export function ContributionGraph({
  header,
  subHeader,
}: {
  header: string;
  subHeader?: string;
}) {
  const explicitTheme = {
    light: [
      "var(--contribution-graph-0)",
      "var(--contribution-graph-1)",
      "var(--contribution-graph-2)",
      "var(--contribution-graph-3)",
      "var(--contribution-graph-4)",
    ],
    dark: [
      "var(--contribution-graph-0)",
      "var(--contribution-graph-1)",
      "var(--contribution-graph-2)",
      "var(--contribution-graph-3)",
      "var(--contribution-graph-4)",
    ],
  };
  const { theme } = useThemeContext();
  return (
    <CardNoPadding py="5" px="5" data-testid="contribution-graph" isPrimary>
      <Flex direction="column" width="100%" gap="5">
        <Flex direction="column" width="100%" gap="1">
          <Header
            text={header}
            subText={subHeader}
            textSize="2"
            subTextSize="1"
            icon={<ActivityIcon size={18} />}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <ActivityCalendar
            data={data}
            blockSize={10}
            blockRadius={1}
            colorScheme={theme}
            labels={{
              legend: { less: "Less", more: "More" },
              totalCount: "{{count}} tasks completed in {{year}}",
            }}
            theme={explicitTheme}
            renderBlock={(block, activity) => {
              return React.cloneElement(block, {
                "data-tooltip-id": "github-tooltip",
                "data-tooltip-content": `${activity.count > 0 ? activity.count : "No"} tasks completed on ${new Date(
                  activity.date,
                ).toLocaleDateString("en-VN", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })}`,
              });
            }}
            showWeekdayLabels
          />
          <ReactTooltip id="github-tooltip" place="top" />
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
