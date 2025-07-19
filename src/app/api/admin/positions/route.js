import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const existing = await db.position.findFirst({
      where: { title },
    });

    if (existing) {
      return NextResponse.json({ error: 'Position already exists' }, { status: 409 });
    }

    const newPosition = await db.position.create({
      data: { title },
    });

    return NextResponse.json({ message: 'Position created successfully', position: newPosition }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_POSITION_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
