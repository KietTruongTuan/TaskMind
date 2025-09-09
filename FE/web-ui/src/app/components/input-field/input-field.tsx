import * as Form from "@radix-ui/react-form";
import * as Label from "@radix-ui/react-label";
import { Box, Flex } from "@radix-ui/themes";
import { FieldError, RegisterOptions, useFormContext } from "react-hook-form";
import styles from "./input-field.module.scss";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@headlessui/react";

interface InputPropsType {
  name: string;
  type: string;
  placeholder: string;
  rules?: RegisterOptions;
  errors?: FieldError;
}

export function InputField({
  name,
  type,
  placeholder,
  rules,
  errors,
}: InputPropsType) {
  const { register } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <Form.Field name={name} data-testid={`${name}-input-field`}>
      <Flex direction="column" width="100%" gap="2" position="relative">
        <Form.Label asChild>
          <Label.Root>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Label.Root>
        </Form.Label>
        <Form.Control asChild>
          <Input
            type={inputType}
            placeholder={placeholder}
            {...register(name, rules)}
            className={styles.fieldInput}
          />
        </Form.Control>
        <Box
          onClick={() => setShowPassword((prev) => !prev)}
          position="absolute"
          right="3%"
          top={errors ? "43%":"60%"}
          data-testid="toggle-password-button"
        >
          {isPassword &&
            (showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />)}
        </Box>

        {errors && <Form.Message className={styles.validateMessage}>{errors.message}</Form.Message>}
      </Flex>
    </Form.Field>
  );
}
