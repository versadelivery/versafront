"use client"

import ProtectedRoute from '@/components/protected-route'

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </ProtectedRoute>
  )
}
