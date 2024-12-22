import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name')?.toLowerCase();

    if (!name) {
      return NextResponse.json(
        { error: 'Name query parameter is required' },
        { status: 400 }
      );
    }

    // Vyhledáváme pomocí LOWER v SQLite
    const results = await prisma.$queryRawUnsafe(
      `
            SELECT * FROM "Package"
            WHERE LOWER("name") LIKE '%' || $1 || '%'
        `,
      name
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error searching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
