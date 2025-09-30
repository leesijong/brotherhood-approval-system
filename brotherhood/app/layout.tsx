import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/providers/AuthProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { ToastProviderComponent } from "@/components/Toast"

export const metadata: Metadata = {
  title: "Brotherhood Approval System",
  description: "Brotherhood Approval System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProviderComponent>
              {children}
            </ToastProviderComponent>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}