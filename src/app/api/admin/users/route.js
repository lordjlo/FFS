
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

import { isAdmin } from '@/utils/admin';

export async function GET(request) {
    try {
        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        // 1. Security Check
        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
        }

        // 2. Initialize Service Role Client to fetch all profiles
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // 3. Fetch all profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(profiles);
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
