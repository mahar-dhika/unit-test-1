import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import LoginPage from "../src/app/login/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockToast = toast as jest.Mocked<typeof toast>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.loading.mockReturnValue("toast-id");
  });

  it("should render the login form with all elements", () => {
    render(<LoginPage />);
    
    expect(screen.getByRole("heading", { name: /login/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(document.getElementById("password")).toBeDefined();
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /show password/i })).toBeDefined();
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);
    
    expect(screen.getByText("Email is required.")).toBeDefined();
    expect(screen.getByText("Password must be at least 6 characters.")).toBeDefined();
  });

  it("should show validation error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "123");
    await user.click(submitButton);
    
    expect(screen.getByText("Password must be at least 6 characters.")).toBeDefined();
    expect(screen.queryByText("Email is required.")).toBeNull();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    expect(passwordInput.type).toBe("password");
    
    await user.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeDefined();
    
    await user.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should submit form with valid data and handle successful login", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Login successful!" }),
    } as Response);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);
    
    expect(mockToast.loading).toHaveBeenCalledWith("Logging in...");
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Login successful!", { id: "toast-id" });
    });
  });

  it("should handle login failure", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials." }),
    } as Response);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);
    
    expect(mockToast.loading).toHaveBeenCalledWith("Logging in...");
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Invalid credentials.", { id: "toast-id" });
    });
  });

  it("should handle network error with fallback message", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // No message in response
    } as Response);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("An error occurred.", { id: "toast-id" });
    });
  });

  it("should not submit if validation fails", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    render(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);
    
    // Should show validation errors
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
    
    // Should not call fetch
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockToast.loading).not.toHaveBeenCalled();
  });
});
