import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import exerciseVideoMap from '@/scripts/exercise_videos.json'

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data: programs, error: pError } = await supabase
            .from('programs')
            .select('*')
            .limit(1)

        if (pError || !programs.length) throw pError || new Error('No program found')
        const program = programs[0]

        const { data: workouts, error: wError } = await supabase
            .from('workouts')
            .select('*')
            .eq('program_id', program.id)

        if (wError) throw wError

        const workoutsWithExercises = await Promise.all(workouts.map(async (workout) => {
            const { data: exercises, error: eError } = await supabase
                .from('exercises')
                .select('*')
                .eq('workout_id', workout.id)

            if (eError) throw eError

            return {
                ...workout,
                name: workout.day_name,
                exercises: exercises.map(ex => {
                    const videoId = exerciseVideoMap && exerciseVideoMap[ex.name];
                    return {
                        ...ex,
                        videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
                    };
                })
            }
        }))

        // Group workouts by week number
        const weeksMap = {};
        workoutsWithExercises.forEach(workout => {
            const wNum = workout.week_number || 1;
            if (!weeksMap[wNum]) {
                weeksMap[wNum] = {
                    weekNumber: wNum,
                    name: `Week ${wNum}`,
                    days: []
                };
            }
            weeksMap[wNum].days.push(workout);
        });

        const weeksList = Object.values(weeksMap).sort((a, b) => a.weekNumber - b.weekNumber);

        return NextResponse.json({
            ...program,
            weeks: weeksList
        })
    } catch (error) {
        console.error('API Error in /api/program:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
