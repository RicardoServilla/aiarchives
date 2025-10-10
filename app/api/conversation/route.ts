import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/lib/db/conversations';
import { dbClient } from '@/lib/db/client';
import { loadConfig } from '@/lib/config';

let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    try {
      const config = loadConfig();
      await dbClient.initialize(config.database);
      isInitialized = true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already initialized')) {
        isInitialized = true;
      } else {
        throw error;
      }
    }
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await ensureInitialized();
    const conversations = await getConversations(50);
    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error, see logs' }, { status: 500 });
  }
}
