/**
 * @jest-environment jsdom
 */
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

describe("UpdatePasswordForm - Comprehensive Tests", () => {
  // Helper function to get elements by ID to avoid ambiguity
  const getElementByTestId = (container: HTMLElement, testId: string) => 
    container.querySelector(`#${testId}`) as HTMLInputElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.loading.mockReturnValue("toast-id");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Form Rendering", () => {
    it("should render the password update form with all elements", () => {
      const { container } = render(<UpdatePasswordForm />);
      
      expect(screen.getByRole("heading", { name: /update password/i })).toBeInTheDocument();
      expect(getElementByTestId(container, "currentPassword")).toBeInTheDocument();
      expect(getElementByTestId(container, "newPassword")).toBeInTheDocument();
      expect(getElementByTestId(container, "confirmPassword")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
      
      // Check for password visibility toggle buttons
      const toggleButtons = screen.getAllByRole("button");
      const visibilityToggles = toggleButtons.filter((button: HTMLElement) => 
        button.getAttribute("aria-label")?.includes("password")
      );
      expect(visibilityToggles).toHaveLength(3);
    });

    it("should render form with proper labels and input types", () => {
      const { container } = render(<UpdatePasswordForm />);
      
      // Check labels exist by using the htmlFor attribute match
      expect(container.querySelector('label[for="currentPassword"]')).toBeInTheDocument();
      expect(container.querySelector('label[for="newPassword"]')).toBeInTheDocument();
      expect(container.querySelector('label[for="confirmPassword"]')).toBeInTheDocument();
      
      // All password inputs should initially be type="password"
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
      
      expect(currentPasswordInput.type).toBe("password");
      expect(newPasswordInput.type).toBe("password");
      expect(confirmPasswordInput.type).toBe("password");
    });
  });

  describe("Basic Validation", () => {
    it("should show validation errors for empty fields", async () => {
      const user = userEvent.setup();
      render(<UpdatePasswordForm />);
      
      const submitButton = screen.getByRole("button", { name: /update password/i });
      await user.click(submitButton);
      
      expect(screen.getByText("Current password is required.")).toBeInTheDocument();
      expect(screen.getByText("New password is required.")).toBeInTheDocument();
      expect(screen.getByText("Password confirmation is required.")).toBeInTheDocument();
    });

    it("should show validation error for short current password", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      await user.type(currentPasswordInput, "123");
      await user.click(submitButton);
      
      expect(screen.getByText("Current password must be at least 6 characters.")).toBeInTheDocument();
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
      
      expect(screen.getByText("New password must be at least 6 characters.")).toBeInTheDocument();
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
      
      expect(screen.getByText("Current password must be at least 6 characters.")).toBeInTheDocument();
      expect(screen.getByText("New password is required.")).toBeInTheDocument();
      
      // Now fix the errors
      await user.clear(currentPasswordInput);
      await user.type(currentPasswordInput, "password123");
      await user.type(newPasswordInput, "NewPassword123");
      await user.click(submitButton);
      
      // Errors should be cleared
      expect(screen.queryByText("Current password must be at least 6 characters.")).toBeNull();
      expect(screen.queryByText("New password is required.")).toBeNull();
    });
  });

  describe("Password Complexity Validation", () => {
    it("should show validation error for new password that doesn't meet complexity requirements", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      await user.type(currentPasswordInput, "password123");
      await user.type(newPasswordInput, "password"); // Missing uppercase and number
      await user.click(submitButton);
      
      expect(screen.getByText("New password must contain at least one uppercase letter, one lowercase letter, and one number.")).toBeInTheDocument();
    });

    it("should reject password without uppercase letter", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "currentpass123");
      await user.type(getElementByTestId(container, "newPassword"), "newpass123"); // No uppercase
      await user.type(getElementByTestId(container, "confirmPassword"), "newpass123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      expect(
        await screen.findByText(/New password must contain at least one uppercase letter, one lowercase letter, and one number/i)
      ).toBeInTheDocument();
    });

    it("should reject password without lowercase letter", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "CURRENTPASS123");
      await user.type(getElementByTestId(container, "newPassword"), "NEWPASS123"); // No lowercase
      await user.type(getElementByTestId(container, "confirmPassword"), "NEWPASS123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      expect(
        await screen.findByText(/New password must contain at least one uppercase letter, one lowercase letter, and one number/i)
      ).toBeInTheDocument();
    });

    it("should reject password without digits", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "Currentpass");
      await user.type(getElementByTestId(container, "newPassword"), "Newpassword"); // No digits
      await user.type(getElementByTestId(container, "confirmPassword"), "Newpassword");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      expect(
        await screen.findByText(/New password must contain at least one uppercase letter, one lowercase letter, and one number/i)
      ).toBeInTheDocument();
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
      
      expect(screen.getByText("New password must be at most 128 characters.")).toBeInTheDocument();
    });

    it("should accept password with exactly 128 characters", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { container } = render(<UpdatePasswordForm />);

      const maxPassword = "A" + "a".repeat(125) + "12"; // Exactly 128 characters
      
      await user.type(getElementByTestId(container, "currentPassword"), "currentPass123");
      await user.type(getElementByTestId(container, "newPassword"), maxPassword);
      await user.type(getElementByTestId(container, "confirmPassword"), maxPassword);

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: "currentPass123",
            newPassword: maxPassword,
          }),
        });
      });
    });

    it("should accept new password with minimum complexity requirements", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "currentPass123");
      await user.type(getElementByTestId(container, "newPassword"), "NewPass123"); // Meets all requirements
      await user.type(getElementByTestId(container, "confirmPassword"), "NewPass123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: "currentPass123",
            newPassword: "NewPass123",
          }),
        });
      });
    });
  });

  describe("Password Matching Validation", () => {
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
      
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
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
      
      expect(screen.getByText("New password must be different from current password.")).toBeInTheDocument();
    });
  });

  describe("Current Password Validation", () => {
    it("should reject empty current password", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "newPassword"), "NewPass123");
      await user.type(getElementByTestId(container, "confirmPassword"), "NewPass123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      expect(
        await screen.findByText(/Current password is required/i)
      ).toBeInTheDocument();
    });

    it("should reject current password shorter than 6 characters", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "12345");
      await user.type(getElementByTestId(container, "newPassword"), "NewPass123");
      await user.type(getElementByTestId(container, "confirmPassword"), "NewPass123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      expect(
        await screen.findByText(/Current password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });

    it("should accept current password with exactly 6 characters", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { container } = render(<UpdatePasswordForm />);

      await user.type(getElementByTestId(container, "currentPassword"), "123456");
      await user.type(getElementByTestId(container, "newPassword"), "NewPass123");
      await user.type(getElementByTestId(container, "confirmPassword"), "NewPass123");

      await user.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: "123456",
            newPassword: "NewPass123",
          }),
        });
      });
    });
  });

  describe("Password Visibility Toggle", () => {
    it("should toggle current password visibility", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const toggleButton = screen.getByRole("button", { name: /show current password/i });
      
      expect(currentPasswordInput.type).toBe("password");
      
      await user.click(toggleButton);
      expect(currentPasswordInput.type).toBe("text");
      expect(screen.getByRole("button", { name: /hide current password/i })).toBeInTheDocument();
      
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
      expect(screen.getByRole("button", { name: /hide new password/i })).toBeInTheDocument();
      
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
      expect(screen.getByRole("button", { name: /hide confirm password/i })).toBeInTheDocument();
      
      const hideButton = screen.getByRole("button", { name: /hide confirm password/i });
      await user.click(hideButton);
      expect(confirmPasswordInput.type).toBe("password");
    });

    it("should maintain all three password visibility states independently", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
      
      // Show all passwords
      await user.click(screen.getByRole("button", { name: /show current password/i }));
      await user.click(screen.getByRole("button", { name: /show new password/i }));
      await user.click(screen.getByRole("button", { name: /show confirm password/i }));
      
      expect(currentPasswordInput.type).toBe("text");
      expect(newPasswordInput.type).toBe("text");
      expect(confirmPasswordInput.type).toBe("text");
      
      // Hide only current password
      await user.click(screen.getByRole("button", { name: /hide current password/i }));
      
      expect(currentPasswordInput.type).toBe("password");
      expect(newPasswordInput.type).toBe("text");
      expect(confirmPasswordInput.type).toBe("text");
    });
  });

  describe("Form Submission and API Integration", () => {
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
        json: async () => ({}),
      } as Response);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      await user.type(currentPasswordInput, "wrongpassword");
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
      expect(screen.getByText("Current password is required.")).toBeInTheDocument();
      expect(screen.getByText("New password is required.")).toBeInTheDocument();
      expect(screen.getByText("Password confirmation is required.")).toBeInTheDocument();
      
      // Should not call fetch
      expect(mockFetch).not.toHaveBeenCalled();
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
  });

  describe("Combined Validation Scenarios", () => {
    it("should show multiple validation errors simultaneously", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      await user.type(currentPasswordInput, "123"); // Too short
      await user.type(newPasswordInput, "abc"); // Too short and missing complexity
      await user.click(submitButton);
      
      expect(screen.getByText("Current password must be at least 6 characters.")).toBeInTheDocument();
      expect(screen.getByText("New password must be at least 6 characters.")).toBeInTheDocument();
      expect(screen.getByText("Password confirmation is required.")).toBeInTheDocument();
    });

    it("should handle form validation with mixed valid and invalid fields", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      await user.type(currentPasswordInput, "ValidPassword123"); // Valid
      await user.type(newPasswordInput, "short"); // Invalid - too short and no complexity
      await user.type(confirmPasswordInput, "ValidNewPass123"); // Valid but doesn't match
      await user.click(submitButton);
      
      expect(screen.getByText("New password must be at least 6 characters.")).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      expect(screen.queryByText("Current password must be at least 6 characters.")).toBeNull();
    });

    it("should maintain form state during validation", async () => {
      const user = userEvent.setup();
      const { container } = render(<UpdatePasswordForm />);
      
      const currentPasswordInput = getElementByTestId(container, "currentPassword");
      const newPasswordInput = getElementByTestId(container, "newPassword");
      const confirmPasswordInput = getElementByTestId(container, "confirmPassword");
      const submitButton = screen.getByRole("button", { name: /update password/i });
      
      // Enter some values
      await user.type(currentPasswordInput, "CurrentPass123");
      await user.type(newPasswordInput, "short");
      await user.type(confirmPasswordInput, "different");
      
      // Submit to trigger validation
      await user.click(submitButton);
      
      // Values should be maintained
      expect(currentPasswordInput.value).toBe("CurrentPass123");
      expect(newPasswordInput.value).toBe("short");
      expect(confirmPasswordInput.value).toBe("different");
      
      // Validation errors should show
      expect(screen.getByText("New password must be at least 6 characters.")).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
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
      await user.type(currentPasswordInput, "123");
      await user.click(submitButton);
      
      expect(screen.getByText("Current password must be at least 6 characters.")).toBeInTheDocument();
      
      // Now fix and submit successfully
      await user.clear(currentPasswordInput);
      await user.type(currentPasswordInput, "ValidPass123");
      await user.type(newPasswordInput, "NewValidPass123");
      await user.type(confirmPasswordInput, "NewValidPass123");
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith("Password updated successfully!", { id: "toast-id" });
      });
      
      // All validation errors should be cleared
      expect(screen.queryByText("Current password must be at least 6 characters.")).toBeNull();
      expect(screen.queryByText("New password is required.")).toBeNull();
      expect(screen.queryByText("Password confirmation is required.")).toBeNull();
    });
  });
});
