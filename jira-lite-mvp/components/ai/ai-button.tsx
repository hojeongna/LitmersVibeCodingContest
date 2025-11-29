import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  children: React.ReactNode
}

export function AIButton({ className, isLoading, children, disabled, ...props }: AIButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white border-0 transition-all duration-300",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      {children}
    </Button>
  )
}
