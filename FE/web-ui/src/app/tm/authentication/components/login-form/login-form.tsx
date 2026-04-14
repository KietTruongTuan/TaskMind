import { InputField } from "@/app/components/input-field/input-field";
import { Flex } from "@radix-ui/themes";
import { FieldError, useFormContext } from "react-hook-form";

export function LoginForm() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Flex direction="column" gap="4" data-testid="login-form">
      <InputField
        name="email"
        type="email"
        placeholder="Enter your email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
        errors={errors.email as FieldError}
      />
      <InputField
        name="password"
        type="password"
        placeholder="Enter your password"
        rules={{
          required: "Password is required",
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            message:
              "Password must contain uppercase, lowercase, and a number.",
          },
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        }}
        errors={errors.password as FieldError}
      />
    </Flex>
  );
}
