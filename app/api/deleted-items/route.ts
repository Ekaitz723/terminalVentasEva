import { kv } from '@/lib/db';

export async function GET() {
  try {
    const deletedItems = await kv.get<any[]>('deleted_items') || [];
    return Response.json({ items: deletedItems });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch deleted items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idToRestore = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!idToRestore || action !== 'restore') {
      return Response.json({ error: 'ID and action=restore required' }, { status: 400 });
    }
    
    const deletedItems = await kv.get<any[]>('deleted_items') || [];
    const items = await kv.get<any[]>('items') || [];
    const targetId = parseInt(idToRestore);
    
    const itemToRestore = deletedItems.find(item => item.id === targetId);
    
    if (!itemToRestore) {
      return Response.json({ error: 'Deleted item not found' }, { status: 404 });
    }
    
    // Remove deletedAt and add restoredAt
    const { deletedAt, ...restoredItem } = itemToRestore;
    const finalItem = {
      ...restoredItem,
      restoredAt: new Date().toISOString()
    };
    
    // Move back to items
    items.push(finalItem);
    const filteredDeletedItems = deletedItems.filter(item => item.id !== targetId);
    
    await kv.set('items', items);
    await kv.set('deleted_items', filteredDeletedItems);
    
    return Response.json({ success: true, item: finalItem });
  } catch (error) {
    return Response.json({ error: 'Failed to restore item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idToDelete = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!idToDelete || action !== 'permanent') {
      return Response.json({ error: 'ID and action=permanent required' }, { status: 400 });
    }
    
    const deletedItems = await kv.get<any[]>('deleted_items') || [];
    const targetId = parseInt(idToDelete);
    
    const itemExists = deletedItems.some(item => item.id === targetId);
    
    if (!itemExists) {
      return Response.json({ error: 'Deleted item not found' }, { status: 404 });
    }
    
    const filteredDeletedItems = deletedItems.filter(item => item.id !== targetId);
    await kv.set('deleted_items', filteredDeletedItems);
    
    return Response.json({ success: true, message: 'Item permanently deleted' });
  } catch (error) {
    return Response.json({ error: 'Failed to permanently delete item' }, { status: 500 });
  }
}