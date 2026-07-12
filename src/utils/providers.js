export const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    keyPrefix: 'gsk_',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    format: 'openai',
    docsUrl: 'https://console.groq.com',
    description: 'Fast, free LLM inference'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '◈',
    keyPrefix: 'sk-',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    format: 'openai',
    docsUrl: 'https://platform.openai.com/api-keys',
    description: 'Industry-standard LLM API'
  },
  {
    id: 'openai_proj',
    name: 'OpenAI',
    icon: '◈',
    keyPrefix: 'sk-proj-',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    format: 'openai',
    docsUrl: 'https://platform.openai.com/api-keys',
    description: 'OpenAI project API key'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '◆',
    keyPrefix: 'sk-ant-',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
    format: 'anthropic',
    docsUrl: 'https://console.anthropic.com',
    description: 'Claude by Anthropic'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: '✦',
    keyPrefix: 'AIza',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash',
    format: 'google',
    docsUrl: 'https://aistudio.google.com/apikey',
    description: 'Gemini from Google'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '⊛',
    keyPrefix: 'sk-',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    format: 'openai',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    description: 'DeepSeek Chat API'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '◎',
    keyPrefix: 'sk-or-',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'anthropic/claude-3.5-sonnet',
    format: 'openai',
    docsUrl: 'https://openrouter.ai/keys',
    description: 'Multi-model router'
  },
  {
    id: 'together',
    name: 'Together AI',
    icon: '▣',
    keyPrefix: 'tgp-',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    format: 'openai',
    docsUrl: 'https://api.together.ai/settings/api-keys',
    description: 'Open-source model hosting'
  }
]

const FALLBACK_PROVIDER = PROVIDERS[0]

export function detectProvider(key) {
  if (!key) return FALLBACK_PROVIDER
  const sorted = [...PROVIDERS].sort((a, b) => b.keyPrefix.length - a.keyPrefix.length)
  for (const p of sorted) {
    if (key.startsWith(p.keyPrefix)) return p
  }
  return FALLBACK_PROVIDER
}

export function getEnvProvider() {
  if (import.meta.env.VITE_GROQ_API_KEY) return PROVIDERS[0]
  if (import.meta.env.VITE_OPENAI_API_KEY) return PROVIDERS[1]
  return null
}

export function getDefaultModel(provider) {
  return provider?.model || 'llama-3.3-70b-versatile'
}

export async function extractContent(data, format) {
  switch (format) {
    case 'anthropic':
      return data.content?.[0]?.text || ''
    case 'google':
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    case 'openai':
    default:
      return data.choices?.[0]?.message?.content || ''
  }
}

export function buildRequestBody(provider, messages) {
  const body = {
    messages,
    temperature: 0.2,
    max_tokens: 3000
  }

  switch (provider.format) {
    case 'anthropic':
      return {
        model: provider.model,
        max_tokens: 3000,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content
        })),
        system: messages.find(m => m.role === 'system')?.content
      }
    case 'google':
      return {
        contents: [{
          parts: messages.map(m => ({ text: m.content }))
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3000
        }
      }
    case 'openai':
    default:
      return {
        ...body,
        model: provider.model
      }
  }
}

export function buildHeaders(provider, key) {
  switch (provider.format) {
    case 'anthropic':
      return {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      }
    case 'google':
      return {
        'Content-Type': 'application/json'
      }
    case 'openai':
    default:
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      }
  }
}

export function buildEndpoint(provider, key) {
  if (provider.format === 'google') {
    return `${provider.endpoint}?key=${key}`
  }
  return provider.endpoint
}
