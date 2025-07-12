import { NextResponse } from "next/server";

type PasswordUpdateData = {
  currentPassword: string;
  newPassword: string;
};

export async function POST(request: Request) {
  const { currentPassword, newPassword }: PasswordUpdateData = await request.json();

  // Validation
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Current password and new password are required." },
      { status: 400 }
    );
  }

  if (currentPassword.length < 6) {
    return NextResponse.json(
      { message: "Current password must be at least 6 characters." },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { message: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  if (newPassword.length > 128) {
    return NextResponse.json(
      { message: "New password must be at most 128 characters." },
      { status: 400 }
    );
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return NextResponse.json(
      { message: "New password must contain at least one uppercase letter, one lowercase letter, and one number." },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { message: "New password must be different from current password." },
      { status: 400 }
    );
  }

  // Mock authentication check - in real app, verify currentPassword against database
  if (currentPassword !== "password123") {
    return NextResponse.json(
      { message: "Current password is incorrect." },
      { status: 401 }
    );
  }

  // In a real application, you would update the password in the database
  console.log("Updating password for user");

  return NextResponse.json({ 
    message: "Password updated successfully!",
    success: true 
  });
}
