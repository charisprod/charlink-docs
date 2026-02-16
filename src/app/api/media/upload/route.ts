import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import fetch from "node-fetch";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("action", "upload");
    cloudinaryFormData.append("file", buffer, {
      filename: file.name,
      contentType: file.type,
    });
    
    const alt = formData.get("alt") as string || "";
    const extra = formData.get("extra") as string;
    
    cloudinaryFormData.append("alt", alt);
    cloudinaryFormData.append("extra", extra);
    cloudinaryFormData.append("aspectRatio", "16/9");
    cloudinaryFormData.append("folder", "charlink");

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured" },
        { status: 500 }
      );
    }

    cloudinaryFormData.append("charis_secret", process.env.CHARIS_SECRET!);
    cloudinaryFormData.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME!);
    cloudinaryFormData.append("media-api-key", process.env.CLOUDINARY_API_KEY!);
    cloudinaryFormData.append("media-api-secret", process.env.CLOUDINARY_API_SECRET!);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://api.charisprod.xyz/v1/media", {
        method: "POST",
        body: cloudinaryFormData as any,
        headers: {
          ...cloudinaryFormData.getHeaders(),
          "Authorization": `Bearer ${process.env.CHARIS_TOKEN!}`
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary error response:", errorText);
        throw new Error(
          `Cloudinary error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    } catch (fetchError) {
      clearTimeout(timeout);
      throw fetchError;
    }
  } catch (error) {
    console.error("Upload handler error:", error);
    
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}