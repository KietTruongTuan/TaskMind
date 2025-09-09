"use client";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { Flex, Checkbox, Text, Heading, Box } from "@radix-ui/themes";
import * as Form from "@radix-ui/react-form";
import { FormProvider, useForm } from "react-hook-form";
import styles from "./authentication-form.module.scss";
import { AuthenticationModule } from "@/app/enum/authentication.enum";
import { LoginForm } from "../login-form/login-form";
import { RegistrationForm } from "../registration-form/registration-form";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface formContentsProps {
  header: string;
  subHeader?: string;
  formComponents: React.ReactNode;
  gotoText: string;
  gotoAction: () => void;
}
export function AuthenticationForm() {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const { reset } = methods;
  const [activeForm, SetActiveForm] = useState<AuthenticationModule>(
    AuthenticationModule.Login
  );

  const formContents: Record<AuthenticationModule, formContentsProps> = {
    [AuthenticationModule.Login]: {
      header: "Sign In",
      subHeader: "Enter your account information to continue",
      formComponents: <LoginForm />,
      gotoText: "Don't have account?",
      gotoAction: () => SetActiveForm(AuthenticationModule.Register),
    },

    [AuthenticationModule.Register]: {
      header: "Sign Up",
      subHeader: "Fill your information to create account",
      formComponents: <RegistrationForm />,
      gotoText: "Have account? Back to",
      gotoAction: () => SetActiveForm(AuthenticationModule.Login),
    },
  };

  useEffect(() => {
    reset();
  }, [activeForm, reset]);
  return (
    <Box width="100%">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeForm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Flex direction="column" gap="4" align="center">
            <Heading weight="medium">{formContents[activeForm].header}</Heading>
            <Text weight="light">{formContents[activeForm].subHeader}</Text>
          </Flex>
          <FormProvider {...methods}>
            <Form.Root className={styles.formWrapper}>
              <Flex direction="column" gap="4">
                {formContents[activeForm].formComponents}
                {activeForm === AuthenticationModule.Login && (
                  <Flex justify="between">
                    <Text as="label">
                      <Flex gap="2" align="center">
                        <Checkbox />
                        Remember me
                      </Flex>{" "}
                    </Text>
                    <Text className={styles.textButton}>Forgot password?</Text>
                  </Flex>
                )}
                <CustomButton type="submit">
                  {formContents[activeForm].header}
                </CustomButton>

                <Flex justify="center" gap="1" mt="4">
                  <Text>{formContents[activeForm].gotoText}</Text>
                  <Text
                    className={styles.textButton}
                    onClick={formContents[activeForm].gotoAction}
                    data-testid="goto-button"
                  >
                    {formContents[activeForm].header == "Sign Up"
                      ? "Sign In"
                      : "Sign Up"}
                  </Text>
                </Flex>
              </Flex>
            </Form.Root>
          </FormProvider>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
