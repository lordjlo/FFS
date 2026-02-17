const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyData() {
    try {
        console.log('Fetching programs...');
        const { data: programs, error: pError } = await supabase.from('programs').select('*');
        if (pError) throw pError;
        console.log(`Found ${programs.length} programs.`);

        for (const p of programs) {
            const { data: ws, error: e } = await supabase.from('workouts').select('id').eq('program_id', p.id);
            console.log(`Program "${p.title}" has ${ws?.length || 0} workouts.`);
        }

        console.log('Fetching all workouts...');
        const { data: workouts, error: wError } = await supabase.from('workouts').select('*');
        if (wError) throw wError;
        console.log(`Total workouts in DB: ${workouts.length}`);

        const orphaned = workouts.filter(w => !w.program_id);
        console.log(`Orphaned workouts (no program_id): ${orphaned.length}`);

        console.log('Fetching exercises...');
        const { data: exercises, error: eError } = await supabase.from('exercises').select('*');
        if (eError) throw eError;
        console.log(`Found ${exercises.length} exercises.`);

        if (exercises.length > 0) {
            console.log('Sample Exercise:', exercises[0]);
        }
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyData();
