import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderParam = searchParams.get("folder");

    const folder =
      typeof folderParam === "string"
        ? decodeURIComponent(folderParam)
        : "charlink";

    const response = await fetch("https://api.charisprod.xyz/v1/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CHARIS_TOKEN!}`,
      },
      body: JSON.stringify({
        action: "gallery",
        charis_secret: process.env.CHARIS_SECRET!,
        cloudinaryKey: process.env.CLOUDINARY_API_KEY!,
        cloudinarySecret: process.env.CLOUDINARY_API_SECRET!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
      }),
    });

    if (!response.ok) {
      throw new Error("Gallery service error");
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("User gallery API error:", err);
    return NextResponse.json(
      { error: "Failed to load gallery" },
      { status: 500 }
    );
  }
}