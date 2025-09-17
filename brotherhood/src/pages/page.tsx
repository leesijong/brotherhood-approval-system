import { Search, Bell, Settings, Plus, FileText, Clock, CheckCircle, Users, BarChart3, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-primary">내부결제 시스템</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="문서 검색..." className="pl-10 w-80 bg-input border-border" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-0 h-5">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                김
              </div>
              <span className="font-medium">김관리자</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Button variant="default" className="w-full justify-start gap-3 bg-primary text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              대시보드
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <FileText className="w-4 h-4" />
              문서 관리
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <CheckCircle className="w-4 h-4" />
              결재 관리
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users className="w-4 h-4" />
              사용자 관리
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Calendar className="w-4 h-4" />
              통계/리포트
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="w-4 h-4" />
              설정
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">대시보드</h1>
                <p className="text-muted-foreground">오늘의 업무 현황을 확인하세요</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />새 문서 작성
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">내 문서</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">12</div>
                  <p className="text-xs text-muted-foreground">전월 대비 +2</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">결재 대기</CardTitle>
                  <Clock className="w-4 h-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <p className="text-xs text-muted-foreground">긴급 1건 포함</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">승인 완료</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">8</div>
                  <p className="text-xs text-muted-foreground">이번 주 완료</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Documents */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-card-foreground">최근 문서</CardTitle>
                  <CardDescription>최근 작성된 문서 목록</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">경비 신청서</p>
                        <p className="text-sm text-muted-foreground">2024-01-15</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      진행중
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">회의록</p>
                        <p className="text-sm text-muted-foreground">2024-01-14</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      승인
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-card-foreground">결재 대기 목록</CardTitle>
                  <CardDescription>승인이 필요한 문서</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">경비 신청서 - 긴급</h4>
                      <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                        긴급
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      김사원 (요한) → 이사장 (마리아) → 박부장 (요셉)
                    </p>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      결재하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
