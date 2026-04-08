import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    console.log("Running prisma db push...");
    const { stdout: pushOut, stderr: pushErr } = await execAsync("npx prisma db push --accept-data-loss");
    console.log("Push output:", pushOut);
    if (pushErr) console.error("Push stderr:", pushErr);

    console.log("Running prisma db seed...");
    const { stdout: seedOut, stderr: seedErr } = await execAsync("node prisma/seed.js");
    console.log("Seed output:", seedOut);
    if (seedErr) console.error("Seed stderr:", seedErr);

    return NextResponse.json({ 
      success: true, 
      message: "Database setup completed successfully",
      pushOutput: pushOut,
      seedOutput: seedOut
    });
  } catch (error: any) {
    console.error("Database setup failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error occurred" 
    }, { status: 500 });
  }
}
