import { PUT } from "@/app/api/profile/route";
import { NextResponse } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      ...data,
      json: () => Promise.resolve(data),
    })),
  },
}));

const getValidProfileData = () => ({
  username: "validuser",
  fullName: "Valid User",
  email: "valid@email.com",
  phone: "1234567890",
  birthDate: "1990-01-01",
  bio: "Valid bio content",
});

describe("API /api/profile", () => {
  beforeEach(() => {
    (NextResponse.json as jest.Mock).mockClear();
  });

  it("should return 400 if username is too short", async () => {
    const invalidData = { ...getValidProfileData(), username: "short" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { username: "Username must be at least 6 characters." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if fullName is missing", async () => {
    const invalidData = { ...getValidProfileData(), fullName: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { fullName: "Full name is required." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email format is invalid", async () => {
    const invalidData = { ...getValidProfileData(), email: "invalid-email" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if bio is too short", async () => {
    const invalidData = { ...getValidProfileData(), bio: "Short" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { bio: "Bio must be at least 10 characters." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if bio is too long", async () => {
    const invalidData = {
      ...getValidProfileData(),
      bio: "A".repeat(161), // Changed from 256 to 161 to match actual API validation
    };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { bio: "Bio must be 160 characters or less." }, // Updated to match actual API message
      },
      { status: 400 }
    );
  });

  it("should return 200 on valid data", async () => {
    const validData = getValidProfileData();
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 400 if bio is longer than 160 characters", async () => {
    const longBio = "a".repeat(161); // 161 characters
    const invalidData = { ...getValidProfileData(), bio: longBio };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { bio: "Bio must be 160 characters or less." },
      },
      { status: 400 }
    );
  });

  it("should return 200 if bio is exactly 160 characters", async () => {
    const exactBio = "a".repeat(160); // Exactly 160 characters
    const validData = { ...getValidProfileData(), bio: exactBio };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 200 if bio is empty", async () => {
    const validData = { ...getValidProfileData(), bio: "" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 200 if bio is not provided", async () => {
    const validDataWithoutBio = {
      username: "validuser",
      fullName: "Valid User",
      email: "valid@email.com",
      phone: "1234567890",
      birthDate: "1990-01-01",
    };
    const req = {
      json: () => Promise.resolve(validDataWithoutBio),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });
});
