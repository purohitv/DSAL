import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { title, code, language } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const snippet = await prisma.snippet.create({
      data: {
        userId: user.id,
        title,
        code,
        language,
      },
    });

    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error saving snippet:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const snippets = await prisma.snippet.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
