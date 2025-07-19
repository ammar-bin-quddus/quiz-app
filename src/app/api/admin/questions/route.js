import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, type, score, groupId, choices, correctIndexes } = body;

    if (!text || !type || score == null || !groupId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Validate group
    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Invalid groupId' }, { status: 404 });
    }

    // Handle MCQ
    let createdQuestion;
    if (type === 'MCQ') {
      if (!Array.isArray(choices) || choices.length < 2 || !Array.isArray(correctIndexes)) {
        return NextResponse.json({ error: 'MCQ must have choices and correctIndexes' }, { status: 400 });
      }

      createdQuestion = await db.question.create({
        data: {
          groupId,
          text,
          type,
          score,
          correctIndexes,
          choices: {
            create: choices.map((text) => ({ text })),
          },
        },
        include: { choices: true },
      });
    } else {
      // Open Text
      createdQuestion = await db.question.create({
        data: {
          groupId,
          text,
          type,
          score,
          correctIndexes: [], // Empty for TEXT
        },
      });
    }

    return NextResponse.json({ message: 'Question created', question: createdQuestion }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_QUESTION_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
