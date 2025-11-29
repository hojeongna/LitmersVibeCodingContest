'use client'

import { Notification, NOTIFICATION_CONFIG } from '@/types/notification'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import * as Icons from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type as keyof typeof NOTIFICATION_CONFIG]
  const Icon = (config ? Icons[config.icon as keyof typeof Icons] : Icons.Bell) as React.ElementType

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
    // Navigate if needed (not implemented yet)
  }

  return (
    <div 
        className={cn(
            "flex gap-3 p-4 hover:bg-zinc-50 cursor-pointer transition-colors border-b last:border-0",
            !notification.read && "bg-blue-50/30"
        )}
        onClick={handleClick}
    >
      <div className="mt-1">
        {notification.actor ? (
             <Avatar className="h-8 w-8">
                <AvatarImage src={notification.actor.avatar_url || undefined} />
                <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
             </Avatar>
        ) : (
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", "bg-zinc-100")}>
                <Icon className="h-4 w-4 text-zinc-500" />
            </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
            {config?.title(notification.actor?.name)}
        </p>
        <p className="text-sm text-zinc-500 line-clamp-2">
            {notification.body}
        </p>
        <p className="text-xs text-zinc-400">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ko })}
        </p>
      </div>
      {!notification.read && (
          <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
      )}
    </div>
  )
}
