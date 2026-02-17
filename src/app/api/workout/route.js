import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import exerciseVideoMap from '@/scripts/exercise_videos.json'

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const authClient = await createServerClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data: workout, error: wError } = await supabase
            .from('workouts')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (wError) throw wError

        if (!workout) {
            return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
        }

        const { data: exercises, error: eError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', id)

        if (eError) throw eError

        const mappedExercises = exercises.map(ex => {
            const videoId = exerciseVideoMap && exerciseVideoMap[ex.name];
            return {
                ...ex,
                videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
            };
        });

        return NextResponse.json({
            ...workout,
            name: workout.day_name,
            exercises: mappedExercises
        })
    } catch (error) {
        console.error('API Error in /api/workout:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
