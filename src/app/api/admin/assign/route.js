
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { importFromSheets } from '@/scripts/import_from_sheets'

export async function POST(request) {
    try {
        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        // 1. Security Check
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (!user || !adminEmail || user.email !== adminEmail) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
        }

        const body = await request.json();
        const { targetEmail, spreadsheetId } = body;

        if (!targetEmail) {
            return NextResponse.json({ error: 'Target email is required' }, { status: 400 });
        }

        // 2. Trigger the import script
        // Note: The script logic handles the Supabase Service Role and Google Auth internally
        const result = await importFromSheets(targetEmail, spreadsheetId);

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Assign API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
