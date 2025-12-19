# Melody to Chords Helper

A web application that helps musicians identify chord progressions from melody notes.

## Running the Application

### Option 1: Using a Local Server (Recommended)
ES6 modules require files to be served over HTTP/HTTPS. Use one of these methods:

**Python:**
```bash
python -m http.server 8000
```
Then open: http://localhost:8000/melody-to-chords.html

**Node.js (with npx):**
```bash
npx serve
```


### Option 2: Direct File Opening
If you open the HTML file directly (file://), ES6 modules won't work. You'll need to use a local server as shown above.

## File Structure

```
music_buddy/
├── melody-to-chords.html  # Main HTML file
├── music-theory.js         # Music theory data and utilities
├── app.js                  # Main application logic
└── README.md              # This file
```

## How It Works

1. **Step 1**: User selects unique notes from their melody
2. **Step 2**: App finds matching major keys (shown but disabled until notes are selected)
3. **Step 3**: User clicks a key to see diatonic chords (shown but disabled until key is selected)
4. **Step 4**: User enters phrases and app suggests best matching chords

## Technical Details

- **Pure client-side**: No backend required
- **ES6 Modules**: Modern JavaScript module system for better code organization
- **PDF Export**: Uses jsPDF library for generating chord progression PDFs
- **Responsive Design**: Works on desktop and mobile devices

