import { supabase } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', params.id)
      .select();
      
    if (error) throw error;
    return Response.json({ success: true, order: data[0] });
  } catch (error) {
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}