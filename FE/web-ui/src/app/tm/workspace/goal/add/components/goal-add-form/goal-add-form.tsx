import { InputField } from "@/app/components/input-field/input-field";
import { Flex } from "@radix-ui/themes";
import { FieldError, useFormContext } from "react-hook-form";

export function GoalAddForm() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Flex direction="column" gap="4" data-testid="goal-add-form">
      <InputField
        name="name"
        type="text"
        placeholder="Learn React, Visit Vietnam,..."
        rules={{
          required: "Name is required",
        }}
        errors={errors.name as FieldError}
      />
      <InputField
        name="description"
        type="text"
        placeholder="Describe your goal in detail, your current situation, and what you want to achieve..."
        isMultiLine
        isFileInput
        errors={errors.description as FieldError}
      />
      <Flex width="100%" gap="4">
        <InputField
          name="tag"
          type=""
          placeholder="Study, Health, Work,..."
          errors={errors.tag as FieldError}
          isMultiInput
        />
        <InputField
          name="deadline"
          type="date"
          placeholder=""
          rules={{
            required: "Deadline is required",
            validate: (value: Date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selectedDate = new Date(value);
              selectedDate.setHours(0, 0, 0, 0);
              return selectedDate >= today || "Deadline must be in the future";
            },
          }}
          errors={errors.deadline as FieldError}
        />
      </Flex>
    </Flex>
  );
}
