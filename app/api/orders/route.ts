import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return Response.json({ orders: data });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customer_name, items, total } = await request.json();
    
    const { data, error } = await supabase
      .from('orders')
      .insert({ customer_name, items, total })
      .select();
      
    if (error) throw error;
    return Response.json({ success: true, order: data[0] });
  } catch (error) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}