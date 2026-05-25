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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))