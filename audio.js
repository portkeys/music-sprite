// Audio playback module using Tone.js with real piano samples
import { normalizeNote } from './music-theory.js';

// Piano sampler - lazy loaded on first use
let piano = null;
let isLoading = false;
let loadPromise = null;

// Salamander Grand Piano samples (free, high-quality)
const PIANO_SAMPLES_URL = 'https://tonejs.github.io/audio/salamander/';

/**
 * Initialize the piano sampler
 * @returns {Promise} Resolves when piano is ready
 */
async function initPiano() {
    if (piano) return piano;
    if (loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = new Promise((resolve) => {
        // Load a subset of notes (Tone.js will interpolate the rest)
        piano = new Tone.Sampler({
            urls: {
                'A0': 'A0.mp3',
                'C1': 'C1.mp3',
                'D#1': 'Ds1.mp3',
                'F#1': 'Fs1.mp3',
                'A1': 'A1.mp3',
                'C2': 'C2.mp3',
                'D#2': 'Ds2.mp3',
                'F#2': 'Fs2.mp3',
                'A2': 'A2.mp3',
                'C3': 'C3.mp3',
                'D#3': 'Ds3.mp3',
                'F#3': 'Fs3.mp3',
                'A3': 'A3.mp3',
                'C4': 'C4.mp3',
                'D#4': 'Ds4.mp3',
                'F#4': 'Fs4.mp3',
                'A4': 'A4.mp3',
                'C5': 'C5.mp3',
                'D#5': 'Ds5.mp3',
                'F#5': 'Fs5.mp3',
                'A5': 'A5.mp3',
                'C6': 'C6.mp3',
                'D#6': 'Ds6.mp3',
                'F#6': 'Fs6.mp3',
                'A6': 'A6.mp3',
                'C7': 'C7.mp3',
                'D#7': 'Ds7.mp3',
                'F#7': 'Fs7.mp3',
                'A7': 'A7.mp3',
                'C8': 'C8.mp3'
            },
            baseUrl: PIANO_SAMPLES_URL,
            onload: () => {
                isLoading = false;
                resolve(piano);
            }
        }).toDestination();
    });

    return loadPromise;
}

/**
 * Convert note name to Tone.js format
 * @param {string} noteName - Note name (e.g., 'C', 'F♯', 'B♭')
 * @param {number} octave - Octave number (default 4)
 * @returns {string} Tone.js note format (e.g., 'C4', 'F#4', 'Bb4')
 */
function toToneNote(noteName, octave = 4) {
    // Convert unicode symbols to ASCII for Tone.js
    let note = noteName
        .replace('♯', '#')
        .replace('♭', 'b');
    return `${note}${octave}`;
}

/**
 * Start audio context (required after user interaction)
 */
async function startAudio() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
}

/**
 * Play a single note
 * @param {string} noteName - Note name (e.g., 'C', 'F♯')
 * @param {number} octave - Octave number (default 4)
 * @param {string} duration - Duration (default '8n' = eighth note)
 */
export async function playNote(noteName, octave = 4, duration = '4n') {
    await startAudio();
    const p = await initPiano();

    const toneNote = toToneNote(noteName, octave);
    p.triggerAttackRelease(toneNote, duration);
}

/**
 * Play a chord (multiple notes simultaneously)
 * @param {string[]} notes - Array of note names (e.g., ['C', 'E', 'G'])
 * @param {number} octave - Octave number (default 4)
 * @param {string} duration - Duration (default '2n' = half note)
 */
export async function playChord(notes, octave = 4, duration = '2n') {
    await startAudio();
    const p = await initPiano();

    const toneNotes = notes.map(n => toToneNote(n, octave));
    p.triggerAttackRelease(toneNotes, duration);
}

/**
 * Parse a note string that may include octave (e.g., "C5", "A4", "F♯4")
 * @param {string} noteStr - Note string like "C5" or "C" or "F♯4"
 * @param {number} defaultOctave - Default octave if not specified
 * @returns {{note: string, octave: number}}
 */
function parseNoteWithOctave(noteStr, defaultOctave = 4) {
    // Match: note letter, optional accidental, optional octave number
    const match = noteStr.match(/^([A-Ga-g][♯♭#b]?)(\d)?$/);
    if (match) {
        const note = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        const octave = match[2] ? parseInt(match[2]) : defaultOctave;
        return { note, octave };
    }
    return { note: noteStr, octave: defaultOctave };
}

/**
 * Play a melody (notes in sequence)
 * @param {string[]} notes - Array of note strings (e.g., ['C5', 'A4', 'C5', 'A4', 'F5'])
 * @param {number} defaultOctave - Default octave if note doesn't specify one
 * @param {number} tempo - Notes per second (default 3)
 * @returns {Promise} Resolves when melody finishes playing
 */
export async function playMelody(notes, defaultOctave = 4, tempo = 3) {
    await startAudio();
    const p = await initPiano();

    const interval = 1 / tempo; // seconds between notes
    const now = Tone.now();

    notes.forEach((noteStr, index) => {
        const { note, octave } = parseNoteWithOctave(noteStr, defaultOctave);
        const toneNote = toToneNote(note, octave);
        const startTime = now + (index * interval);
        p.triggerAttackRelease(toneNote, '8n', startTime);
    });

    // Return promise that resolves when melody finishes
    const totalDuration = notes.length * interval * 1000;
    return new Promise(resolve => setTimeout(resolve, totalDuration));
}

// Pre-initialize piano on module load (samples load in background)
initPiano();
