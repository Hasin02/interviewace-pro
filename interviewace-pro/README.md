# InterviewAce — Deployment Guide

## Folder structure
```
interviewace-pro/
├── server.js          ← backend (hides your API key)
├── package.json
└── public/
    └── index.html     ← your website
```

## Deploy to Render.com (free)

1. Push this entire folder to a NEW GitHub repo called `interviewace-pro`
2. Go to render.com → sign up with GitHub
3. Click "New" → "Web Service" → connect your `interviewace-pro` repo
4. Fill in these settings:
   - Name: interviewace
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
5. Click "Environment" → "Add Environment Variable":
   - Key:   GROQ_API_KEY
   - Value: your gsk_... key from console.groq.com
6. Click "Create Web Service"

Render gives you a free URL like: https://interviewace.onrender.com

## Replace Gumroad link
In public/index.html, find:
  YOUR_GUMROAD_LINK_HERE
Replace with your actual Gumroad product link.
