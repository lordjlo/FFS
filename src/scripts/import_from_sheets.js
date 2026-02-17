require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase with Service Role Key for Admin access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load video mappings
const videoMappingsPath = path.join(__dirname, 'exercise_videos.json');
let videoMappings = {};
if (fs.existsSync(videoMappingsPath)) {
    videoMappings = JSON.parse(fs.readFileSync(videoMappingsPath, 'utf8'));
}

async function importFromSheets(targetEmail = null, targetSpreadsheetId = null) {
    // 0. Parse Arguments if not provided
    if (!targetEmail) {
        const args = process.argv.slice(2);
        const emailArg = args.find(a => a.startsWith('--email='));
        targetEmail = emailArg ? emailArg.split('=')[1] : null;
    }

    const spreadsheetId = targetSpreadsheetId || process.env.GOOGLE_SHEETS_ID;

    try {
        let ownerId = null;
        if (targetEmail) {
            console.log(`Looking up user with email: ${targetEmail}`);
            // Lookup in profiles which maps auth.users
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', targetEmail)
                .single();

            if (profileError || !profile) {
                console.error(`Error: Could not find user profile for ${targetEmail}. Make sure they have logged in at least once.`);
                // If running as script, exit. If function, throw.
                if (require.main === module) process.exit(1);
                throw new Error(`User not found: ${targetEmail}`);
            }
            ownerId = profile.id;
            console.log(`Found User ID: ${ownerId}`);
        }

        console.log('Using Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
        await doc.loadInfo();
        console.log(`Successfully loaded sheet: ${doc.title}`);

        const sheet = doc.sheetsByTitle['Strength Session'];
        if (!sheet) throw new Error("Could not find tab named 'Strength Session'");

        const rows = await sheet.getRows();

        console.log(`Processing ${rows.length} rows...`);

        // 1. Ensure a program exists for this owner
        const programTitle = targetEmail ? `${doc.title} (${targetEmail.split('@')[0]})` : doc.title;
        const { data: program, error: pError } = await supabase
            .from('programs')
            .upsert({
                title: programTitle,
                description: `Imported for ${targetEmail || 'global'}`,
                owner_id: ownerId
            })
            .select()
            .single();

        if (pError) throw pError;

        let currentSession = '';
        const workoutCache = new Map(); // Key: sessionName-weekNumber, Value: workoutId

        for (const row of rows) {
            const firstCell = row._rawData[0];
            if (!firstCell) continue;

            const lowerFirstCell = firstCell.toLowerCase().trim();

            if (lowerFirstCell.includes('session')) {
                currentSession = firstCell.trim();
                console.log(`\n--- Processing ${currentSession} ---`);
                continue;
            }

            if (lowerFirstCell === 'exercise') continue;

            const exerciseMatch = firstCell.match(/^([A-Z]\d+)\s*(.*)/);
            let exerciseName, sequenceCode, instructions;

            if (exerciseMatch) {
                sequenceCode = exerciseMatch[1];
                exerciseName = exerciseMatch[2].split('\n')[0].trim();
                instructions = exerciseMatch[2].split('\n').slice(1).join('\n').trim();
            } else {
                sequenceCode = '';
                exerciseName = firstCell.split('\n')[0].trim();
                instructions = firstCell.split('\n').slice(1).join('\n').trim();
            }

            // Loop through all 5 weeks (Columns B-P)
            for (let w = 1; w <= 5; w++) {
                const startIdx = 1 + (w - 1) * 3;
                const s1 = row._rawData[startIdx];
                const s2 = row._rawData[startIdx + 1];
                const s3 = row._rawData[startIdx + 2];

                if (!s1 && !s2 && !s3) continue;

                const weekName = `Week ${w} ${currentSession}`;
                const cacheKey = `${currentSession}-${w}`;

                let workoutId;
                if (workoutCache.has(cacheKey)) {
                    workoutId = workoutCache.get(cacheKey);
                } else {
                    const { data: workout, error: wError } = await supabase
                        .from('workouts')
                        .upsert({
                            day_name: weekName,
                            week_number: w,
                            program_id: program.id
                        }, { onConflict: 'program_id, week_number, day_name' }) // Ensure checking constraint if exists, or simple update
                        .select()
                        .single();

                    if (wError) throw wError;
                    workoutId = workout.id;
                    workoutCache.set(cacheKey, workoutId);
                }

                // Video mapping
                const videoId = videoMappings[exerciseName] || null;

                // Create Exercise
                await supabase.from('exercises').upsert({
                    workout_id: workoutId,
                    name: exerciseName,
                    suggested_reps: `S1: ${s1 || '?'}, S2: ${s2 || '?'}, S3: ${s3 || '?'}`,
                    instructions: sequenceCode ? `${sequenceCode}: ${instructions}` : instructions,
                    video_id: videoId
                });
            }
        }

        console.log('Import completed successfully.');
        return { success: true, programId: program.id };
    } catch (error) {
        console.error('Error during import:', error.message);
        if (require.main === module) process.exit(1);
        throw error;
    }
}

if (require.main === module) {
    importFromSheets();
}

module.exports = { importFromSheets };
