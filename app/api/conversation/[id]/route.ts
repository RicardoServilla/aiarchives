import { NextRequest, NextResponse } from 'next/server';
import { getConversationRecord } from '@/lib/db/conversations';
import { s3Client } from '@/lib/storage/s3';
import { dbClient } from '@/lib/db/client';
import { loadConfig } from '@/lib/config';

let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    try {
      const config = loadConfig();
      await dbClient.initialize(config.database);
      s3Client.initialize(config.s3);
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    await ensureInitialized();
    const id = (await params).id;
    const record = await getConversationRecord(id);
    const content = await s3Client.getConversationContent(record.contentKey);
    return NextResponse.json({ conversation: record, content });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error, see logs' }, { status: 500 });
  }
}
