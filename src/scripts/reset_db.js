require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetDB() {
    console.log('Resetting training data...');

    // Cascading deletes usually handle this if schema is set up, 
    // but we'll be explicit for safety.
    const { error: eError } = await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: wError } = await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: pError } = await supabase.from('programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: sError } = await supabase.from('scheduled_workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (eError || wError || pError || sError) {
        console.error('Errors during reset:', { eError, wError, pError, sError });
    } else {
        console.log('Success: All training data cleared.');
    }
}

resetDB();
