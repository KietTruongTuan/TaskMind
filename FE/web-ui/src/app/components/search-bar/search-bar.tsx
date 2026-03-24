"use client";
import { TextField } from "@radix-ui/themes";
import { Search } from "lucide-react";
import styles from "./search-bar.module.scss";
import { useRouter } from "next/navigation";
import { WebUrl } from "@/app/enum/web-url.enum";
import { SearchParams } from "@/app/enum/search-params.enum";
import { buildUrl } from "@/app/tm/utils";
import { useCallback, useRef, useState } from "react";

export function SearchBar({ url, value }: { url: WebUrl, value: string }) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPushedRef = useRef<string | null>(null);
  const [search, setSearch] = useState(value);
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

        const params: Record<SearchParams, string | null | undefined> = {
          [SearchParams.Search]: trimmedSearch,
          [SearchParams.Status]: undefined,
          [SearchParams.StartDate]: undefined,
          [SearchParams.EndDate]: undefined,
        };

        router.push(buildUrl(url, undefined, params));
      }, 500);
    },
    [router, url],
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
