import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, date, durationMin, positionId } = body;

    if (!name || !date || !durationMin || !positionId) {
      return NextResponse.json(
        { error: 'All fields (name, date, durationMin, positionId) are required' },
        { status: 400 }
      );
    }

    // Checking if position exists
    const position = await db.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return NextResponse.json({ error: 'Invalid position ID' }, { status: 404 });
    }

    const newQuiz = await db.test.create({
      data: {
        name,
        date: new Date(date),
        durationMin,
        positionId,
      },
    });

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: newQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_QUIZ_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
