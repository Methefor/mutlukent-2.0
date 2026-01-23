import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DailyReportForm } from "@/components/forms/daily-report-form"
import { getBranches } from "@/lib/actions/branches"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Yeni Z-Raporu | Mutlukent",
  description: "Yeni bir Z-raporu oluştur",
}

export default async function NewReportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const branches = await getBranches()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Yeni Z-Raporu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Günlük satış verilerini girerek yeni bir Z-raporu oluşturun
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapor Formu</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyReportForm branches={branches} />
        </CardContent>
      </Card>
    </div>
  )
}
