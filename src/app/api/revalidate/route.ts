import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await req.json();
  
  const operation = body?.operation;
  const document = body?.document;
  const previousDocument = body?.previousDocument;
  
  const targetDocument = operation === 'delete' ? previousDocument : document;
  
  const type = targetDocument?._type;
  const section = targetDocument?.section || type;
  const slug = targetDocument?.slug?.current ?? targetDocument?.slug;

  console.log(`Processing ${operation} operation for ${type}: ${slug}`);

  const types = ["charlink"];

  if (type && types.includes(type)) {
    revalidatePath(`/${section}`);

    if (slug) {
      revalidatePath(`/${section}/${slug}`);
    }
    
    revalidatePath("/api/navigation");
    
    revalidatePath("/");
  }

  return NextResponse.json({ 
    revalidated: true, 
    operation, 
    type, 
    slug,
    timestamp: new Date().toISOString()
  });
}