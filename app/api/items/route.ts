import { kv } from '@/lib/db';

export async function GET() {
  try {
    const items = await kv.get<any[]>('items') || [];
    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const items = await kv.get<any[]>('items') || [];
    const nextId = await kv.get<number>('items_next_id') || 1;
    
    const item = {
      ...newItem,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    
    items.push(item);
    await kv.set('items', items);
    await kv.set('items_next_id', nextId + 1);
    
    return Response.json({ success: true, item });
  } catch (error) {
    return Response.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idToUpdate = searchParams.get('id');
    const updateData = await request.json();
    
    if (!idToUpdate) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }
    
    const items = await kv.get<any[]>('items') || [];
    const targetId = parseInt(idToUpdate);
    const itemIndex = items.findIndex(item => item.id === targetId);
    
    if (itemIndex === -1) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    
    items[itemIndex] = { ...items[itemIndex], ...updateData, updatedAt: new Date().toISOString() };
    await kv.set('items', items);
    
    return Response.json({ success: true, item: items[itemIndex] });
  } catch (error) {
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idToDelete = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!idToDelete) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }
    
    const items = await kv.get<any[]>('items') || [];
    const targetId = parseInt(idToDelete);
    const itemToDelete = items.find(item => item.id === targetId);
    
    if (!itemToDelete) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Soft delete - move to deleted_items
    if (action === 'delete') {
      const deletedItems = await kv.get<any[]>('deleted_items') || [];
      const deletedItem = {
        ...itemToDelete,
        deletedAt: new Date().toISOString()
      };
      
      deletedItems.push(deletedItem);
      const filteredItems = items.filter(item => item.id !== targetId);
      
      await kv.set('items', filteredItems);
      await kv.set('deleted_items', deletedItems);
      
      return Response.json({ success: true, message: 'Item moved to deleted items' });
    }
    
    // Hard delete (legacy support)
    const filteredItems = items.filter(item => item.id !== targetId);
    await kv.set('items', filteredItems);
    
    return Response.json({ success: true });
  } catch (error) {
    console.log('Delete error:', error);
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
