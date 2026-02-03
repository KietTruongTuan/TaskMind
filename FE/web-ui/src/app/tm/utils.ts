import { GoalSearchParams } from "../enum/search-params.enum";

export function buildUrl(
  baseUrl: string,
  params?: string | string[],
  searchParams?: Record<GoalSearchParams, string | null | undefined>,
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
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
}
