import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

const documents = [
  {
    title: "경비 신청서",
    status: "진행중",
    statusColor: "bg-amber-100 text-amber-800",
    date: "2024-01-15",
    author: "김관리자 (요한)",
  },
  {
    title: "회의록",
    status: "승인",
    statusColor: "bg-emerald-100 text-emerald-800",
    date: "2024-01-14",
    author: "이사원 (마리아)",
  },
]

export function RecentDocuments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">최근 문서</CardTitle>
        <Button variant="outline" size="sm">
          전체 보기
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground mb-1">{doc.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{doc.date}</span>
                  <span>{doc.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={doc.statusColor} variant="secondary">
                  {doc.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
