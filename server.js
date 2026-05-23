import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
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

// Chat endpoint
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

// Tags endpoint
app.post('/api/tags', async (req, res) => {
  try {
    const { content } = req.body
    const text = await callGroq([{
      role: 'user',
      content: `Analyze this text and return ONLY a JSON array of 3-5 short tags (single words or short phrases).
Choose from categories like: #bug, #design, #deadline, #decision, #task, #meeting, #feature, #urgent, #idea, #feedback, or create relevant ones.
Return ONLY the JSON array, nothing else. Example: ["#design", "#deadline", "#urgent"]

Text: ${content.slice(0, 500)}`
    }])

    const cleaned = text.replace(/```json|```/g, '').trim()
    const tags = JSON.parse(cleaned)
    res.json({ tags })
  } catch (err) {
    console.error('Tags error:', err.message)
    res.json({ tags: ['#general'] })
  }
})

// Action Items endpoint
app.post('/api/action-items', async (req, res) => {
  try {
    const { memories } = req.body

    const memoriesText = memories.map(m =>
      `SOURCE: ${m.title}\n${m.content}`
    ).join('\n\n---\n\n')

    const text = await callGroq([{
      role: 'user',
      content: `Extract ALL action items, tasks, and assignments from these team memories.
Return ONLY a JSON array, nothing else. No markdown, no backticks.

Each item must have:
- task: what needs to be done
- owner: person responsible (or "Unassigned")
- deadline: due date if mentioned (or "No deadline")
- priority: "HIGH", "MEDIUM", or "LOW"
- source: which meeting/document it came from

Example format:
[{"task":"Fix login bug","owner":"John","deadline":"May 17","priority":"HIGH","source":"Bug Report"}]

MEMORIES:
${memoriesText.slice(0, 3000)}`
    }])

    const cleaned = text.replace(/```json|```/g, '').trim()
    const items = JSON.parse(cleaned)
    res.json({ items })
  } catch (err) {
    console.error('Action items error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
app.listen(3001, () => console.log('Server running on port 3001'))