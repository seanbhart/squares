import { NextResponse } from 'next/server';
import { getAllFigures } from '@/lib/api/figures';

export async function GET() {
  try {
    const data = await getAllFigures();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch figures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch figures' },
      { status: 500 }
    );
  }
}
