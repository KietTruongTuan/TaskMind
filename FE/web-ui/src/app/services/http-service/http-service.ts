import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

interface ApiError {
  message: string;
  status?: number;
}

export class HttpService {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setUpInterceptor();
  }

  private setUpInterceptor() {
    this.instance.interceptors.request.use(
      (request) => {
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
      (response: AxiosResponse) => {
        if (process.env.NODE_ENV === "development") {
          // console.log(response);
        }
        const { data } = response;
        return data;
      },
      (error) => {
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
  async get<Res>(
    url: string,
    request?: AxiosRequestConfig
  ): Promise<AxiosResponse<Res>> {
    const response = await this.instance.get<Res>(url, request);
    return response;
  }

  // POST request
  async post<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig
  ): Promise<AxiosResponse<Res>> {
    const response = await this.instance.post<Res>(url, data, request);
    return response;
  }

  // PUT request
  async put<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig
  ): Promise<AxiosResponse<Res>> {
    const response = await this.instance.put<Res>(url, data, request);
    return response;
  }

  // PATCH request
  async patch<Res, Req>(
    url: string,
    data?: Req,
    request?: AxiosRequestConfig
  ): Promise<AxiosResponse<Res>> {
    const response = await this.instance.patch<Res>(url, data, request);
    return response;
  }

  // DELETE request
  async delete<Res>(url: string, request?: AxiosRequestConfig): Promise<AxiosResponse<Res>> {
    const response = await this.instance.delete<Res>(url, request);
    return response;
  }
}
