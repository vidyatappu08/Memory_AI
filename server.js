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

app.options('*', cors())
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))