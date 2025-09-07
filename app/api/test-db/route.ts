// api/test-db/route.ts
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    return Response.json({ success: true, connected: true });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}