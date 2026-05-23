
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

export function chunkText(text, chunkSize = 500) {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const chunks = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize && current) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += ' ' + sentence
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

export async function getEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })
  const data = await response.json()
  return data.data[0].embedding
}