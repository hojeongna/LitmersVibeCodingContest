import { Loader2 } from 'lucide-react'

export function AILoading({ message = "AI is generating..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-indigo-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm font-medium animate-pulse">{message}</p>
    </div>
  )
}
