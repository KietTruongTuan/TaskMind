"use client";

import { PieChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Flex, Text, Box } from "@radix-ui/themes";
import { Header } from "@/app/components/header/header";
import { PieChart as PieChartIcon } from "lucide-react";
import styles from "./pie-chart-card.module.scss";
import { useThemeContext } from "@/app/contexts/theme-context/theme-context";
import { Status } from "@/app/enum/status.enum";

export interface PieChartData {
  id: Status;
  value: number;
  label: string;
  color: string;
}

export function PieChartCard({
  data,
  header,
  subHeader,
  onStatusClick,
}: {
  data: PieChartData[];
  header: string;
  subHeader?: string;
  onStatusClick?: (status: Status) => void;
}) {
  const chartData = data.filter((item) => item.value > 0);
  const { theme } = useThemeContext();
  const muiTheme = createTheme({
    palette: {
      mode: theme === "light" ? "light" : "dark",
    },
  });

  return (
    <CardNoPadding py="5" px="5" data-testid="pie-chart" isPrimary>
      <Flex direction="column" width="100%" gap="7">
        <Flex direction="column" width="100%" gap="1">
          <Header
            text={header}
            subText={subHeader}
            textSize="2"
            subTextSize="1"
            icon={<PieChartIcon size={18} />}
          />
        </Flex>
        <Flex justify="center" align="center" width="100%" height="100%">
          {chartData.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="100%"
              height="100%"
            >
              <Text size="1">No task available</Text>
            </Flex>
          ) : (
            <ThemeProvider theme={muiTheme}>
              <PieChart
                className={styles.pieChart}
                width={200}
                height={200}
                series={[
                  {
                    data: chartData,
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    innerRadius: 20,
                    paddingAngle: 5,
                    cornerRadius: 4,
                    valueFormatter: (v) => `${v.value}`,  
                  },  
                ]}
                onItemClick={(e, item) => {
                  if (onStatusClick) {
                    onStatusClick(chartData[item.dataIndex].id);
                  }
                }}
              />
            </ThemeProvider>
          )}
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
