import { Home, FileText, CheckCircle, Users, BarChart3, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "대시보드", active: true },
  { icon: FileText, label: "문서 관리", active: false },
  { icon: CheckCircle, label: "결재 관리", active: false },
  { icon: Users, label: "사용자 관리", active: false },
  { icon: BarChart3, label: "통계/리포트", active: false },
  { icon: Settings, label: "설정", active: false },
]

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-4 space-y-2">
        <Button className="w-full justify-start gap-2 mb-4" size="sm">
          <Plus className="h-4 w-4" />새 문서 작성
        </Button>

        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                item.active && "bg-sidebar-primary text-sidebar-primary-foreground",
              )}
              size="sm"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
