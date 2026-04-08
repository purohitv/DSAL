import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email as string } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { moduleId, title, content, videoUrl, order, lessonId } = body;

    if (!moduleId || !title || !content || order === undefined || !lessonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLecture = await prisma.lecture.create({
      data: {
        moduleId,
        title,
        content,
        videoUrl: videoUrl || null,
        order: parseInt(order),
        lessonId,
      },
    });

    return NextResponse.json(newLecture);
  } catch (error) {
    console.error("Error creating lecture:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
