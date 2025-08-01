# Research Assistant Chrome Extension

[**Landing Page**](https://lexi-yakshdipteshgandhi.wasmer.app/)

## Overview
Lexi is a Chrome extension that helps users summarize selected text from any webpage using an AI-powered backend, and manage personal research notes with color-coded organization.

## Features
- **Summarize Selected Text:** Select any text on a webpage and click "Summarize" to get an AI-generated summary via a Spring Boot backend (Gemini/OpenAI powered).
- **Colored Notes with Tags:** Write and save personal research notes, choosing a color for each note to visually categorize and organize your research. Notes are displayed below the editor with their chosen color.
- **Notes Persistence:** Notes are stored in browser localStorage, so they persist across browser sessions.
- **Summary Length Toggle:** Choose between short, medium, or detailed summaries with a modern toggle UI.
- **Citation Display:** Optionally save a citation (URL and access date) with your note, displayed in a visually appealing card below the note. Citation info is not sent to the backend.
- **Summary History & Search:** The last 30 summaries are saved and can be searched by keyword or page. Clicking a summary copies it to the clipboard.
- **Note Versioning:** Every time a note is edited, a version with timestamp is saved. Previous versions can be viewed in a modal for each note.
- **Modern UI:** Clean, user-friendly interface for quick research workflows.

## Why It's Useful
- **Boosts Productivity:** Quickly distill long articles or papers into concise summaries.
- **Organized Research:** Color-coded notes help visually group and recall information by topic or importance.
- **Seamless Workflow:** No need to leave your browser or copy-paste between tools—summarize and take notes in one place.

## Tech Stack
- **Frontend:**
  - HTML, CSS, JavaScript (Vanilla)
  - Chrome Extension APIs (content scripts, scripting, storage)
- **Backend:**
  - Java Spring Boot (REST API)
  - AI Model: Gemini for text summarization
  - Deployed via Docker on Render
- **Storage:**
  - Browser localStorage for notes

## How It Works
1. **Summarize:**
   - Select text on any webpage.
   - Click the "Summarize" button in the extension panel.
   - The selected text is sent to the backend API, which returns a summary.
   - The summary is displayed in the extension panel.
2. **Take Notes:**
   - Choose a color from the color picker above the note textarea.
   - Write your note and click "Save".
   - The note appears below, highlighted with your chosen color.
   - All notes are saved in localStorage and persist across sessions.

## Setup & Installation
1. **Clone the Repository:**
   ```bash
   git clone <repo-url>
   ```
2. **Load the Extension in Chrome:**
   - Go to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the project directory.
3. **Backend:**
   - The extension expects the backend API to be running at `https://ai-summarizer-0d4c.onrender.com/api/research/process`.
   - (Optional) Deploy your own backend using the provided Spring Boot code and Dockerfile.

## Completed Features
- [x] Colored note display with user-selected tags
- [x] Summary length options (short/medium/detailed)
- [x] Citation & source mode (displayed with notes, not sent to backend)
- [x] Summary history & search (last 30 summaries, keyword search, copy to clipboard)
- [x] Note versioning/history (view previous versions of notes with timestamp)
- [x] Summarize selected text using AI backend
- [x] Write, save, and display personal notes
- [x] Notes stored and loaded from localStorage
- [x] Topic Organizer (Auto Categorize Notes)

## Screenshots

![Promo Screenshot](images/promo.png)

## License
MIT
