import { Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import styles from "./page.module.scss";
import { Target } from "lucide-react";
import { AuthenticationForm } from "./components/authentication-form/authentication-form";
import { ThemeToggle } from "../components/theme-toggle/theme-toggle";

export default function AuthenticationPage() {
  return (
    <Grid
      columns={{
        initial: "5% 90% 5%",
        sm: "15% 70% 15%",
        md: "30% 40% 30%",
        lg: "35% 30% 35%",
      }}
      rows="1fr 4fr 1fr"
    >
      <Box
        position="fixed"
        top="1rem"
        right="1rem"
      >
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
          <Flex
            className={styles.gradientBox}
            justify="center"
            align="center"
            p="2"
          >
            <Target />
          </Flex>
          <Heading weight="medium" size="5">
            AI Goal Manager
          </Heading>
          <Text weight="light">Smart goal management system</Text>
        </Flex>

        <Flex
          width="100%"
          height="100%"
          className={styles.authenticationForm}
          direction="column"
          align="center"
          p="5"
          gap="5"
        >
          <AuthenticationForm />
        </Flex>
      </Flex>
    </Grid>
  );
}
