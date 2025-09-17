import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const approvals = [
  {
    title: "경비 신청서 - 긴급",
    requester: "김사원 (요한)",
    arrow: "→",
    approver: "이과장 (마리아)",
    nextStep: "박부장 (요셉)",
    priority: "urgent",
  },
]

export function PendingApprovals() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">결재 대기 목록</CardTitle>
        <Button variant="outline" size="sm">
          전체하기
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <div key={index} className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-card-foreground">{approval.title}</h4>
                <Badge variant="destructive" className="text-xs">
                  긴급
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span>{approval.requester}</span>
                <span>{approval.arrow}</span>
                <span className="font-medium text-amber-700">{approval.approver}</span>
                <span>{approval.arrow}</span>
                <span>{approval.nextStep}</span>
              </div>

              <Button size="sm" className="w-full">
                결재하기
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
