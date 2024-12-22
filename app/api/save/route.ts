import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type:', contentType);
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await req.text(); // Prozkoumáme syrové tělo
    console.log('Raw body received:', body);

    const data = JSON.parse(body);
    if (!data || typeof data !== 'object') {
      console.error('Invalid JSON body:', data);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { fridge, shelf, name } = data;
    if (!fridge || !shelf || !name) {
      console.error('Missing required fields:', data);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.package.create({
      data: { fridge, shelf, name },
    });

    return NextResponse.json(
      { message: 'Package saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
