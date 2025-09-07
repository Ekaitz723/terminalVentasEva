import { kv } from '@/lib/db';

export async function GET() {
  try {
    const items = await kv.get<any[]>('items') || [];
    return Response.json({ products: items });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const items = await kv.get<any[]>('items') || [];
    
    const item = {
      ...newItem,
      id: items.length + 1,
      createdAt: new Date().toISOString()
    };
    
    items.push(item);
    await kv.set('items', items);
    
    return Response.json({ success: true, product: item });
  } catch (error) {
    return Response.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    const products = await kv.get('products') || [];
    const filteredProducts = products.filter(p => p.id !== productId);
    
    await kv.set('products', filteredProducts);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}