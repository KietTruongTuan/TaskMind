import * as Form from "@radix-ui/react-form";
import * as Label from "@radix-ui/react-label";
import { Box, Flex, Text } from "@radix-ui/themes";
import { FieldError, RegisterOptions, useFormContext } from "react-hook-form";
import styles from "./input-field.module.scss";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, Plus, X } from "lucide-react";
import { Input, Textarea } from "@headlessui/react";

export interface InputPropsType {
  name: string;
  type?: string;
  placeholder: string;
  rules?: RegisterOptions;
  errors?: FieldError;
  isMultiLine?: boolean;
  isMultiInput?: boolean;
}

export function InputField({
  name,
  type,
  placeholder,
  rules,
  errors,
  isMultiLine = false,
  isMultiInput = false,
}: InputPropsType) {
  const { register, setValue, trigger } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isMultiInput) {
      setValue(name, selected);
    }
  }, [selected, name, setValue, isMultiInput]);

  const onAddTag = () => {
    const trimmed = query.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected([...selected, trimmed]);
    setQuery("");
  };

  const onDeleteTag = (index: number) => {
    setSelected(selected.filter((_, i) => i !== index));
  };

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <Form.Field
      name={name}
      data-testid={`${name}-input-field`}
      className={styles.fieldWrapper}
    >
      <Flex direction="column" width="100%" gap="2" position="relative">
        <Form.Label asChild>
          <Label.Root>
            <Text weight="medium">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Text>
          </Label.Root>
        </Form.Label>
        {isMultiInput ? (
          <>
            <Input
              placeholder={placeholder}
              className={styles.fieldInput}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              value={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddTag();
                }
              }}
              onBlur={() => trigger(name)}
              data-testid={`${name}-field`}
            />
            <Input type="hidden" {...register(name, rules)} />
          </>
        ) : (
          <Form.Control asChild>
            {isMultiLine ? (
              <Textarea
                placeholder={placeholder}
                {...register(name, rules)}
                className={styles.fieldInput}
                rows={6}
                data-testid={`${name}-field`}
              />
            ) : (
              <Input
                type={inputType}
                placeholder={placeholder}
                {...register(name, rules)}
                className={styles.fieldInput}
                data-testid={`${name}-field`}
              />
            )}
          </Form.Control>
        )}

        <Box
          onClick={() => setShowPassword((prev) => !prev)}
          position="absolute"
          right="3%"
          top={errors ? "43%" : "60%"}
          data-testid="toggle-password-button"
        >
          {isPassword &&
            (showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />)}
        </Box>
        {isMultiInput && (
          <Box
            position="absolute"
            right="3%"
            top={
              selected.length > 0 && errors
                ? "35%"
                : selected.length > 0
                ? "39%"
                : errors
                ? "43%"
                : "60%"
            }
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddTag}
            data-testid="add-tag-button"
          >
            <Plus size={18} />
          </Box>
        )}
        {selected.length > 0 && (
          <Flex wrap="wrap" gap="1">
            {selected.map((value, index) => (
              <Flex
                key={index}
                className={styles.selectedItem}
                pl="2"
                pr="1"
                py="1"
                align="center"
                gap="1"
              >
                <Text size="1">{value}</Text>
                <X
                  size={14}
                  cursor="pointer"
                  onClick={() => onDeleteTag(index)}
                />
              </Flex>
            ))}
          </Flex>
        )}
        {errors && (
          <Form.Message className={styles.validateMessage}>
            {errors.message}
          </Form.Message>
        )}
      </Flex>
    </Form.Field>
  );
}
