const STORAGE_KEY = 'mend-ai_api_key'

function getEnvKey() {
  return import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || ''
}

export function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getApiKey() {
  const env = getEnvKey()
  if (env) return env
  const stored = getStored()
  return stored?.key || ''
}

export function getProviderId() {
  const stored = getStored()
  return stored?.provider || null
}

export function setApiKey(key, provider) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, provider }))
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKey() {
  return !!getApiKey()
}
