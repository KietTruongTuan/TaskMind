import { InputField } from "@/app/components/input-field/input-field";
import { Flex } from "@radix-ui/themes";
import { FieldError, useFormContext } from "react-hook-form";

export function RegistrationForm() {
  const {
    formState: { errors },
    watch,
  } = useFormContext();

  const password = watch("password");

  return (
    <Flex direction="column" gap="4" data-testid="registration-form">
      <InputField
        name="username"
        type="text"
        placeholder="Enter your username"
        rules={{
          required: "Username is required",
        }}
        errors={errors.username as FieldError}
      />
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
      <InputField
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        rules={{
          required: "Confirm password is required",
          validate: (value: string) => {
            const matches = value === password;
            return matches || "Passwords do not match";
          },
        }}
        errors={errors.confirmPassword as FieldError}
      />
    </Flex>
  );
}
