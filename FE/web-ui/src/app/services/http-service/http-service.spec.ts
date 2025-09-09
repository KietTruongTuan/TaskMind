import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { HttpService } from "./http-service";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createMockAxios(): jest.Mocked<AxiosInstance> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  } as unknown as jest.Mocked<AxiosInstance>;
}

const mockAxiosInstance = createMockAxios();
mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe("HttpService", () => {
  let httpService: HttpService;

  beforeEach(() => {
    jest.clearAllMocks();
    // make axios.create return our fake instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    httpService = new HttpService("https://api.example.com");
  });

  describe("GET", () => {
    it("should return data on success", async () => {
      const mockData = { id: 1, name: "John" };
      const mockResponse = { data: mockData } as AxiosResponse<typeof mockData>;

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await httpService.get<typeof mockData>("/users/1");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/users/1", undefined);
      expect(result.data).toEqual(mockData);
    });

    it("should handle error response", async () => {
      const error: Partial<AxiosError> = {
        response: {
          status: 404,
          statusText: "Not Found",
          data: {},
        } as AxiosResponse,
        message: "Request failed",
      };

      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(httpService.get("/bad-url")).rejects.toEqual({
        message: "Request failed",
        response: {
          data: {},
          status: 404,
          statusText: "Not Found",
        },
      });
    });
  });

  describe("POST", () => {
    it("should return success data", async () => {
      const input = { name: "Alice" };
      const output = { id: 1, name: "Alice" };
      const mockResponse = { data: output } as AxiosResponse<typeof output>;

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const res = await httpService.post<typeof output, typeof input>(
        "/users",
        input
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/users",
        input,
        undefined
      );
      expect(res.data).toEqual(output);
    });
  });
  describe("PATCH", () => {
    it("should return success data", async () => {
      const patchData = { name: "Alice Updated" };
      const output = { id: 1, name: "Alice Updated" };
      const mockResponse = { data: output } as AxiosResponse<typeof output>;

      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse);

      const res = await httpService.patch<typeof output, typeof patchData>(
        "/users/1",
        patchData
      );

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        "/users/1",
        patchData,
        undefined
      );
      expect(res.data).toEqual(output);
    });
  });

  describe("PUT", () => {
    it("should return success data", async () => {
      const updateData = { name: "Alice Updated" };
      const output = { id: 1, name: "Alice Updated" };
      const mockResponse = { data: output } as AxiosResponse<typeof output>;

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      const res = await httpService.put<typeof output, typeof updateData>(
        "/users/1",
        updateData
      );

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        "/users/1",
        updateData,
        undefined
      );
      expect(res.data).toEqual(output);
    });
  });

  describe("DELETE", () => {
    it("should return deleted item", async () => {
      const deleted = { success: true };
      const mockResponse = { data: deleted } as AxiosResponse<typeof deleted>;

      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

      const res = await httpService.delete<typeof deleted>("/users/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        "/users/1",
        undefined
      );
      expect(res.data).toEqual(deleted);
    });
  });
});
