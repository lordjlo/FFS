
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json();
        const { display_name } = body;

        if (!display_name) {
            return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
        }

        // 1. Update Public Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ display_name })
            .eq('id', user.id);

        if (profileError) throw profileError;

        // 2. Update Auth Metadata (for session consistency)
        const { error: metaError } = await supabase.auth.updateUser({
            data: { first_name: display_name }
        });

        if (metaError) {
            console.error('Meta update failed:', metaError);
            // Continue, as profile update is more critical for UI
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
