/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
    ok: true,
  })
) as jest.Mock;

describe("ProfilePage", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe("Basic Form Elements", () => {

  it("renders all form fields", () => {
    render(<ProfilePage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty/invalid fields", async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Must be a valid email format/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Phone must be 10-15 digits/i)).toBeInTheDocument();
  });

  it("submits valid form and shows success message", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  describe("Birth Date Validation", () => {
    it("should show error when birth date is in the future", async () => {
      render(<ProfilePage />);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      // Fill out valid data except for birth date
      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: futureDateString },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      expect(
        await screen.findByText(/Birth date cannot be in the future/i)
      ).toBeInTheDocument();
    });

    it("should display birth date error message when visible", async () => {
      render(<ProfilePage />);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: futureDateString },
      });
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      // Check that the error message is displayed
      const errorMessage = await screen.findByText(/Birth date cannot be in the future/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass("mt-2", "text-sm", "text-red-600");
    });

    it("should accept valid past birth date", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<ProfilePage />);

      const pastDate = "1990-01-01";

      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: pastDate },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "/api/profile",
          expect.objectContaining({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });
  });

  describe("Bio Validation", () => {
    it("should show error when bio exceeds 160 characters", async () => {
      render(<ProfilePage />);

      const longBio = "a".repeat(161); // 161 characters

      // Fill out valid data except for bio
      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Bio/i), {
        target: { value: longBio },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      expect(
        await screen.findByText(/Bio must be 160 characters or less/i)
      ).toBeInTheDocument();
    });

    it("should display bio error message when visible", async () => {
      render(<ProfilePage />);

      const longBio = "a".repeat(161);

      fireEvent.change(screen.getByLabelText(/Bio/i), {
        target: { value: longBio },
      });
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      const errorMessage = await screen.findByText(/Bio must be 160 characters or less/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass("mt-2", "text-sm", "text-red-600");
    });

    it("should accept bio with exactly 160 characters", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<ProfilePage />);

      const exactBio = "a".repeat(160);

      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Bio/i), {
        target: { value: exactBio },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it("should accept empty bio", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<ProfilePage />);

      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Bio/i), {
        target: { value: "" },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe("API Error Handling", () => {
    it("should handle API error response", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Server error occurred" }),
      });

      render(<ProfilePage />);

      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      // Should handle the error gracefully
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it("should handle API error response without message", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<ProfilePage />);

      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: "validuser" },
      });
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: "1234567890" },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Combined Validation Scenarios", () => {
    it("should show multiple validation errors at once", async () => {
      render(<ProfilePage />);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      const longBio = "a".repeat(161);

      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: futureDateString },
      });
      fireEvent.change(screen.getByLabelText(/Bio/i), {
        target: { value: longBio },
      });
      
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      expect(
        await screen.findByText(/Birth date cannot be in the future/i)
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Bio must be 160 characters or less/i)
      ).toBeInTheDocument();
    });

    it("should clear errors when valid data is entered", async () => {
      render(<ProfilePage />);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      // First trigger errors
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: futureDateString },
      });
      fireEvent.click(screen.getByRole("button", { name: /Update/i }));

      expect(
        await screen.findByText(/Birth date cannot be in the future/i)
      ).toBeInTheDocument();

      // Then fix the error
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: "1990-01-01" },
      });

      // Error should be cleared
      expect(
        screen.queryByText(/Birth date cannot be in the future/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update input values when user types", async () => {
      render(<ProfilePage />);

      const usernameInput = screen.getByLabelText(/Username/i) as HTMLInputElement;
      const fullNameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(fullNameInput, { target: { value: "Test User" } });

      expect(usernameInput.value).toBe("testuser");
      expect(fullNameInput.value).toBe("Test User");
    });

    it("should respect textarea maxLength attribute", () => {
      render(<ProfilePage />);

      const bioTextarea = screen.getByLabelText(/Bio/i) as HTMLTextAreaElement;
      expect(bioTextarea.maxLength).toBe(160);
    });
  });
  });
});
