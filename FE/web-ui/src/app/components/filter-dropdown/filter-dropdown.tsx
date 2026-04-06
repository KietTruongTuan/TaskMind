"use client";
import {
  CheckboxGroup,
  IconButton,
  DropdownMenu,
  Flex,
  Grid,
} from "@radix-ui/themes";
import { Filter } from "lucide-react";
import styles from "./filter-dropdown.module.scss";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchParams } from "@/app/enum/search-params.enum";
import { buildUrl } from "@/app/tm/utils";
import React from "react";
import { CustomButton } from "../custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";

const RCTCheckboxGroupRoot = CheckboxGroup.Root as React.FC<
  React.ComponentProps<typeof CheckboxGroup.Root> & {
    children?: React.ReactNode;
  }
>;

export interface FilterOption {
  label: string;
  searchParamKey: SearchParams;
  options: string[];
}

export function FilterDropDown({
  filterOptions,
  value,
}: {
  filterOptions?: FilterOption[];
  value: Record<SearchParams, string[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<SearchParams, string[]>>(value);

  const handleSubmit = () => {
    const params: Record<SearchParams, string | string[] | null | undefined> = {
      [SearchParams.Search]: searchParams?.get(SearchParams.Search),
      [SearchParams.Status]: searchParams?.getAll(SearchParams.Status),
      [SearchParams.StartDate]: searchParams?.get(SearchParams.StartDate),
      [SearchParams.EndDate]: searchParams?.get(SearchParams.EndDate),
      [SearchParams.Tag]: searchParams?.getAll(SearchParams.Tag),
      [SearchParams.Year]: searchParams?.get(SearchParams.Year),
    };

    filterOptions?.forEach((opt) => {
      const selected = selectedOptions[opt.searchParamKey];
      if (selected && selected.length > 0) {
        params[opt.searchParamKey] = selected;
      } else {
        params[opt.searchParamKey] = undefined;
      }
    });

    const url = pathname || "";
    router.push(buildUrl(url, undefined, params));
    setOpen(false);
  };

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          setSelectedOptions(value);
        }
      }}
    >
      <DropdownMenu.Trigger data-testid="filter-dropdown-trigger">
        <IconButton className={styles.filterDropDown} size="2">
          <Filter size={16} />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        variant="soft"
        align="end"
        sideOffset={5}
        className={styles.filterDropDownContent}
      >
        <Flex direction="column" gap="4" p="3">
          {filterOptions?.map((filterOption) => (
            <DropdownMenu.Group key={filterOption.label}>
              <DropdownMenu.Label style={{ paddingLeft: 2, paddingBottom: 6 }}>
                {filterOption.label}
              </DropdownMenu.Label>
              <RCTCheckboxGroupRoot
                size="2"
                color="gray"
                value={selectedOptions[filterOption.searchParamKey] || []}
                onValueChange={(newSelection: string[]) => {
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [filterOption.searchParamKey]: newSelection,
                  }));
                }}
                highContrast
              >
                <Grid columns="2" gapX="4" gapY="3" width="100%">
                  {filterOption.options.map((option) => (
                    <CheckboxGroup.Item key={option} value={option}>
                      {option}
                    </CheckboxGroup.Item>
                  ))}
                </Grid>
              </RCTCheckboxGroupRoot>
            </DropdownMenu.Group>
          ))}

          <CustomButton
            onClick={handleSubmit}
            buttonType={ButtonType.Primary}
            size="1"
          >
            Filter
          </CustomButton>
        </Flex>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
