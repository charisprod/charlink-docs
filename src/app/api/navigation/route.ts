import getNavigation from "@/app/utils/getNavigation";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  const navigation = await getNavigation();
  return NextResponse.json(navigation);
}
