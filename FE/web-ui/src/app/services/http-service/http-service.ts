import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiError } from "@/app/constants";

export class HttpService {
  private instance: AxiosInstance;
  protected refreshInstance: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.refreshInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    this.setUpInterceptor();
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Get access token from cookie
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Clear access token cookie
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
        if (process.env.NODE_ENV === "development") {
          // console.log(request);
        }
        return request;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest._isRefresh
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
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message:
          error.message || error.response.statusText || "Server Internal Error",
        status: error.response.status,
      };
    } else if (error.request) {
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
    request?: AxiosRequestConfig
  ): Promise<Res> {
    const response = await this.instance.post<Res>(url, data, request);
    return response.data;
  }

  // PUT request
  async put<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig
  ): Promise<Res> {
    const response = await this.instance.put<Res>(url, data, request);
    return response.data;
  }

  // PATCH request
  async patch<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig
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
