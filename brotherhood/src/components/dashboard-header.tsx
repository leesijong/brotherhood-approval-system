import { Bell, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-sm border-b border-border">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium tracking-tight">내부결제 시스템</h1>
            <p className="text-sm opacity-85 mt-0.5">한국순교복자성직수도회</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 opacity-90" />
              <Badge variant="secondary" className="text-xs bg-white text-primary border-white/50">
                알림 (3)
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-90">
              <User className="h-4 w-4" />
              <span className="font-medium">김관리자 (요한)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
