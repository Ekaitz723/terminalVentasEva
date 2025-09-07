// File: /app/api/test-order/route.js
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Dummy order data
    const dummyOrder = {
      customer_name: 'Juan Pérez',
      items: [
        {
          id: 2,
          name: 'pepe',
          price: 11.97,
          quantity: 2,
          subtotal: 23.94
        },
        {
          id: 4,
          name: 'a',
          price: 0.99,
          quantity: 1,
          subtotal: 0.99
        }
      ],
      total: 24.93,
      total_original: 24.93
      // status defaults to 'pending'
      // created_at defaults to CURRENT_TIMESTAMP
    };

    console.log('[TEST] Inserting dummy order:', dummyOrder);

    const { data, error } = await supabase
      .from('orders')
      .insert(dummyOrder)
      .select();

    if (error) {
      console.error('[TEST] Error inserting dummy order:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('[TEST] Successfully inserted dummy order:', data[0]);
    
    return Response.json({ 
      success: true, 
      order: data[0],
      message: 'Dummy order inserted successfully'
    });

  } catch (error) {
    console.error('[TEST] Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// // Alternative: Generate multiple dummy orders
// export async function GET() {
//   try {
//     const dummyOrders = [
//       {
//         customer_name: 'María García',
//         items: [{ id: 1, name: 'Product A', price: 15.50, quantity: 1, subtotal: 15.50 }],
//         total: 15.50
//       },
//       {
//         customer_name: 'Carlos López',
//         items: [
//           { id: 2, name: 'Product B', price: 8.99, quantity: 3, subtotal: 26.97 },
//           { id: 3, name: 'Product C', price: 12.00, quantity: 1, subtotal: 12.00 }
//         ],
//         total: 38.97
//       },
//       {
//         customer_name: 'Ana Martín',
//         items: [{ id: 4, name: 'Product D', price: 25.00, quantity: 2, subtotal: 50.00 }],
//         total: 50.00,
//         status: 'completed'
//       }
//     ];

//     const { data, error } = await supabase
//       .from('orders')
//       .insert(dummyOrders)
//       .select();

//     if (error) {
//       return Response.json({ error: error.message }, { status: 500 });
//     }

//     return Response.json({ 
//       success: true, 
//       orders: data,
//       count: data.length,
//       message: `${data.length} dummy orders inserted`
//     });

//   } catch (error) {
//     return Response.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }