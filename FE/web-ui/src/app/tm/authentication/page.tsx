import { Box, Flex, Grid } from "@radix-ui/themes";
import { AuthenticationForm } from "./components/authentication-form/authentication-form";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle";
import { LogoIcon } from "../../components/logo-icon/logo-icon";
import { Header } from "@/app/components/header/header";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";

export default function AuthenticationPage() {
  return (
    <Grid
      columns={{
        initial: "5% 90% 5%",
        sm: "15% 70% 15%",
        md: "30% 40% 30%",
        lg: "35% 30% 35%",
      }}
      rows="1fr auto 1fr"
      height="100vh"
    >
      <Box position="fixed" top="1rem" right="1rem">
        <ThemeToggle />
      </Box>
      <Flex
        gridColumn="2"
        gridRow="2"
        direction="column"
        align="center"
        width="100%"
        height="100%"
        gap="5"
      >
        <Flex direction="column" gap="3" align="center">
          <LogoIcon size="30" />
          <Flex direction="column" gap="2" align="center">
            <Header
              text="AI Goal Manager"
              subText="Smart goal management system"
              textSize="5"
              subTextSize="3"
            ></Header>
          </Flex>
        </Flex>

        <CardNoPadding p="5" gap="5" isPrimary>
          <AuthenticationForm />
        </CardNoPadding>
      </Flex>
    </Grid>
  );
}
