"use client";

import { PieChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Flex } from "@radix-ui/themes";
import { Header } from "@/app/components/header/header";
import { PieChart as PieChartIcon } from "lucide-react";
import styles from "./pie-chart-card.module.scss";
import { useThemeContext } from "@/app/contexts/theme-context/theme-context";

export interface PieChartData {
  id: number;
  value: number;
  label: string;
  color: string;
}

export function PieChartCard({
  data,
  header,
  subHeader,
}: {
  data: PieChartData[];
  header: string;
  subHeader?: string;
}) {
  const chartData = data.filter((item) => item.value > 0);
  const { theme } = useThemeContext();

  const muiTheme = createTheme({
    palette: {
      mode: theme === "light" ? "light" : "dark",
    },
  });

  return (
    <CardNoPadding py="5" px="5" isPrimary>
      <Flex direction="column" width="100%" gap="1" mb="3">
        <Header
          text={header}
          subText={subHeader}
          textSize="2"
          subTextSize="1"
          icon={<PieChartIcon size={18} />}
        />
      </Flex>
      <Flex justify="center" align="center" width="100%" mt="4">
        <ThemeProvider theme={muiTheme}>
          <PieChart
            className={styles.pieChart}
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
          />
        </ThemeProvider>
      </Flex>
    </CardNoPadding>
  );
}
