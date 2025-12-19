// Music theory data and utility functions

// All 15 major scales
export const majorScales = {
    'C Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G Major': ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'],
    'D Major': ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'],
    'A Major': ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'],
    'E Major': ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'],
    'B Major': ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯'],
    'F♯ Major': ['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'],
    'C♯ Major': ['C♯', 'D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B♯'],
    'F Major': ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'],
    'B♭ Major': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'],
    'E♭ Major': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'],
    'A♭ Major': ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'],
    'D♭ Major': ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'],
    'G♭ Major': ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'],
    'C♭ Major': ['C♭', 'D♭', 'E♭', 'F♭', 'G♭', 'A♭', 'B♭']
};

// Chord quality for each scale degree (1-indexed)
export const chordQualities = ['', 'maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
export const chordNumerals = ['', 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

// Chord functions - the emotional/harmonic role of each scale degree
export const chordFunctions = [
    '',
    { role: 'home', label: 'Home', icon: '🏠', description: 'Stable, resolved, the tonal center' },
    { role: 'bridge-like', label: 'Bridge-like', icon: '🌉', description: 'Leads nicely to V (2-5-1 progression)' },
    { role: 'home-like', label: 'Home-like', icon: '🏡', description: 'Soft, can substitute for I' },
    { role: 'bridge', label: 'Bridge', icon: '🌁', description: 'Tension builder, wants to move forward' },
    { role: 'outside', label: 'Outside', icon: '🚀', description: 'Strong pull back to Home' },
    { role: 'home-like', label: 'Home-like', icon: '🏡', description: 'Emotional, often used in pop (1-5-6-4)' },
    { role: 'outside-like', label: 'Outside-like', icon: '✨', description: 'Rare, strong tension, resolves to I' }
];

/**
 * Build diatonic chords for a given major scale
 * @param {string} scaleName - Name of the major scale (e.g., 'C Major')
 * @returns {Array} Array of chord objects with numeral, name, and notes
 */
export function buildDiatonicChords(scaleName) {
    const scale = majorScales[scaleName];
    if (!scale) return [];

    const chords = [];

    for (let i = 0; i < 7; i++) {
        const root = scale[i];
        const third = scale[(i + 2) % 7];
        const fifth = scale[(i + 4) % 7];

        let chordName = root;
        const quality = chordQualities[i + 1];
        if (quality === 'min') chordName += 'm';
        else if (quality === 'dim') chordName += '°';

        const func = chordFunctions[i + 1];

        chords.push({
            numeral: chordNumerals[i + 1],
            name: chordName,
            notes: [root, third, fifth],
            function: func
        });
    }

    return chords;
}

/**
 * Normalize note for comparison (handles enharmonic equivalents)
 * @param {string} note - Note name (e.g., 'C♯', 'D♭')
 * @returns {number} Pitch value (0-11) or -1 if invalid
 */
export function normalizeNote(note) {
    const enharmonics = {
        'C': 0, 'B♯': 0,
        'C♯': 1, 'D♭': 1,
        'D': 2,
        'D♯': 3, 'E♭': 3,
        'E': 4, 'F♭': 4,
        'F': 5, 'E♯': 5,
        'F♯': 6, 'G♭': 6,
        'G': 7,
        'G♯': 8, 'A♭': 8,
        'A': 9,
        'A♯': 10, 'B♭': 10,
        'B': 11, 'C♭': 11
    };
    return enharmonics[note] ?? -1;
}

/**
 * Get the letter part of a note (C, D, E, etc.)
 * @param {string} note - Note name
 * @returns {string} Letter part of the note
 */
export function getNoteLetter(note) {
    return note.charAt(0);
}

