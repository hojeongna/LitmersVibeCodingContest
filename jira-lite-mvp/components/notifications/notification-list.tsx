'use client'

import { useNotifications } from '@/hooks/use-notifications'
import { NotificationItem } from './notification-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'

interface NotificationListProps {
  onClose: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, isLoading, markAsRead } = useNotifications()

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
    )
  }

  if (notifications.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
              <p>No notifications</p>
          </div>
      )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="flex flex-col">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onRead={markAsRead}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
