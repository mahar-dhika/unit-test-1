/**
 * @jest-environment node
 */
import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";

describe("POST /api/login", () => {
  describe("Basic Validation", () => {
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

  describe("Input Validation Edge Cases", () => {
    it("should return 400 if both email and password are missing", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should return 400 if email is null", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: null, password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should return 400 if password is null", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: null }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should return 400 if email is empty string", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should return 400 if password is empty string", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should return 400 if email is only whitespace", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "   ", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should return 400 if password is only whitespace", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "   " }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });
  });

  describe("Password Length Validation", () => {
    it("should return 400 for password with exactly 5 characters", async () => {
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

    it("should accept password with exactly 6 characters", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "123456" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });

    it("should accept password longer than 6 characters", async () => {
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

    it("should handle password with special characters", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "p@ssw0rd!" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });

    it("should handle password with unicode characters", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "pässwörd" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });
  });

  describe("Email Format Handling", () => {
    it("should accept valid email formats", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@domain.com", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });

    it("should handle email with leading/trailing spaces by trimming", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "  test@example.com  ", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });
  });

  describe("Edge Cases and Malformed Requests", () => {
    it("should handle request with extra fields", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ 
          email: "test@example.com", 
          password: "password123",
          extraField: "ignored" 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });

    it("should handle boolean values for required fields", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: true, password: false }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should handle numeric values for required fields", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: 123, password: 456 }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should handle array values for required fields", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: ["test@example.com"], password: ["password123"] }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });

    it("should handle object values for required fields", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ 
          email: { value: "test@example.com" }, 
          password: { value: "password123" } 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Email and password are required.");
    });
  });

  describe("Password Edge Cases", () => {
    it("should count password length correctly with unicode characters", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "émojí" }), // 5 unicode chars
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Password must be at least 6 characters.");
    });

    it("should accept password with exactly 6 unicode characters", async () => {
      const request = new NextRequest("http://localhost/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "émojí6" }), // 6 unicode chars
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Login successful!");
    });
  });
  });
});
