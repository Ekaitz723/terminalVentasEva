// api/test-db/route.ts
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return Response.json({ success: true, time: result.rows[0] });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}