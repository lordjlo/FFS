
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulateSignup() {
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Creating user: ${email}`);

    // 1. Create User in Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: 'Test', last_name: 'User' }
    });

    if (error) {
        console.error('Error creating user:', error);
        return;
    }

    console.log('User created:', user.user.id);

    // 2. Wait for Trigger
    console.log('Waiting for trigger to sync to profiles...');
    await new Promise(r => setTimeout(r, 2000));

    // 3. Check Profiles Table
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

    if (pError) {
        console.error('Profile NOT found! Trigger failed.', pError);
    } else {
        console.log('SUCCESS: Profile found in database!');
        console.log(profile);
    }

    // 4. Cleanup (limit clutter)
    await supabase.auth.admin.deleteUser(user.user.id);
    console.log('Test user deleted.');
}

simulateSignup();
