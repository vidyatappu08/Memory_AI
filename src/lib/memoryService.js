import { API_URL } from './config'
import { supabase } from './supabase'

async function generateTags(content) {
  try {
    const response = await fetch(`${API_URL}/api/tags`, { 
    method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content })
    })
    const data = await response.json()
    return data.tags || ['#general']
  } catch (err) {
    return ['#general']
  }
}

export async function saveMemory(title, content, sourceType) {
  const tags = await generateTags(content)

  const { data: memory, error } = await supabase
    .from('memories')
    .insert({ title, content, source_type: sourceType, tags })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    throw error
  }

  return memory
}

export async function searchMemories(question) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .limit(5)

  if (error) throw error

  return data.map(d => ({
    chunk_text: d.content,
    memory_id: d.id
  }))
}