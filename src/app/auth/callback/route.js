import { NextResponse } from 'next/server'
// The client you created in Step 1
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
            // Check if this is a new user (created in the last minute)
            // Note: In some OAuth flows, created_at might be slightly older if the user endpoint was hit before callback
            // A 60 second window is usually safe for "Just Signed Up"
            const createdAt = new Date(data.user.created_at).getTime();
            const now = Date.now();
            const isNewUser = (now - createdAt) < 60000; // 60 seconds

            if (isNewUser) {
                // Determine if we need to notify
                // We use dynamic import to avoid bundling issues if this runs on edge (though route.js is Node by default)
                try {
                    const { sendNewUserAlert } = await import('@/lib/notifications');
                    // Fire and forget - don't await the result to delay redirect
                    sendNewUserAlert(data.user).catch(err => console.error('Notification failed:', err));
                } catch (e) {
                    console.error('Failed to load notification module', e);
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // auth usage with proxies
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no proxy involved in local dev
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
