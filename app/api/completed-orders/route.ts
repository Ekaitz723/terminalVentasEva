import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    return Response.json({ orders: data });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch completed orders' }, { status: 500 });
  }
}