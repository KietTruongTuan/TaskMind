import { SearchParams } from "../enum/search-params.enum";

export function buildUrl(
  baseUrl: string,
  params?: string | string[],
  searchParams?: Record<SearchParams, string | string[] | null | undefined>,
): string {
  let url = baseUrl;
  if (params) {
    const paramArray = Array.isArray(params) ? params : [params];
    paramArray.forEach((param) => {
      url += `/${param}`;
    });
  }

  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(","));
          }
        } else {
          params.append(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
}
