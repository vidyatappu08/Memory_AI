import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

async function callGroq(messages) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 1000
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content
}

app.get('/', (req, res) => {
  res.json({ status: 'Server is running!' })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const text = await callGroq(messages)
    res.json({ content: [{ text }] })
  } catch (err) {
    console.error('Chat error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/tags', async (req, res) => {
  try {
    const { content } = req.body
    const text = await callGroq([{
      role: 'user',
      content: `Analyze this text and return ONLY a JSON array of 3-5 short tags. No markdown, no backticks, just the array. Example: ["#design","#deadline","#urgent"]\n\nText: ${content.slice(0, 500)}`
    }])
    const cleaned = text.replace(/```json|```/g, '').trim()
    const tags = JSON.parse(cleaned)
    res.json({ tags })
  } catch (err) {
    res.json({ tags: ['#general'] })
  }
})

app.post('/api/action-items', async (req, res) => {
  try {
    const { memories } = req.body
    const memoriesText = memories.map(m =>
      `SOURCE: ${m.title}\n${m.content}`
    ).join('\n\n---\n\n')

    const text = await callGroq([{
      role: 'user',
      content: `Extract ALL action items from these team memories. Return ONLY a JSON array, no markdown, no backticks.\n\nEach item must have: task, owner, deadline, priority (HIGH/MEDIUM/LOW), source.\n\nExample: [{"task":"Fix bug","owner":"John","deadline":"May 17","priority":"HIGH","source":"Bug Report"}]\n\nMEMORIES:\n${memoriesText.slice(0, 3000)}`
    }])

    const cleaned = text.replace(/```json|```/g, '').trim()
    const items = JSON.parse(cleaned)
    res.json({ items })
  } catch (err) {
    console.error('Action items error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001

app.post('/api/health-score', async (req, res) => {
  try {
    const { memories } = req.body

    const memoriesText = memories.map(m =>
      `SOURCE: ${m.title}\nDATE: ${m.created_at}\n${m.content}`
    ).join('\n\n---\n\n')

    const text = await callGroq([{
      role: 'user',
      content: `Analyze these team memories and return ONLY a JSON object, no markdown, no backticks.

Return exactly this structure:
{
  "score": 72,
  "grade": "B",
  "summary": "Your team has good memory habits but some tasks are falling through the cracks.",
  "issues": [
    { "type": "unresolved_task", "severity": "high", "description": "Password reset bug assigned to John has no follow-up" },
    { "type": "missed_deadline", "severity": "high", "description": "Sarah's login page was due June 1st with no completion noted" },
    { "type": "contradiction", "severity": "medium", "description": "Button color changed from green to blue but old designs still reference green" },
    { "type": "knowledge_gap", "severity": "low", "description": "Stripe integration mentioned 3 times but never documented" }
  ],
  "positives": [
    "Team is consistently documenting decisions",
    "Action items are being assigned with clear owners",
    "Client feedback is being recorded"
  ],
  "stats": {
    "total_decisions": 8,
    "unresolved_tasks": 3,
    "contradictions": 1,
    "knowledge_gaps": 2
  }
}

Score rules:
- Start at 100
- Deduct 10 for each high severity issue
- Deduct 5 for each medium severity issue  
- Deduct 2 for each low severity issue
- Grade: 90-100=A, 80-89=B+, 70-79=B, 60-69=C, below 60=D

TEAM MEMORIES:
${memoriesText.slice(0, 4000)}`
    }])

    const cleaned = text.replace(/```json|```/g, '').trim()
    const health = JSON.parse(cleaned)
    res.json(health)
  } catch (err) {
    console.error('Health score error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
app.post('/api/contradictions', async (req, res) => {
  try {
    const { memories } = req.body

    const memoriesText = memories.map(m =>
      `SOURCE: ${m.title}\nDATE: ${m.created_at}\n${m.content}`
    ).join('\n\n---\n\n')

    const text = await callGroq([{
      role: 'user',
      content: `Find ALL contradictions and conflicts in these team memories. Look for:
- Decisions that were changed without documentation
- Different people saying opposite things
- Tasks assigned to different people in different meetings
- Dates or deadlines that conflict
- Technical decisions that contradict each other

Return ONLY a JSON array, no markdown, no backticks.

Each contradiction must have:
- topic: what the contradiction is about (short, 3-5 words)
- statement_a: first statement (include source)
- statement_b: conflicting statement (include source)
- severity: "high", "medium", or "low"
- recommendation: how to resolve this contradiction

Example:
[{
  "topic": "Payment button color",
  "statement_a": "Design Review (May 12): Primary color changed to blue across all CTAs",
  "statement_b": "Sprint Planning (May 10): Payment page UI uses green buttons",
  "severity": "high",
  "recommendation": "Hold a quick sync to confirm the final color decision and update all design files"
}]

If no contradictions found, return empty array: []

TEAM MEMORIES:
${memoriesText.slice(0, 4000)}`
    }])

    const cleaned = text.replace(/```json|```/g, '').trim()
    const contradictions = JSON.parse(cleaned)
    res.json({ contradictions })
  } catch (err) {
    console.error('Contradictions error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))