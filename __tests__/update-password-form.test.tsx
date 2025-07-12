import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import UpdatePasswordForm from "../src/app/password/page";

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

describe("UpdatePasswordForm", () => {
  // Helper function to get elements by ID to avoid ambiguity
  const getElementByTestId = (container: HTMLElement, testId: string) => 
    container.querySelector(`#${testId}`) as HTMLInputElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.loading.mockReturnValue("toast-id");
  });

  it("should render the password update form with all elements", () => {
    const { container } = render(<UpdatePasswordForm />);
    
    expect(screen.getByRole("heading", { name: /update password/i })).toBeDefined();
    expect(getElementByTestId(container, "currentPassword")).toBeDefined();
    expect(getElementByTestId(container, "newPassword")).toBeDefined();
    expect(getElementByTestId(container, "confirmPassword")).toBeDefined();
    expect(screen.getByRole("button", { name: /update password/i })).toBeDefined();
    
    // Check for password visibility toggle buttons
    const toggleButtons = screen.getAllByRole("button");
    const visibilityToggles = toggleButtons.filter((button: HTMLElement) => 
      button.getAttribute("aria-label")?.includes("password")
    );
    expect(visibilityToggles).toHaveLength(3);
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);
    
    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);
    
    expect(screen.getByText("Current password is required.")).toBeDefined();
    expect(screen.getByText("New password is required.")).toBeDefined();
    expect(screen.getByText("Password confirmation is required.")).toBeDefined();
  });

  it("should show validation error for short current password", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "123");
    await user.click(submitButton);
    
    expect(screen.getByText("Current password must be at least 6 characters.")).toBeDefined();
  });

  it("should show validation error for short new password", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "123");
    await user.click(submitButton);
    
    expect(screen.getByText("New password must be at least 6 characters.")).toBeDefined();
  });

  it("should show validation error for new password that doesn't meet complexity requirements", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "password"); // Missing uppercase and number
    await user.click(submitButton);
    
    expect(screen.getByText("New password must contain at least one uppercase letter, one lowercase letter, and one number.")).toBeDefined();
  });

  it("should show validation error for new password that is too long", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    const longPassword = "A".repeat(129) + "1a"; // 131 characters
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, longPassword);
    await user.click(submitButton);
    
    expect(screen.getByText("New password must be at most 128 characters.")).toBeDefined();
  });

  it("should show validation error when passwords don't match", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "DifferentPassword123");
    await user.click(submitButton);
    
    expect(screen.getByText("Passwords do not match.")).toBeDefined();
  });

  it("should show validation error when new password is same as current password", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);
    
    expect(screen.getByText("New password must be different from current password.")).toBeDefined();
  });

  it("should clear validation errors when user fixes input", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    // First, trigger validation errors
    await user.type(currentPasswordInput, "123");
    await user.click(submitButton);
    
    expect(screen.getByText("Current password must be at least 6 characters.")).toBeDefined();
    expect(screen.getByText("New password is required.")).toBeDefined();
    
    // Now fix the errors
    await user.clear(currentPasswordInput);
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    // Errors should be cleared
    expect(screen.queryByText("Current password must be at least 6 characters.")).toBeNull();
    expect(screen.queryByText("New password is required.")).toBeNull();
  });

  it("should toggle current password visibility", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const toggleButton = screen.getByRole("button", { name: /show current password/i });
    
    expect(currentPasswordInput.type).toBe("password");
    
    await user.click(toggleButton);
    expect(currentPasswordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide current password/i })).toBeDefined();
    
    const hideButton = screen.getByRole("button", { name: /hide current password/i });
    await user.click(hideButton);
    expect(currentPasswordInput.type).toBe("password");
  });

  it("should toggle new password visibility", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const toggleButton = screen.getByRole("button", { name: /show new password/i });
    
    expect(newPasswordInput.type).toBe("password");
    
    await user.click(toggleButton);
    expect(newPasswordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide new password/i })).toBeDefined();
    
    const hideButton = screen.getByRole("button", { name: /hide new password/i });
    await user.click(hideButton);
    expect(newPasswordInput.type).toBe("password");
  });

  it("should toggle confirm password visibility", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const toggleButton = screen.getByRole("button", { name: /show confirm password/i });
    
    expect(confirmPasswordInput.type).toBe("password");
    
    await user.click(toggleButton);
    expect(confirmPasswordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide confirm password/i })).toBeDefined();
    
    const hideButton = screen.getByRole("button", { name: /hide confirm password/i });
    await user.click(hideButton);
    expect(confirmPasswordInput.type).toBe("password");
  });

  it("should submit form with valid data and handle successful password update", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password updated successfully!", success: true }),
    } as Response);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    expect(mockToast.loading).toHaveBeenCalledWith("Updating password...");
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "password123",
          newPassword: "NewPassword123",
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Password updated successfully!", { id: "toast-id" });
    });
  });

  it("should handle password update failure with API error message", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Current password is incorrect." }),
    } as Response);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "wrongpassword");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    expect(mockToast.loading).toHaveBeenCalledWith("Updating password...");
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "wrongpassword",
          newPassword: "NewPassword123",
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Current password is incorrect.", { id: "toast-id" });
    });
  });

  it("should handle password update failure with fallback error message", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // No message in response
    } as Response);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("An error occurred.", { id: "toast-id" });
    });
  });

  it("should handle network error", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Network error occurred.", { id: "toast-id" });
    });
  });

  it("should not submit if validation fails", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    render(<UpdatePasswordForm />);
    
    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);
    
    // Should show validation errors
    expect(screen.getByText("Current password is required.")).toBeDefined();
    expect(screen.getByText("New password is required.")).toBeDefined();
    expect(screen.getByText("Password confirmation is required.")).toBeDefined();
    
    // Should not call fetch
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockToast.loading).not.toHaveBeenCalled();
  });

  it("should reset form after successful password update", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password updated successfully!", success: true }),
    } as Response);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Password updated successfully!", { id: "toast-id" });
    });
    
    // Form should be reset
    await waitFor(() => {
      expect(currentPasswordInput.value).toBe("");
      expect(newPasswordInput.value).toBe("");
      expect(confirmPasswordInput.value).toBe("");
    });
  });

  it("should accept new password with exactly 128 characters", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    const maxLengthPassword = "A".repeat(125) + "1a"; // Exactly 128 characters with complexity
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, maxLengthPassword);
    await user.type(confirmPasswordInput, maxLengthPassword);
    await user.click(submitButton);
    
    // Should not show length error
    expect(screen.queryByText("New password must be at most 128 characters.")).toBeNull();
    
    // Should call loading toast (indicating validation passed)
    expect(mockToast.loading).toHaveBeenCalledWith("Updating password...");
  });

  it("should accept new password with minimum complexity requirements", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    const complexPassword = "Aa1bcd"; // Minimum 6 chars with uppercase, lowercase, and number
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, complexPassword);
    await user.type(confirmPasswordInput, complexPassword);
    await user.click(submitButton);
    
    // Should not show complexity error
    expect(screen.queryByText("New password must contain at least one uppercase letter, one lowercase letter, and one number.")).toBeNull();
    
    // Should call loading toast (indicating validation passed)
    expect(mockToast.loading).toHaveBeenCalledWith("Updating password...");
  });

  // NEW MISSING TESTS to improve coverage

  it("should show and hide password visibility state correctly", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    
    // All should start as password type
    expect(currentPasswordInput.type).toBe("password");
    expect(newPasswordInput.type).toBe("password");
    expect(confirmPasswordInput.type).toBe("password");
    
    // Toggle each one
    await user.click(screen.getByRole("button", { name: /show current password/i }));
    await user.click(screen.getByRole("button", { name: /show new password/i }));
    await user.click(screen.getByRole("button", { name: /show confirm password/i }));
    
    // All should now be text type
    expect(currentPasswordInput.type).toBe("text");
    expect(newPasswordInput.type).toBe("text");
    expect(confirmPasswordInput.type).toBe("text");
  });

  it("should handle form validation with mixed valid and invalid fields", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    // Valid current password, invalid new password, valid confirm password
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "abc"); // Too short
    await user.type(confirmPasswordInput, "abc"); // Matches but also too short
    await user.click(submitButton);
    
    // Should show the new password error, not the confirm password error
    expect(screen.getByText("New password must be at least 6 characters.")).toBeDefined();
    expect(screen.queryByText("Passwords do not match.")).toBeNull();
  });

  it("should handle complex password validation edge cases", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    // Test password with only uppercase and numbers (missing lowercase)
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "PASSWORD123");
    await user.type(confirmPasswordInput, "PASSWORD123");
    await user.click(submitButton);
    
    expect(screen.getByText("New password must contain at least one uppercase letter, one lowercase letter, and one number.")).toBeDefined();
  });

  it("should maintain form state during validation", async () => {
    const user = userEvent.setup();
    const { container } = render(<UpdatePasswordForm />);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    // Fill form with invalid data
    await user.type(currentPasswordInput, "123");
    await user.type(newPasswordInput, "456");
    await user.type(confirmPasswordInput, "789");
    await user.click(submitButton);
    
    // Values should be maintained even after validation fails
    expect(currentPasswordInput.value).toBe("123");
    expect(newPasswordInput.value).toBe("456");
    expect(confirmPasswordInput.value).toBe("789");
    
    // Should show validation errors
    expect(screen.getByText("Current password must be at least 6 characters.")).toBeDefined();
    expect(screen.getByText("New password must be at least 6 characters.")).toBeDefined();
    expect(screen.getByText("Passwords do not match.")).toBeDefined();
  });

  it("should clear all validation errors after successful submission", async () => {
    const user = userEvent.setup();
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const { container } = render(<UpdatePasswordForm />);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password updated successfully!", success: true }),
    } as Response);
    
    const currentPasswordInput = getElementByTestId(container, "currentPassword");
    const newPasswordInput = getElementByTestId(container, "newPassword");
    const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
    const submitButton = screen.getByRole("button", { name: /update password/i });
    
    // First trigger validation errors
    await user.click(submitButton);
    expect(screen.getByText("Current password is required.")).toBeDefined();
    
    // Then submit valid form
    await user.type(currentPasswordInput, "password123");
    await user.type(newPasswordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Password updated successfully!", { id: "toast-id" });
    });
    
    // All errors should be cleared and form reset
    await waitFor(() => {
      expect(screen.queryByText("Current password is required.")).toBeNull();
      expect(currentPasswordInput.value).toBe("");
      expect(newPasswordInput.value).toBe("");
      expect(confirmPasswordInput.value).toBe("");
    });
  });
});
