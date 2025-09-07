import { sql } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM orders 
      WHERE status = 'completed' 
      ORDER BY updated_at DESC
      LIMIT 100
    `;
    return Response.json({ orders: rows });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch completed orders' }, { status: 500 });
  }
}