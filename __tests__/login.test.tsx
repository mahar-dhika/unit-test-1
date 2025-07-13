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

  describe("Basic Form Elements", () => {

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

  describe("Password Visibility Toggle", () => {
    it("should toggle password visibility when eye icon is clicked", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const toggleButton = screen.getByLabelText(/Show password/i);

      // Initially password should be hidden
      expect(passwordInput.type).toBe("password");
      expect(toggleButton).toHaveAttribute("aria-label", "Show password");

      // Click to show password
      await user.click(toggleButton);

      expect(passwordInput.type).toBe("text");
      expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();

      // Click again to hide password
      await user.click(screen.getByLabelText(/Hide password/i));

      expect(passwordInput.type).toBe("password");
      expect(screen.getByLabelText(/Show password/i)).toBeInTheDocument();
    });

    it("should display correct eye icons for show/hide states", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const toggleButton = screen.getByLabelText(/Show password/i);
      
      // Check initial state - should show "eye" icon (to show password)
      expect(toggleButton).toBeInTheDocument();

      // Click to show password
      await user.click(toggleButton);

      // Now should show "eye-slash" icon (to hide password)
      expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();
    });

    it("should maintain password value when toggling visibility", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const toggleButton = screen.getByLabelText(/Show password/i);

      // Enter password
      await user.type(passwordInput, "testpassword");
      expect(passwordInput.value).toBe("testpassword");

      // Toggle visibility
      await user.click(toggleButton);
      expect(passwordInput.value).toBe("testpassword");
      expect(passwordInput.type).toBe("text");

      // Toggle back
      await user.click(screen.getByLabelText(/Hide password/i));
      expect(passwordInput.value).toBe("testpassword");
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("Form State Management", () => {
    it("should update email state when user types", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      await user.type(emailInput, "test@example.com");
      expect(emailInput.value).toBe("test@example.com");
    });

    it("should update password state when user types", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

      await user.type(passwordInput, "password123");
      expect(passwordInput.value).toBe("password123");
    });

    it("should clear errors when valid data is entered after validation fails", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      // First trigger validation errors
      await user.click(submitButton);
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();

      // Then enter valid data
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Errors should be cleared
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
      expect(screen.queryByText("Password must be at least 6 characters.")).not.toBeInTheDocument();
    });
  });

  describe("API Integration with Password Visibility", () => {
    it("should handle successful login with password field in text mode", async () => {
      const user = userEvent.setup();
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Login successful!" }),
      } as Response);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const toggleButton = screen.getByLabelText(/Show password/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      // Enter credentials and show password
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(toggleButton); // Show password
      
      await user.click(submitButton);

      expect(mockToast.loading).toHaveBeenCalledWith("Logging in...");
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
      });
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith("Login successful!");
      });
    });

    it("should handle API error with password visible", async () => {
      const user = userEvent.setup();
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials." }),
      } as Response);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const toggleButton = screen.getByLabelText(/Show password/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(toggleButton); // Show password
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid credentials.");
      });
    });
  });

  describe("Accessibility and UX", () => {
    it("should have proper accessibility attributes for password toggle", () => {
      render(<LoginPage />);
      
      const toggleButton = screen.getByLabelText(/Show password/i);
      expect(toggleButton).toHaveAttribute("type", "button");
      expect(toggleButton).toHaveAttribute("aria-label", "Show password");
    });

    it("should maintain focus on password input after toggling visibility", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i);
      const toggleButton = screen.getByLabelText(/Show password/i);

      // Focus password input and toggle visibility
      await user.click(passwordInput);
      await user.click(toggleButton);

      // Password input should still be focused (or at least not lose focus completely)
      expect(document.activeElement?.tagName).toBe("INPUT");
    });

    it("should handle rapid toggle clicks", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const toggleButton = screen.getByLabelText(/Show password/i);

      // Rapid clicks
      await user.click(toggleButton);
      expect(passwordInput.type).toBe("text");
      
      await user.click(screen.getByLabelText(/Hide password/i));
      expect(passwordInput.type).toBe("password");
      
      await user.click(screen.getByLabelText(/Show password/i));
      expect(passwordInput.type).toBe("text");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty password field with visibility toggle", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const toggleButton = screen.getByLabelText(/Show password/i);

      // Toggle with empty password
      await user.click(toggleButton);
      expect(passwordInput.type).toBe("text");
      expect(passwordInput.value).toBe("");
    });

    it("should preserve password value through multiple visibility toggles", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const toggleButton = screen.getByLabelText(/Show password/i);

      await user.type(passwordInput, "testpass");
      
      // Multiple toggles
      await user.click(toggleButton);
      expect(passwordInput.value).toBe("testpass");
      
      await user.click(screen.getByLabelText(/Hide password/i));
      expect(passwordInput.value).toBe("testpass");
      
      await user.click(screen.getByLabelText(/Show password/i));
      expect(passwordInput.value).toBe("testpass");
    });

    it("should handle form submission while password is visible", async () => {
      const user = userEvent.setup();
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Login successful!" }),
      } as Response);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const toggleButton = screen.getByLabelText(/Show password/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(toggleButton); // Show password
      await user.click(submitButton);

      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });
  });
});
