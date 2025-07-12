/**
 * @jest-environment node
 */
import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";

describe("POST /api/login", () => {
  it("should return 400 if email is missing", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Email and password are required.");
  });

  it("should return 400 if password is missing", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "testing@gmail.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Email and password are required.");
  });

  it("should return 400 if password is shorter than 6 characters", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "12345" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Password must be at least 6 characters.");
  });

  it("should return 200 for successful login with valid credentials", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Login successful!");
  });

  it("should return 401 for invalid email with correct password", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "wrong@example.com", password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid credentials.");
  });

  it("should return 401 for correct email with invalid password", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid credentials.");
  });
});
