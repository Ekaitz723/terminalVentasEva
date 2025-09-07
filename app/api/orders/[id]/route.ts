import { supabase } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { timestampz: string } }
) {
  try {
    const { status, timestampz } = await request.json();
    console.log('Updating order with timestampz:', timestampz, 'to status:', status);
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'completed', 
        updated_at: new Date().toISOString() 
      })
      .eq('created_at', timestampz)
      .select();
      
    if (error) throw error;
    console.log('Updated order:');
    console.log(data);
    return Response.json({ success: true, order: data[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}