import { MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA, knowledgeBaseService } from "@/app/constants";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KnowledgeBasePage from "./page";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

jest.mock("@/app/constants", () => {
  const actual = jest.requireActual("@/app/constants");
  return {
    ...actual,
    knowledgeBaseService: {
      ...actual.knowledgeBaseService,
      upload: jest.fn(),
    },
  };
});

describe("KnowledgeBasePage", () => {
  const mockGetFiles = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();

    (useServerSideService as jest.Mock).mockResolvedValue({
      knowledgeBaseService: {
        getFiles: mockGetFiles,
      },
    });
  });
  it("renders the page", async () => {
    mockGetFiles.mockResolvedValue(MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA);
    const page = await KnowledgeBasePage();
    render(<ToastProvider>{page}</ToastProvider>);
    expect(await screen.findByText("Knowledge Base")).toBeInTheDocument();
    expect(await screen.findByText("File1.pdf")).toBeInTheDocument();
    expect(await screen.findByText("File2.pdf")).toBeInTheDocument();
    expect(await screen.findByText("File3.pdf")).toBeInTheDocument();
    expect(await screen.findByText("File4.pdf")).toBeInTheDocument();
  });

  it("renders the page with empty data", async () => {
    mockGetFiles.mockResolvedValue([]);
    const page = await KnowledgeBasePage();
    render(<ToastProvider>{page}</ToastProvider>);
    expect(await screen.findByText("No documents uploaded yet")).toBeInTheDocument();
  });

  it("handles file upload successfully", async () => {
    mockGetFiles.mockResolvedValue([]);
    (knowledgeBaseService.upload as jest.Mock).mockResolvedValue({
      id: "5",
      name: "test-file.pdf",
    });

    const page = await KnowledgeBasePage();
    const { container } = render(<ToastProvider>{page}</ToastProvider>);

    const file = new File(["test content"], "test-file.pdf", {
      type: "application/pdf",
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(knowledgeBaseService.upload).toHaveBeenCalled();
    });

    expect(await screen.findByText("Your file is successfully uploaded")).toBeInTheDocument();
  });

  it("handles file upload failure", async () => {
    mockGetFiles.mockResolvedValue([]);
    const mockError = { message: "Upload failed" };
    (knowledgeBaseService.upload as jest.Mock).mockRejectedValue(mockError);

    const page = await KnowledgeBasePage();
    const { container } = render(<ToastProvider>{page}</ToastProvider>);

    const file = new File(["test content"], "test-file.pdf", {
      type: "application/pdf",
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(knowledgeBaseService.upload).toHaveBeenCalled();
    });

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });

  it("handles file drag and drop events", async () => {
    mockGetFiles.mockResolvedValue([]);
    const page = await KnowledgeBasePage();
    render(<ToastProvider>{page}</ToastProvider>);

    const dropZone = screen.getByTestId("file-drop-zone");

    fireEvent.dragOver(dropZone);

    fireEvent.dragLeave(dropZone);

    const file = new File(["test content"], "drop-file.pdf", {
      type: "application/pdf",
    });
    (knowledgeBaseService.upload as jest.Mock).mockResolvedValue({});

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(knowledgeBaseService.upload).toHaveBeenCalled();
    });
  });
});
