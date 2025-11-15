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
import {
  authenticationService,
  LoginRequestBody,
  RegistrationRequestBody,
} from "@/app/constants";
import { useRouter } from "next/navigation";
import { WebUrl } from "@/app/enum/web-url.enum";
import { Header } from "@/app/components/header/header";
import { ButtonType } from "@/app/enum/button-type.enum";
import { useToast } from "@/app/contexts/toast-context/toast-context";

interface formContentsProps {
  header: string;
  subHeader?: string;
  formComponents: React.ReactNode;
  gotoText: string;
  gotoAction: () => void;
}
export function AuthenticationForm() {
  const methods = useForm<LoginRequestBody | RegistrationRequestBody>({
    mode: "onTouched",
    defaultValues: {},
  });

  const route = useRouter();
  const { showToast, setIsSuccess } = useToast();
  const {
    reset,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = methods;

  const [activeForm, SetActiveForm] = useState<AuthenticationModule>(
    AuthenticationModule.Login
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const onSubmit = async () => {
    try {
      setErrorMessage(null);
      const data = getValues();
      if (activeForm === AuthenticationModule.Login) {
        await authenticationService.login(data as LoginRequestBody);
        route.push(WebUrl.Dashboard);
      } else {
        const res = await authenticationService.register(
          data as RegistrationRequestBody
        );
        SetActiveForm(AuthenticationModule.Login);
        setIsSuccess(true);
        showToast(res.message);
      }
    } catch (err) {
      setIsSuccess(false);
      if (activeForm === AuthenticationModule.Login) {
        showToast("Invalid username or password. Please try again.");
      } else {
        showToast("Email is already existed.");
      }
    }
  };
  useEffect(() => {
    reset();
    setErrorMessage(null);
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
          <Flex direction="column" gap="2" align="center" mb="4">
            <Header
              text={formContents[activeForm].header}
              subText={formContents[activeForm].subHeader}
              textSize="5"
              subTextSize="2"
            />
          </Flex>
          <FormProvider {...methods}>
            <Form.Root
              className={styles.formWrapper}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Flex direction="column" gap="4">
                {formContents[activeForm].formComponents}
                {errorMessage && (
                  <Text color="red" weight="medium">
                    {errorMessage}
                  </Text>
                )}
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
                <CustomButton
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  buttonType={ButtonType.Primary}
                >
                  {formContents[activeForm].header}
                </CustomButton>
                <Flex justify="center" gap="1" mt="4">
                  <Text className={styles.subText}>
                    {formContents[activeForm].gotoText}
                  </Text>
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
