"use client"

import { useAuth } from '@/lib/auth/context'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Hoş geldin, {user?.email}</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Kullanıcı Bilgileri:</h2>
        <pre className="mt-2 p-4 bg-gray-100 dark:bg-zinc-900 rounded overflow-auto max-h-96 text-xs text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  )
}
