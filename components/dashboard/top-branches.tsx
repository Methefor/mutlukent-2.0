import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BranchSales } from "@/lib/actions/dashboard"
import { Progress } from "@/components/ui/progress"

interface TopBranchesProps {
    data: BranchSales[]
}

export function TopBranches({ data }: TopBranchesProps) {
    const maxSales = Math.max(...data.map(d => d.amount), 1)

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>En Çok Satan Şubeler (Bu Ay)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">{item.branchName}</p>
                                    <span className="text-sm text-muted-foreground">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.amount)}
                                    </span>
                                </div>
                                <Progress value={(item.amount / maxSales) * 100} className="h-2" />
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            Henüz veri yok.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
