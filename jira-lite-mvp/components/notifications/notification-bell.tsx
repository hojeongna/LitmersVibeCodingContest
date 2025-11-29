'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationList } from './notification-list'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function NotificationBell() {
  const { unreadCount, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Optional: Mark all as read when closing? 
      // Or maybe just let user manually mark as read.
      // For now, let's keep it manual or per-item.
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-zinc-500" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white",
              unreadCount > 9 ? "h-4 w-4 -top-1 -right-1 flex items-center justify-center text-[10px] text-white ring-0" : ""
            )}>
              {unreadCount > 9 ? '9+' : ''}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-zinc-500 h-auto p-0 hover:text-zinc-900"
                onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <NotificationList onClose={() => setIsOpen(false)} />
        <div className="p-3 border-t">
          <Link
            href="/notifications"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={() => setIsOpen(false)}
          >
            View All Notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
