
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

import { isAdmin } from '@/utils/admin';

export async function GET(request) {
    try {
        const authClient = await createServerClient()
        const { data: { user }, error: authError } = await authClient.auth.getUser()

        if (authError) throw authError;

        console.log('Admin API Access Attempt:', user?.email);

        // 1. Security Check
        const admins = getAdmins();
        if (!user || !isAdmin(user.email)) {
            console.warn('Admin API: Access denied for', user?.email, 'Admin list:', admins);
            return NextResponse.json({
                error: 'Unauthorized: Admin access required',
                attempted: user?.email || 'No Session',
                allowed: admins
            }, { status: 403 })
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
