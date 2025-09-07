import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(100);
      // .from('orders')
      // .select('*')
      // .limit(1);
    
    console.log("COMPLETED_ORDERS_DATA")
    console.log(data)
    if (error) throw error;
    console.log('Fetched completed orders:');
    console.log(data);
    return Response.json({ orders: data });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch completed orders' }, { status: 500 });
  }
}