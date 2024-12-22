import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request): Promise<Response> {
  try {
    const data: { fridge: string; shelf: string; name: string } =
      await req.json();

    if (!data.fridge || !data.shelf || !data.name) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.package.create({
      data: {
        fridge: data.fridge,
        shelf: data.shelf,
        name: data.name.toLowerCase(),
      },
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
