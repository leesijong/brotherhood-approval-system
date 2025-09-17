import { Card, CardContent } from "@/components/ui/card"
import { FileText, Clock, CheckCircle } from "lucide-react"

const stats = [
  {
    title: "내 문서",
    value: "12",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    title: "결재 대기",
    value: "3",
    icon: Clock,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    title: "승인 완료",
    value: "8",
    icon: CheckCircle,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`hover:shadow-lg transition-all duration-200 ${stat.borderColor} border-2`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                <p className="text-3xl font-semibold text-card-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
