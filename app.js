// Main application logic for Melody to Chords Helper
import { majorScales, buildDiatonicChords, normalizeNote, getNoteLetter } from './music-theory.js';
import { playNote, playChord, playMelody } from './audio.js';

// Application state
let selectedNotes = new Set();
let selectedKey = null;
let phraseCount = 0;
let phraseResults = {}; // Store results by phrase ID

// DOM elements - initialized after DOM loads
let noteButtons, selectedNotesDisplay, clearBtn, keyResults, chordCard, chordGrid;
let selectedKeyName, phraseCard, phrasesContainer, addPhraseBtn;
let chordSummary, chordSummaryDisplay, printBtn;

// Initialize the application
function init() {
    // Get DOM elements
    noteButtons = document.querySelectorAll('.note-btn');
    selectedNotesDisplay = document.getElementById('selectedNotesDisplay');
    clearBtn = document.getElementById('clearBtn');
    keyResults = document.getElementById('keyResults');
    chordCard = document.getElementById('chordCard');
    chordGrid = document.getElementById('chordGrid');
    selectedKeyName = document.getElementById('selectedKeyName');
    phraseCard = document.getElementById('phraseCard');
    phrasesContainer = document.getElementById('phrasesContainer');
    addPhraseBtn = document.getElementById('addPhraseBtn');
    chordSummary = document.getElementById('chordSummary');
    chordSummaryDisplay = document.getElementById('chordSummaryDisplay');
    printBtn = document.getElementById('printBtn');

    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI state
    updateUIState();
}

// Set up all event listeners
function setupEventListeners() {
    // Note button click handlers
    noteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const note = btn.dataset.note;
            const letter = getNoteLetter(note);

            // Play the note sound
            playNote(note);

            // Remove any other version of this letter
            selectedNotes.forEach(n => {
                if (getNoteLetter(n) === letter) {
                    selectedNotes.delete(n);
                    document.querySelector(`[data-note="${n}"]`).classList.remove('selected');
                }
            });

            // Toggle this note
            if (btn.classList.contains('selected')) {
                selectedNotes.delete(note);
                btn.classList.remove('selected');
            } else {
                selectedNotes.add(note);
                btn.classList.add('selected');
            }

            updateDisplay();
        });
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        selectedNotes.clear();
        noteButtons.forEach(btn => btn.classList.remove('selected'));
        selectedKey = null;
        updateDisplay();
    });

    // Add phrase button
    addPhraseBtn.addEventListener('click', addPhrase);

    // PDF Export
    printBtn.addEventListener('click', () => window.print());
}

// Update display and UI state
function updateDisplay() {
    // Update selected notes display
    if (selectedNotes.size === 0) {
        selectedNotesDisplay.textContent = '—';
    } else {
        const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const sorted = Array.from(selectedNotes).sort((a, b) => {
            return noteOrder.indexOf(getNoteLetter(a)) - noteOrder.indexOf(getNoteLetter(b));
        });
        selectedNotesDisplay.textContent = sorted.join('  ');
    }
    
    // Find matching keys
    updateKeyMatches();
    updateUIState();
}

// Update UI state (enable/disable steps)
function updateUIState() {
    const hasNotes = selectedNotes.size > 0;
    const hasKey = selectedKey !== null;
    
    // Step 2: Enable if notes selected
    const step2Card = document.getElementById('keyCard');
    const step2Hint = step2Card.querySelector('.hint');
    if (hasNotes) {
        step2Card.classList.remove('disabled');
        step2Hint.textContent = 'Based on your unique notes, here are the major keys that could work. Click one to see its chords.';
        step2Hint.classList.remove('disabled-hint');
    } else {
        step2Card.classList.add('disabled');
        step2Hint.textContent = 'Select notes above to find matching keys. Then click a key to continue.';
        step2Hint.classList.add('disabled-hint');
    }
    
    // Step 3: Enable if key selected
    const step3Hint = chordCard.querySelector('.hint');
    if (hasKey) {
        chordCard.classList.remove('disabled', 'hidden');
        step3Hint.innerHTML = 'These are the 7 chords you can use. Each chord has a function (Home, Bridge, Outside) — think of your music as a journey: start from Home, venture out, and return Home. I learned the chord function concept from <a href="https://www.youtube.com/watch?v=1USZt8fx82U" target="_blank">this video</a> by <a href="https://www.youtube.com/@nicechordwiwi" target="_blank">NiceChord 好和弦</a>.';
        step3Hint.classList.remove('disabled-hint');
    } else {
        chordCard.classList.add('disabled');
        if (!hasNotes) {
            chordCard.classList.add('hidden');
        }
        step3Hint.textContent = 'Select a key in step 2 to see the available chords.';
        step3Hint.classList.add('disabled-hint');
    }
    
    // Step 4: Enable if key selected
    const step4Hint = phraseCard.querySelector('.hint');
    if (hasKey) {
        phraseCard.classList.remove('disabled', 'hidden');
        step4Hint.textContent = 'Enter the notes for each phrase in your melody. Click + to add more phrases.';
        step4Hint.classList.remove('disabled-hint');
    } else {
        phraseCard.classList.add('disabled');
        if (!hasNotes) {
            phraseCard.classList.add('hidden');
        }
        step4Hint.textContent = 'Select a key in step 2 to start analyzing phrases.';
        step4Hint.classList.add('disabled-hint');
    }
}

// Find matching keys
function updateKeyMatches() {
    if (selectedNotes.size === 0) {
        keyResults.innerHTML = '<div class="no-match">Select some notes above to find matching keys</div>';
        selectedKey = null;
        updateUIState();
        return;
    }
    
    const selectedNoteValues = new Set(Array.from(selectedNotes).map(normalizeNote));
    const matches = [];
    
    for (const [keyName, scale] of Object.entries(majorScales)) {
        const scaleNoteValues = new Set(scale.map(normalizeNote));
        
        // Check if all selected notes are in this scale
        let allMatch = true;
        for (const noteVal of selectedNoteValues) {
            if (!scaleNoteValues.has(noteVal)) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            matches.push({
                name: keyName,
                notes: scale,
                matchCount: selectedNotes.size
            });
        }
    }
    
    if (matches.length === 0) {
        keyResults.innerHTML = '<div class="no-match">No major key contains all these notes. Try removing a note or check for enharmonic equivalents.</div>';
        selectedKey = null;
        updateUIState();
            } else {
                keyResults.innerHTML = matches.map(m => `
                    <div class="key-match ${selectedKey === m.name ? 'selected' : ''}" data-key="${m.name}">
                        <div class="key-name">${m.name}</div>
                        <div class="key-notes">${m.notes.join('  ')}</div>
                        <div class="key-hint">${selectedKey === m.name ? 'Selected ✓' : 'Click to select'}</div>
                    </div>
                `).join('');
        
        // Add click handlers
        document.querySelectorAll('.key-match').forEach(el => {
            el.addEventListener('click', () => selectKey(el.dataset.key));
        });
    }
}

// Select a key
function selectKey(keyName) {
    selectedKey = keyName;
    
    // Update key match highlighting
    document.querySelectorAll('.key-match').forEach(el => {
        el.classList.toggle('selected', el.dataset.key === keyName);
        // Update hint text
        const hint = el.querySelector('.key-hint');
        if (hint) {
            hint.textContent = el.dataset.key === keyName ? 'Selected ✓' : 'Click to select';
        }
    });
    
    // Update UI
    selectedKeyName.textContent = keyName;
    updateUIState();
    
    // Build and display chords
    const chords = buildDiatonicChords(keyName);
    chordGrid.innerHTML = chords.map(c => `
        <div class="chord-card" title="${c.function.description}">
            <div class="chord-function ${c.function.role}"><span class="function-icon">${c.function.icon}</span> ${c.function.label}</div>
            <div class="chord-numeral">${c.numeral}</div>
            <div class="chord-name">${c.name}</div>
            <div class="chord-notes">${c.notes.join(' ')}</div>
        </div>
    `).join('');

    // Add click handlers to play chord audio
    document.querySelectorAll('.chord-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            playChord(chords[index].notes);
            // Visual feedback - add playing class briefly
            card.classList.add('playing');
            setTimeout(() => card.classList.remove('playing'), 200);
        });
    });
    
    // Add first phrase input if none exist
    if (phrasesContainer.children.length === 0) {
        addPhrase();
    }
    
    // Re-analyze all existing phrases with new key
    reanalyzeAllPhrases();
}

// Convert a note to match the selected key's spelling (e.g., A♯ → B♭ in F major)
function getEnharmonicForKey(note, keyName) {
    if (!keyName) return note;

    const scale = majorScales[keyName];
    if (!scale) return note;

    // Enharmonic equivalents mapping
    const enharmonics = {
        'C♯': 'D♭', 'D♭': 'C♯',
        'D♯': 'E♭', 'E♭': 'D♯',
        'F♯': 'G♭', 'G♭': 'F♯',
        'G♯': 'A♭', 'A♭': 'G♯',
        'A♯': 'B♭', 'B♭': 'A♯'
    };

    // Check if the note or its enharmonic is in the scale
    if (scale.includes(note)) {
        return note;
    }

    const enharmonic = enharmonics[note];
    if (enharmonic && scale.includes(enharmonic)) {
        return enharmonic;
    }

    // For natural notes or if no match found, return original
    return note;
}

// Create a piano keyboard HTML for a phrase
function createPianoKeyboard(phraseId) {
    // Define 2 octaves: C4 to B5
    const octaves = [4, 5];
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = {
        'C': 'C♯', 'D': 'D♯', 'F': 'F♯', 'G': 'G♯', 'A': 'A♯'
    };

    let keysHtml = '';
    let whiteKeyIndex = 0;
    const whiteKeyWidth = 28;

    octaves.forEach(octave => {
        whiteNotes.forEach((note, noteIndex) => {
            // White key
            keysHtml += `
                <div class="piano-key white"
                     data-note="${note}"
                     data-octave="${octave}"
                     data-phrase-id="${phraseId}">
                    ${octave === 4 && noteIndex === 0 ? '<span class="piano-key-label">C4</span>' : ''}
                    ${octave === 5 && noteIndex === 0 ? '<span class="piano-key-label">C5</span>' : ''}
                </div>
            `;

            // Black key (if exists for this white note)
            if (blackNotes[note]) {
                const leftOffset = whiteKeyIndex * whiteKeyWidth + whiteKeyWidth - 10;
                keysHtml += `
                    <div class="piano-key black"
                         data-note="${blackNotes[note]}"
                         data-octave="${octave}"
                         data-phrase-id="${phraseId}"
                         style="left: ${leftOffset}px;">
                    </div>
                `;
            }

            whiteKeyIndex++;
        });
    });

    return `
        <div class="piano-keyboard-container">
            <div class="piano-keyboard" id="piano-keyboard-${phraseId}">
                ${keysHtml}
            </div>
            <div class="piano-controls">
                <button class="play-melody-btn" data-phrase-id="${phraseId}" title="Play melody">▶</button>
                <button class="backspace-btn" data-phrase-id="${phraseId}" title="Delete last note">⌫</button>
            </div>
        </div>
    `;
}

// Add a new phrase input
function addPhrase() {
    phraseCount++;
    const phraseId = phraseCount;

    const phraseRow = document.createElement('div');
    phraseRow.className = 'phrase-row';
    phraseRow.id = `phrase-row-${phraseId}`;
    phraseRow.innerHTML = `
        <span class="phrase-number">${phraseId}.</span>
        <div class="phrase-input-wrapper">
            ${createPianoKeyboard(phraseId)}
            <input type="text"
                   class="phrase-input"
                   id="phrase-input-${phraseId}"
                   data-phrase-id="${phraseId}"
                   placeholder="Click piano keys or type notes like: C E G C E">
            <div class="phrase-chord-result hidden" id="phrase-result-${phraseId}">
                <!-- Chord suggestions will be inserted here -->
            </div>
        </div>
        <button class="phrase-delete-btn" data-phrase-id="${phraseId}" title="Remove phrase">✕</button>
    `;

    phrasesContainer.appendChild(phraseRow);

    // Add event listeners
    const input = document.getElementById(`phrase-input-${phraseId}`);
    const deleteBtn = phraseRow.querySelector('.phrase-delete-btn');
    const backspaceBtn = phraseRow.querySelector('.backspace-btn');
    const playMelodyBtn = phraseRow.querySelector('.play-melody-btn');

    // Piano key click handlers
    phraseRow.querySelectorAll('.piano-key').forEach(key => {
        key.addEventListener('click', () => {
            const rawNote = key.dataset.note;
            const octave = parseInt(key.dataset.octave);

            // Convert to correct enharmonic spelling for the selected key
            const note = getEnharmonicForKey(rawNote, selectedKey);

            // Play the note
            playNote(rawNote, octave); // Use raw note for audio (same pitch)

            // Visual feedback
            key.classList.add('playing');
            setTimeout(() => key.classList.remove('playing'), 150);

            // Add note with octave to input (e.g., "B♭5" instead of "A♯5" in F major)
            const noteWithOctave = `${note}${octave}`;
            const currentValue = input.value.trim();
            input.value = currentValue ? `${currentValue} ${noteWithOctave}` : noteWithOctave;

            // Trigger analysis
            analyzePhrase(phraseId);
        });
    });

    // Backspace button handler
    backspaceBtn.addEventListener('click', () => {
        const notes = input.value.trim().split(/\s+/).filter(n => n);
        if (notes.length > 0) {
            notes.pop();
            input.value = notes.join(' ');
            analyzePhrase(phraseId);
        }
    });

    // Play melody button handler
    playMelodyBtn.addEventListener('click', async () => {
        const notes = input.value.trim().split(/\s+/).filter(n => n);
        if (notes.length > 0) {
            // Visual feedback - disable button while playing
            playMelodyBtn.disabled = true;
            playMelodyBtn.textContent = '⏸';
            await playMelody(notes);
            playMelodyBtn.disabled = false;
            playMelodyBtn.textContent = '▶';
        }
    });

    input.addEventListener('input', () => analyzePhrase(phraseId));
    input.addEventListener('blur', () => analyzePhrase(phraseId));

    deleteBtn.addEventListener('click', () => deletePhrase(phraseId));
}

// Delete a phrase
function deletePhrase(phraseId) {
    const row = document.getElementById(`phrase-row-${phraseId}`);
    if (row) {
        row.remove();
        delete phraseResults[phraseId];
        updateChordSummary();
        renumberPhrases();
    }
}

// Renumber phrases after deletion
function renumberPhrases() {
    const rows = phrasesContainer.querySelectorAll('.phrase-row');
    rows.forEach((row, index) => {
        row.querySelector('.phrase-number').textContent = `${index + 1}.`;
    });
}

// Re-analyze all phrases (when key changes)
function reanalyzeAllPhrases() {
    const inputs = phrasesContainer.querySelectorAll('.phrase-input');
    inputs.forEach(input => {
        const phraseId = parseInt(input.dataset.phraseId);
        analyzePhrase(phraseId);
    });
}

// Analyze a single phrase and return ranked chord suggestions
function analyzePhrase(phraseId) {
    const input = document.getElementById(`phrase-input-${phraseId}`);
    const resultDiv = document.getElementById(`phrase-result-${phraseId}`);
    
    if (!selectedKey || !input) return;
    
    const inputValue = input.value.trim();
    
    if (!inputValue) {
        resultDiv.classList.add('hidden');
        input.classList.remove('has-result');
        delete phraseResults[phraseId];
        updateChordSummary();
        return;
    }
    
    // Parse notes from input - handle Bb, B#, C5, A4, etc.
    // Match: letter (A-G), optionally followed by #/♯ or b/♭, optionally followed by octave number
    const noteRegex = /([A-Ga-g])([♯♭#b])?(\d)?/g;
    const phraseNotes = [];
    let match;
    
    while ((match = noteRegex.exec(inputValue)) !== null) {
        let note = match[1].toUpperCase();
        if (match[2]) {
            if (match[2] === '#' || match[2] === '♯') note += '♯';
            else if (match[2] === 'b' || match[2] === '♭') note += '♭';
        }
        phraseNotes.push(note);
    }
    
    if (phraseNotes.length === 0) {
        resultDiv.classList.add('hidden');
        input.classList.remove('has-result');
        delete phraseResults[phraseId];
        updateChordSummary();
        return;
    }
    
    // Count note frequencies (how many times each note appears)
    const noteFrequencies = {};
    phraseNotes.forEach(note => {
        const normalized = normalizeNote(note);
        noteFrequencies[normalized] = (noteFrequencies[normalized] || 0) + 1;
    });
    
    const uniquePhraseNotes = [...new Set(phraseNotes)];
    const uniquePhraseNoteValues = uniquePhraseNotes.map(n => normalizeNote(n));
    
    // Get previously used chords for variety penalty
    const previousChords = new Set();
    const rows = phrasesContainer.querySelectorAll('.phrase-row');
    rows.forEach(row => {
        const otherPhraseId = parseInt(row.id.replace('phrase-row-', ''));
        if (otherPhraseId !== phraseId && phraseResults[otherPhraseId]) {
            previousChords.add(phraseResults[otherPhraseId]);
        }
    });
    
    // Score each chord
    const chords = buildDiatonicChords(selectedKey);
    const chordScores = [];
    
    for (const chord of chords) {
        const chordNoteValues = new Set(chord.notes.map(normalizeNote));
        
        // Calculate weighted score based on note frequency
        let weightedScore = 0;
        let matchingNotes = 0;
        
        for (const pNote of phraseNotes) {
            const pNoteVal = normalizeNote(pNote);
            if (chordNoteValues.has(pNoteVal)) {
                weightedScore += noteFrequencies[pNoteVal]; // Weight by frequency
                matchingNotes++;
            }
        }
        
        // Count unique matching notes
        let uniqueMatches = 0;
        for (const pNoteVal of uniquePhraseNoteValues) {
            if (chordNoteValues.has(pNoteVal)) {
                uniqueMatches++;
            }
        }
        
        // Only include chords that match at least one note
        if (uniqueMatches > 0) {
            const coverage = Math.round((uniqueMatches / uniquePhraseNotes.length) * 100);
            
            // Apply variety penalty (reduce score if this chord was used recently)
            let varietyPenalty = 1.0;
            if (previousChords.has(chord.name)) {
                varietyPenalty = 0.7; // 30% penalty for repetition
            }
            
            // Final score: weighted frequency score * coverage * variety
            const finalScore = weightedScore * (coverage / 100) * varietyPenalty;
            
            chordScores.push({
                chord: chord,
                weightedScore: weightedScore,
                uniqueMatches: uniqueMatches,
                coverage: coverage,
                finalScore: finalScore,
                matchingNotes: matchingNotes,
                totalNotes: phraseNotes.length
            });
        }
    }
    
    // Sort by final score (descending)
    chordScores.sort((a, b) => b.finalScore - a.finalScore);
    
    // Show top suggestions (at least top 3, or all if there are fewer)
    const topSuggestions = chordScores.slice(0, Math.max(3, Math.min(5, chordScores.length)));
    
    // Display results
    displayChordSuggestions(phraseId, topSuggestions, uniquePhraseNotes.length);
    
    resultDiv.classList.remove('hidden');
    input.classList.add('has-result');
    
    // Store the selected suggestion (preserve user's previous selection if it's still in the list)
    if (topSuggestions.length > 0) {
        const previouslySelected = phraseResults[phraseId];
        const stillAvailable = topSuggestions.find(s => s.chord.name === previouslySelected);
        if (!stillAvailable) {
            // Previous selection is no longer in top suggestions, use the top one
            phraseResults[phraseId] = topSuggestions[0].chord.name;
        }
        // Otherwise, keep the previous selection
    }
    updateChordSummary();
}

// Display multiple chord suggestions for a phrase
function displayChordSuggestions(phraseId, suggestions, totalUniqueNotes) {
    const resultDiv = document.getElementById(`phrase-result-${phraseId}`);
    
    if (suggestions.length === 0) {
        resultDiv.innerHTML = '<span class="phrase-chord-name">No matching chords</span>';
        return;
    }
    
    // Check if user has already selected a chord for this phrase
    const previouslySelected = phraseResults[phraseId];
    const selectedIndex = suggestions.findIndex(s => s.chord.name === previouslySelected);
    const defaultSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;
    
    // Create suggestion buttons
    const suggestionsHTML = suggestions.map((suggestion, index) => {
        const isSelected = index === defaultSelectedIndex;
        const selectedClass = isSelected ? 'selected' : '';
        const chordNotes = suggestion.chord.notes.join(',');
        const func = suggestion.chord.function;
        return `
            <button class="chord-suggestion ${selectedClass}"
                    data-chord="${suggestion.chord.name}"
                    data-chord-notes="${chordNotes}"
                    data-phrase-id="${phraseId}"
                    title="${func.description} - Click to play and select">
                <span class="chord-suggestion-header">
                    <span class="chord-suggestion-name">${suggestion.chord.name}</span>
                    <span class="chord-suggestion-function ${func.role}">${func.icon}</span>
                </span>
                <span class="chord-suggestion-stats">
                    ${suggestion.uniqueMatches}/${totalUniqueNotes} notes · ${func.label}
                </span>
            </button>
        `;
    }).join('');
    
    resultDiv.innerHTML = `
        <div class="chord-suggestions-label">Suggested chords:</div>
        <div class="chord-suggestions-list">${suggestionsHTML}</div>
    `;
    
    // Add click handlers for chord selection
    resultDiv.querySelectorAll('.chord-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            const chordName = btn.dataset.chord;
            const chordNotes = btn.dataset.chordNotes.split(',');
            const phraseId = parseInt(btn.dataset.phraseId);

            // Play the chord
            playChord(chordNotes);

            // Update selected state
            resultDiv.querySelectorAll('.chord-suggestion').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Store selected chord
            phraseResults[phraseId] = chordName;
            updateChordSummary();
        });
    });
}

// Update the chord progression summary
function updateChordSummary() {
    const orderedResults = [];
    const rows = phrasesContainer.querySelectorAll('.phrase-row');
    
    rows.forEach(row => {
        const phraseId = parseInt(row.id.replace('phrase-row-', ''));
        if (phraseResults[phraseId]) {
            orderedResults.push(phraseResults[phraseId]);
        }
    });
    
    if (orderedResults.length > 0) {
        chordSummary.classList.remove('hidden');
        chordSummaryDisplay.textContent = orderedResults.join('  →  ');
    } else {
        chordSummary.classList.add('hidden');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

