import { sql } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    const { rows } = await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    
    return Response.json({ success: true, order: rows[0] });
  } catch (error) {
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}