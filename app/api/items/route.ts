import { kv } from '@/lib/db';

export async function GET() {
  try {
    const items = await kv.get<any[]>('items') || [];
    console.log('API GET items:', items);
    return Response.json({ products: items });
  } catch (error) {
    console.log('API GET error:', error);
    return Response.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const items = await kv.get<any[]>('items') || [];
    
    const maxId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) : 0;
    
    const item = {
      ...newItem,
      id: maxId + 1,
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
    const idToDelete = searchParams.get('id');
    
    if (!idToDelete) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }
    
    const items = await kv.get<any[]>('items') || [];
    const targetId = parseInt(idToDelete);
    const itemExists = items.some(item => item.id === targetId);
    
    if (!itemExists) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const filteredItems = items.filter(item => item.id !== targetId);
    await kv.set('items', filteredItems);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}