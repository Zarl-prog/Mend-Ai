const STORAGE_KEY = 'mend-ai_groq_key'

function getEnvKey() {
  return import.meta.env.VITE_GROQ_API_KEY || ''
}

export function getApiKey() {
  return getEnvKey() || localStorage.getItem(STORAGE_KEY) || ''
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKey() {
  return !!getApiKey()
}
