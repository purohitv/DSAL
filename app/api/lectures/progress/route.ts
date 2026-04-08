import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ completedLectureIds: [] });
    }

    const user = session.user as any;
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      select: {
        lectureId: true,
      },
    });

    return NextResponse.json({
      completedLectureIds: progress.map((p) => p.lectureId),
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { lectureId, completed } = await req.json();

    if (!lectureId) {
      return NextResponse.json({ error: "Missing lectureId" }, { status: 400 });
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId,
        },
      },
      update: {
        completed: completed ?? true,
      },
      create: {
        userId: user.id,
        lectureId: lectureId,
        completed: completed ?? true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
