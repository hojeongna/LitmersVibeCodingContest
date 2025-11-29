import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  // In development, we might not want to crash immediately if the key is missing, 
  // but for this task, AC says "API 키 환경변수 검증"
  // We'll log an error instead of throwing at top level to avoid build failures if env is missing during build
  console.error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Prevent crash on init, but calls will fail
})

export const checkApiKey = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }
}
