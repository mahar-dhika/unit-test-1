/**
 * @jest-environment node
 */
import { POST } from "@/app/api/password/route";
import { NextRequest } from "next/server";

describe("POST /api/password", () => {
  it("should return 400 if current password is missing", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ newPassword: "NewPassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("Current password and new password are required.");
  });

  it("should return 400 if new password is missing", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("Current password and new password are required.");
  });

  it("should return 400 if current password is shorter than 6 characters", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "12345", newPassword: "NewPassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("Current password must be at least 6 characters.");
  });

  it("should return 400 if new password is shorter than 6 characters", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: "12345" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("New password must be at least 6 characters.");
  });

  it("should return 400 if new password is longer than 128 characters", async () => {
    const longPassword = "A".repeat(129);
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: longPassword }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("New password must be at most 128 characters.");
  });

  it("should return 400 if new password doesn't meet complexity requirements", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: "password" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("New password must contain at least one uppercase letter, one lowercase letter, and one number.");
  });

  it("should return 400 if new password is same as current password", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "Password123", newPassword: "Password123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.message).toBe("New password must be different from current password.");
  });

  it("should return 401 if current password is incorrect", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "WrongPassword123", newPassword: "NewPassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.message).toBe("Current password is incorrect.");
  });

  it("should return 200 for successful password update with valid credentials", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: "NewPassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully!");
    expect(data.success).toBe(true);
  });

  it("should accept new password with exactly 6 characters and complexity requirements", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: "Aa1bcd" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully!");
    expect(data.success).toBe(true);
  });

  it("should accept new password with exactly 128 characters", async () => {
    const maxLengthPassword = "A".repeat(125) + "1a"; // Exactly 128 characters
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: maxLengthPassword }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully!");
    expect(data.success).toBe(true);
  });

  it("should accept new password with minimum complexity requirements", async () => {
    const request = new NextRequest("http://localhost/api/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "password123", newPassword: "Password1" }),
      headers: { "Content-Type": "application/json" },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully!");
    expect(data.success).toBe(true);
  });
});
