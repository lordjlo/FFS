import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use service role to see workout details in join (if RLS blocks them from the standard client)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data, error } = await supabase
            .from('scheduled_workouts')
            .select(`
                *,
                workout:workouts (
                    day_name
                )
            `)
            .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { workout_id, scheduled_date } = body;

        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Check if already scheduled
        const { data: existing } = await supabase
            .from('scheduled_workouts')
            .select('id')
            .eq('user_id', user.id)
            .eq('workout_id', workout_id)
            .eq('scheduled_date', scheduled_date)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already scheduled' })
        }

        const { data, error } = await supabase
            .from('scheduled_workouts')
            .insert({
                workout_id,
                scheduled_date,
                user_id: user.id
            })
            .select(`
                *,
                workout:workouts (
                    day_name
                )
            `)

        if (error) throw error
        return NextResponse.json(data[0] || { success: true })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Security check: ensure the session belongs to the user
        const { data: existing, error: checkError } = await supabase
            .from('scheduled_workouts')
            .select('user_id')
            .eq('id', id)
            .maybeSingle()

        if (checkError) throw checkError
        if (!existing) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }
        if (existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { error: deleteError } = await supabase
            .from('scheduled_workouts')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
