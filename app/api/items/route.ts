import { kv } from '@/lib/db';

export async function GET() {
  try {
    const products = await kv.get<any[]>('products') || [];
    const flatProducts = products.flatMap(p => p.items || []);
    return Response.json({ products: flatProducts });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const products = await kv.get('products') || [];
    
    const product = {
      ...newProduct,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    products.push(product);
    await kv.set('products', products);
    
    return Response.json({ success: true, product });
  } catch (error) {
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
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