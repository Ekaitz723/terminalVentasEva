// api/debug-connection/route.ts
export async function GET() {
  try {
    console.log('Testing connection to:', process.env.POSTGRES_URL?.substring(0, 30));
    
    const { sql } = await import('@vercel/postgres');
    const result = await sql`SELECT 1 as test`;
    
    return Response.json({ 
      success: true, 
      result: result.rows[0] 
    });
  } catch (error) {
    console.error('Full error:', error);
    return Response.json({ 
      error: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 200)
    }, { status: 500 });
  }
}