"use client";
import { TextField } from "@radix-ui/themes";
import { Search } from "lucide-react";
import styles from "./search-bar.module.scss";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchParams } from "@/app/enum/search-params.enum";
import { buildUrl } from "@/app/tm/utils";
import { useCallback, useRef, useState } from "react";

export function SearchBar({
  value,
  onClientSearch,
}: {
  value: string;
  onClientSearch?: (searchValue: string) => void;
}) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedRef = useRef<string | null>(null);
  const [search, setSearch] = useState<string>(value);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onSearch = useCallback(
    (searchValue: string) => {
      setSearch(searchValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const trimmedSearch = searchValue.trim();

        if (lastPushedRef.current === trimmedSearch) {
          return;
        }

        lastPushedRef.current = trimmedSearch;

        if (onClientSearch) {
          onClientSearch(trimmedSearch);
          return;
        }
        
        const params: Record<
          SearchParams,
          string | string[] | null | undefined
        > = {
          [SearchParams.Search]: trimmedSearch,
          [SearchParams.Status]: searchParams?.getAll(SearchParams.Status),
          [SearchParams.StartDate]: searchParams?.get(SearchParams.StartDate),
          [SearchParams.EndDate]: searchParams?.get(SearchParams.EndDate),
          [SearchParams.Tag]: searchParams?.getAll(SearchParams.Tag),
        };

        router.push(buildUrl(pathname, undefined, params));
      }, 500);
    },
    [router, pathname, searchParams, onClientSearch],
  );
  return (
    <TextField.Root
      placeholder="Search"
      className={styles.searchBar}
      onChange={(e) => onSearch(e.target.value)}
      value={search}
    >
      <TextField.Slot>
        <Search size={16} />
      </TextField.Slot>
    </TextField.Root>
  );
}
