const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const FREE_SESSIONS = 1;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getUser(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function getUserProfile(userId) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

app.post("/api/chat", async (req, res) => {
  const user = await getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Please log in to continue." });

  const profile = await getUserProfile(user.id);
  if (!profile) return res.status(400).json({ error: "User profile not found." });

  const tier = profile.tier || "free";
  const isPro = tier === "pro" || tier === "proplus";
  const isProPlus = tier === "proplus";

  if (!isPro && profile.sessions_used >= FREE_SESSIONS) {
    return res.status(403).json({ error: "free_limit_reached" });
  }

  const { system, user: userPrompt, countSession } = req.body;
  if (!system || !userPrompt) return res.status(400).json({ error: "Missing prompts" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_API_KEY },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1500,
        messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "AI error" });

    if (countSession && !isPro) {
      await supabase.from("profiles").update({ sessions_used: profile.sessions_used + 1 }).eq("id", user.id);
    }

    res.json({ text: data.choices[0].message.content, tier, isPro, isProPlus });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.post("/api/init-profile", async (req, res) => {
  const user = await getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Not logged in" });
  const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!existing) {
    await supabase.from("profiles").insert({ id: user.id, tier: "free", sessions_used: 0 });
  }
  res.json({ ok: true });
});

app.get("/api/me", async (req, res) => {
  const user = await getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Not logged in" });
  const profile = await getUserProfile(user.id);
  const tier = profile?.tier || "free";
  res.json({
    email: user.email,
    tier,
    isPro: tier === "pro" || tier === "proplus",
    isProPlus: tier === "proplus",
    sessions_used: profile?.sessions_used || 0
  });
});

app.post("/api/gumroad-webhook", express.urlencoded({ extended: true }), async (req, res) => {
  const { email, permalink, subscription_ended_at } = req.body;
  if (!email) return res.status(400).send("No email");

  const ended = !!subscription_ended_at;
  const isProPlus = permalink && permalink.includes("proplus");
  const tier = ended ? "free" : isProPlus ? "proplus" : "pro";

  const { data: users } = await supabase.auth.admin.listUsers();
  const matchedUser = users?.users?.find(u => u.email === email);
  if (!matchedUser) return res.status(200).send("User not found");

  await supabase.from("profiles").update({ tier }).eq("id", matchedUser.id);
  res.status(200).send("OK");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`InterviewAce running on port ${PORT}`));
