export async function getLiveProgram() {
    try {
        const response = await fetch('/api/program');
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching program:', error);
        return null;
    }
}

export async function getLiveWorkout(id) {
    try {
        const response = await fetch(`/api/workout?id=${id}`);
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching workout:', error);
        return null;
    }
}

export const MOCK_PROGRAM = {
    // ... fallback mock data ...
};
