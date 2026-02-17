import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, completed } = body;

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify the user owns this scheduled workout before updating
        const { data: checkData, error: checkError } = await supabase
            .from('scheduled_workouts')
            .select('user_id')
            .eq('id', id)
            .single()

        if (checkError || checkData.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized workout access' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('scheduled_workouts')
            .update({
                completed: completed
            })
            .eq('id', id)
            .select()

        if (error) throw error
        return NextResponse.json(data[0] || { success: true })
    } catch (error) {
        console.error('Completion API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
