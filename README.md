# Zoom Clone - Video Conferencing App

A full-stack, production-quality video conferencing platform inspired by Zoom, built with React, WebRTC, Node.js + Express, and SQLite.

## Features

- **Instant Meetings:** One-click instant meeting creation matching Zoom's dashboard UX.
- **Schedule Meetings:** Future scheduling functionality tracking meetings in the SQLite backend.
- **Join by ID:** Functional join flow with personal user names.
- **Real-Time Video (WebRTC):** Peer-to-peer WebRTC video and audio transmission built natively without heavy abstractions.
- **WebSockets Signaling:** Socket.io based signaling service handling Offers, Answers, and ICE Candidate exchanges seamlessly.
- **Zoom Aesthetic UI:** Dark mode meeting rooms, A/V toggle controls, responsive video grids matching Zoom layout rules.

## Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, React Router DOM, Lucide React (Icons).
- **Backend:** Node.js, Express, Socket.IO.
- **Database:** SQLite (using \`sqlite\` and \`sqlite3\` drivers).
- **Real-Time:** Raw RTCPeerConnection (WebRTC) and WebSockets.

## Requirements Environment

*Note on Architecture adaptation: To comply with deployment sandboxing rules (port 3000 Node environments), the tech stack was natively adapted from Python/FastAPI into an isomorphic Node/Express full-stack application relying on Esbuild. This ensures maximum compatibility and instant cold-starts while functionally delivering identical robust APIs and UI.*

## Installation & Running

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build and Start (Production Mode):
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

3. Developer Mode:
   \`\`\`bash
   npm run dev
   \`\`\`

## Using the Application
1. **Accessing Camera/Microphone:** The application will prompt for permissions upon entering a meeting. Ensure you accept to utilize the WebRTC connections.
2. **Opening multiple clients:** To test the video grid connectivity locally, open the provided Applet Cloud Run URL in two separate browser tabs and enter the same Meeting ID.
