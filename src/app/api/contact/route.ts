import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Store in database
    await db.insert(contactSubmissions).values({ name, email, message });

    // Send notification email via Resend
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL_TO) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Athion <noreply@athion.com>",
        to: process.env.CONTACT_EMAIL_TO,
        subject: `Contact form: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
