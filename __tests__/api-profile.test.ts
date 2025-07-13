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

  describe("Basic Field Validation", () => {

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

  describe("Bio Validation Edge Cases", () => {
    it("should accept bio with minimum valid length (10 characters)", async () => {
      const validData = { ...getValidProfileData(), bio: "1234567890" }; // Exactly 10 chars
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should return 400 if bio is too short (less than 10 characters when not empty)", async () => {
      const invalidData = { ...getValidProfileData(), bio: "short" }; // 5 chars
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

    it("should accept undefined bio", async () => {
      const validData = { ...getValidProfileData() };
      // Remove bio property to make it undefined
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bio, ...dataWithoutBio } = validData;
      const req = {
        json: () => Promise.resolve(dataWithoutBio),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should accept null bio", async () => {
      const validData = { ...getValidProfileData(), bio: null };
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });
  });

  describe("Birth Date Validation Edge Cases", () => {
    it("should accept valid past birth date", async () => {
      const validData = { ...getValidProfileData(), birthDate: "1990-01-01" };
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should return 400 if birth date is in the future", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const invalidData = { ...getValidProfileData(), birthDate: futureDateString };
      const req = {
        json: () => Promise.resolve(invalidData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: "Validation failed",
          errors: { birthDate: "Birth date cannot be in the future." },
        },
        { status: 400 }
      );
    });

    it("should accept today's date as birth date", async () => {
      const today = new Date().toISOString().split('T')[0];
      const validData = { ...getValidProfileData(), birthDate: today };
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should accept empty birth date", async () => {
      const validData = { ...getValidProfileData(), birthDate: "" };
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });
  });

  describe("Combined Validation Scenarios", () => {
    it("should return multiple validation errors when multiple fields are invalid", async () => {
      const invalidData = {
        username: "short", // Too short
        fullName: "", // Empty
        email: "invalid-email", // Invalid format
        phone: "123", // Too short
        birthDate: "2050-01-01", // Future date
        bio: "short", // Too short
      };
      const req = {
        json: () => Promise.resolve(invalidData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.objectContaining({
            username: expect.any(String),
            fullName: expect.any(String),
            email: expect.any(String),
            phone: expect.any(String),
            birthDate: expect.any(String),
            bio: expect.any(String),
          }),
        }),
        { status: 400 }
      );
    });

    it("should handle missing required fields", async () => {
      const invalidData = {};
      const req = {
        json: () => Promise.resolve(invalidData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.objectContaining({
            username: expect.any(String),
            fullName: expect.any(String),
            email: expect.any(String),
            phone: expect.any(String),
          }),
        }),
        { status: 400 }
      );
    });
  });

  describe("Successful Operations", () => {
    it("should handle valid input with minimum required fields", async () => {
      const minimalData = {
        username: "validuser",
        fullName: "Valid User",
        email: "valid@email.com",
        phone: "1234567890",
      };
      const req = {
        json: () => Promise.resolve(minimalData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });
  });

  describe("Edge Case Validations", () => {
    it("should handle username with exactly 6 characters", async () => {
      const validData = { ...getValidProfileData(), username: "user12" }; // Exactly 6 chars
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should handle phone with 10 digits (minimum)", async () => {
      const validData = { ...getValidProfileData(), phone: "1234567890" }; // 10 digits
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should handle phone with 15 digits (maximum)", async () => {
      const validData = { ...getValidProfileData(), phone: "123456789012345" }; // 15 digits
      const req = {
        json: () => Promise.resolve(validData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should reject phone with 16 digits (over maximum)", async () => {
      const invalidData = { ...getValidProfileData(), phone: "1234567890123456" }; // 16 digits
      const req = {
        json: () => Promise.resolve(invalidData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: "Validation failed",
          errors: { phone: "Phone must be 10-15 digits." },
        },
        { status: 400 }
      );
    });

    it("should reject phone with non-digits", async () => {
      const invalidData = { ...getValidProfileData(), phone: "123-456-7890" }; // Contains dashes
      const req = {
        json: () => Promise.resolve(invalidData),
      } as Request;
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: "Validation failed",
          errors: { phone: "Phone must be 10-15 digits." },
        },
        { status: 400 }
      );
    });
  });
  });
});
