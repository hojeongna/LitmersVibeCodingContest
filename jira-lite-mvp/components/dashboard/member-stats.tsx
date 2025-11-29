import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MemberStatsProps {
  members: Array<{
    user_id: string
    name: string
    avatar_url: string | null
    issue_count: number
  }>
}

export function MemberStats({ members }: MemberStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">멤버별 담당 이슈</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{member.name ? member.name.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
              <div className="text-sm font-bold bg-zinc-100 px-2 py-1 rounded-full">
                {member.issue_count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
