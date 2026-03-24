# InterviewAce — AI Mock Interview Coach

> Paste any job description. Get tailored interview questions. Receive instant AI feedback on your answers.

## What it does

InterviewAce helps job seekers practice interviews smarter:

- Paste any job description from any company
- Get 5 tailored questions — behavioral, technical, and situational
- Type your answers and receive instant feedback on what worked, what to improve, and a better version
- Get an overall score, top strength, key gap, and next step

No sign up. No API key. Just paste and practice.

## Live demo

[Your Render URL here]

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- AI: Groq API (Llama 3.3 70B)
- Hosting: Render.com

## Run locally

1. Clone the repo
git clone https://github.com/Hasin02/interviewace-pro

2. Install dependencies
npm install

3. Add your Groq API key
Create a .env file:
GROQ_API_KEY=gsk_...

4. Start the server
node server.js

5. Open in browser
http://localhost:3000

## Deploy to Render

1. Push this repo to GitHub
2. Go to render.com → New Web Service → connect repo
3. Build command: npm install
4. Start command: node server.js
5. Add environment variable: GROQ_API_KEY = your key
6. Deploy

## Built by

Hasin — aspiring AI Product Manager building in public.
