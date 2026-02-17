require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function fix() {
    console.log('Starting DB fix...');
    const url = process.env.DATABASE_URL;
    // Try both pooled and direct ports
    const urls = [
        url,
        url.replace(':6543/', ':5432/').replace('?pgbouncer=true', '')
    ];

    for (const u of urls) {
        console.log(`Attempting connection to: ${u.split('@')[1]}`);
        const client = new Client({
            connectionString: u,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log('Connected successfully!');

            await client.query(`
                CREATE TABLE IF NOT EXISTS public.scheduled_workouts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID,
                    workout_id UUID REFERENCES public.workouts(id),
                    scheduled_date DATE NOT NULL,
                    completed BOOLEAN DEFAULT false,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log('Table verified.');

            await client.query(`
                GRANT ALL ON TABLE public.scheduled_workouts TO postgres, anon, authenticated, service_role;
            `);
            console.log('Permissions granted.');

            // Try to force a schema reload by poking a dummy table or similar
            // This is the best we can do without NOTIFY pgrst
            console.log('DB Fix complete.');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.error(`Failed with url ${u}:`, err.message);
        }
    }
    console.error('All connection attempts failed.');
    process.exit(1);
}

fix();
