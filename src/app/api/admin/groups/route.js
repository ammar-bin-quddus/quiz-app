import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, testId } = body;

    if (!name || !testId) {
      return NextResponse.json({ error: 'Name and testId are required' }, { status: 400 });
    }

    // Check if test (quiz) exists
    const quiz = await db.test.findUnique({ where: { id: testId } });

    if (!quiz) {
      return NextResponse.json({ error: 'Invalid testId' }, { status: 404 });
    }

    const group = await db.group.create({
      data: {
        name,
        testId,
      },
    });

    return NextResponse.json({ message: 'Group created', group }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_GROUP_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
