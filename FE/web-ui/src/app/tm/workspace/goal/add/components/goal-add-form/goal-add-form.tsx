import { InputField } from "@/app/components/input-field/input-field";
import { Flex } from "@radix-ui/themes";
import { FieldError, useFormContext } from "react-hook-form";

export function GoalAddForm() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Flex direction="column" gap="4">
      <InputField
        name="title"
        type="text"
        placeholder="Learn React, Visit Vietnam,..."
        rules={{
          required: "Title is required",
        }}
        errors={errors.title as FieldError}
      />
      <InputField
        name="description"
        type="text"
        placeholder="Describe your goal in detail, your current situation, and what you want to achieve..."
        rules={{
          required: "Description is required",
        }}
        isMultiLine
        errors={errors.description as FieldError}
      />
      <Flex width="100%" gap="4">
        <InputField
          name="tag"
          type=""
          placeholder="Study, Health, Work,..."
          rules={{
            required: "Tag is required",
          }}
          errors={errors.tag as FieldError}
          isMultiInput
        />
        <InputField
          name="deadline"
          type="date"
          placeholder=""
          rules={{
            required: "Deadline is required",
          }}
          errors={errors.deadline as FieldError}
        />
      </Flex>
    </Flex>
  );
}
