import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      include: {
        lectures: {
          orderBy: {
            order: 'asc'
          },
          include: {
            quiz: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(modules);
  } catch (error: any) {
    console.error("Failed to fetch lectures:", error);
    return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 });
  }
}
