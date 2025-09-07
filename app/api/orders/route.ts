import { sql } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM orders 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    return Response.json({ orders: rows });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customer_name, items, total } = await request.json();
    
    const { rows } = await sql`
      INSERT INTO orders (customer_name, items, total)
      VALUES (${customer_name}, ${JSON.stringify(items)}, ${total})
      RETURNING *
    `;
    
    return Response.json({ success: true, order: rows[0] });
  } catch (error) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}