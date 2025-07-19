import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, date, durationMin, sourceTestId, selectedQuestionIds } = body;

    if (!name || !date || !durationMin || !sourceTestId || !Array.isArray(selectedQuestionIds)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sourceTest = await db.test.findUnique({
      where: { id: sourceTestId },
    });

    if (!sourceTest) {
      return NextResponse.json({ error: 'Invalid source test (quiz)' }, { status: 404 });
    }

    // Create a new test entry (can optionally link back to quiz)
    const newTest = await db.test.create({
      data: {
        name,
        date: new Date(date),
        durationMin,
        positionId: sourceTest.positionId, // Copy position from quiz
      },
    });

    // Attach selected questions via TestQuestion[]
    await db.testQuestion.createMany({
      data: selectedQuestionIds.map((questionId, index) => ({
        testId: newTest.id,
        questionId,
        order: index, // optional order
      })),
    });

    return NextResponse.json({ message: 'Test created', test: newTest }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_TEST_FROM_QUIZ_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
