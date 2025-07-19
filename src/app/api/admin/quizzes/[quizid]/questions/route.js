import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { quizId } = params;

  try {
    const groups = await db.group.findMany({
      where: { quizId },
      include: { questions: true },
    });

    const questions = groups.flatMap((g) => g.questions);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
