import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const { error } = await supabase
      .from('community_requests')
      .insert([
        {
          community_name: body.communityName,
          area: body.area,
          number_of_flats: body.numberOfFlats,
          contact_person: body.contactPerson,
          phone: body.phone,
          email: body.email,
          notes: body.notes,
          ip_address: ip,
          source: body.source || 'Website'
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
