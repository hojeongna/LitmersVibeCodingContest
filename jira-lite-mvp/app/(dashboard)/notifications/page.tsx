'use client'

import { useNotifications } from '@/hooks/use-notifications'
import { NotificationItem } from '@/components/notifications/notification-item'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCheck } from 'lucide-react'
import { Header } from '@/components/layout/header'

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="알림 센터" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">모든 알림</h2>
            {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    모두 읽음으로 표시
                </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-zinc-500">
              <p>알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-1 rounded-lg border bg-card">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
