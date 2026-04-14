import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiError } from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class HttpService {
  private instance: AxiosInstance;
  protected refreshInstance: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL?: string) {
    const resolvedBaseURL = this.resolveBaseUrl(baseURL);
    this.instance = axios.create({
      baseURL: resolvedBaseURL,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.refreshInstance = axios.create({
      baseURL: resolvedBaseURL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    this.setUpInterceptor();
  }

  private resolveBaseUrl(passedURL?: string): string {
    if (typeof window === "undefined") {
      if (process.env.INTERNAL_API_BASE_URL) {
        return process.env.INTERNAL_API_BASE_URL;
      }
    }

    if (passedURL) {
      return passedURL;
    }

    return process.env.NEXT_PUBLIC_API_BASE_URL || "";
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  private setUpInterceptor() {
    this.instance.interceptors.request.use(
      (request) => {
        const token = this.getAccessToken();
        if (token && request.headers) {
          request.headers.Authorization = `Bearer ${token}`;
        }
        if (process.env.NODE_ENV === "development") {}
        return request;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      },
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest._isRefresh &&
          !originalRequest.url?.includes(ApiUrl.Login) &&
          !originalRequest.url?.includes(ApiUrl.RefreshToken)
        ) {
          originalRequest._retry = true;
          const { authenticationService } = await import("@/app/constants");
          try {
            const refreshResponse = await authenticationService.refresh();
            const access = refreshResponse.data.access;
            if (access) {
              this.setAccessToken(access);
              originalRequest.headers["Authorization"] = `Bearer ${access}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            await authenticationService.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as { error?: string };

      return {
        message: data?.error || "Server Internal Error",
        status: error.response.status,
      };
    } else if (error.request) {
      console.error(
        `🚨 "No response received" for URL: ${error.config?.url}`,
        error.config?.data,
      );
      return {
        message: "No response received.",
        status: 0,
      };
    } else {
      return {
        message: error.message || "Unknown Error.",
      };
    }
  }

  // GET request
  async get<Res>(url: string, request?: AxiosRequestConfig): Promise<Res> {
    const response = await this.instance.get<Res>(url, request);
    return response.data;
  }

  // POST request
  async post<Res, Req = undefined>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig,
  ): Promise<Res> {
    const response = await this.instance.post<Res>(url, data, request);
    return response.data;
  }

  // PUT request
  async put<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig,
  ): Promise<Res> {
    const response = await this.instance.put<Res>(url, data, request);
    return response.data;
  }

  // PATCH request
  async patch<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig,
  ): Promise<Res> {
    const response = await this.instance.patch<Res>(url, data, request);
    return response.data;
  }

  // DELETE request
  async delete<Res>(url: string, request?: AxiosRequestConfig): Promise<Res> {
    const response = await this.instance.delete<Res>(url, request);
    return response.data;
  }
}
