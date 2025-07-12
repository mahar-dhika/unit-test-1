"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

type PasswordErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function UpdatePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});

  const validate = () => {
    const newErrors: PasswordErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    } else if (currentPassword.length < 6) {
      newErrors.currentPassword = "Current password must be at least 6 characters.";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters.";
    } else if (newPassword.length > 128) {
      newErrors.newPassword = "New password must be at most 128 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "New password must contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Password confirmation is required.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const toastId = toast.loading("Updating password...");

    try {
      const response = await fetch("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!", { id: toastId });
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      } else {
        toast.error(data.message || "An error occurred.", { id: toastId });
      }
    } catch {
      toast.error("Network error occurred.", { id: toastId });
    }
  };

  const PasswordVisibilityToggle = ({ 
    show, 
    onClick, 
    ariaLabel 
  }: { 
    show: boolean; 
    onClick: () => void; 
    ariaLabel: string;
  }) => (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 focus:outline-none"
      aria-label={ariaLabel}
    >
      {show ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
            clipRule="evenodd"
          />
          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Update Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-900"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <PasswordVisibilityToggle
                show={showCurrentPassword}
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                ariaLabel={showCurrentPassword ? "Hide current password" : "Show current password"}
              />
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-900"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <PasswordVisibilityToggle
                show={showNewPassword}
                onClick={() => setShowNewPassword((prev) => !prev)}
                ariaLabel={showNewPassword ? "Hide new password" : "Show new password"}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-900"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <PasswordVisibilityToggle
                show={showConfirmPassword}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                ariaLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
