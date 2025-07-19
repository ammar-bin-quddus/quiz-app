import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

function generateRandomString(length = 10) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, testId } = body;

    if (!name || !email || !testId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    let user = await db.user.findUnique({ where: { email } });

    let password = null;

    if (!user) {
      // Generate and hash password
      password = generateRandomString();
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    }

    // Check for duplicate assignment
    const alreadyAssigned = await db.assignedTest.findFirst({
      where: {
        userId: user.id,
        testId,
      },
    });

    if (alreadyAssigned) {
      return NextResponse.json({ error: 'Test already assigned to this user' }, { status: 409 });
    }

    // Assign test
    const assignedTest = await db.assignedTest.create({
      data: {
        userId: user.id,
        testId,
        assignedAt: new Date(),
        credentialsSent: false,
      },
    });

    return NextResponse.json(
      {
        message: 'Test assigned successfully',
        assignedTest,
        credentials: password
          ? { email: user.email, password }
          : null, // Only return password if newly created
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ASSIGN_TEST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
