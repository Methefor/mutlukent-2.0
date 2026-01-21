'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Branch, getUserBranches } from '@/lib/actions/branches'
import { Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ReportFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '')
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '')
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get('branch') || '')
    const [branches, setBranches] = useState<Branch[]>([])

    useEffect(() => {
        async function fetchBranches() {
            const data = await getUserBranches()
            setBranches(data)
        }
        fetchBranches()
    }, [])

    const handleFilter = () => {
        const params = new URLSearchParams()
        
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        if (selectedBranch) params.set('branch', selectedBranch)
        
        router.push(`/dashboard/reports/list?${params.toString()}`)
    }

    const handleClear = () => {
        setDateFrom('')
        setDateTo('')
        setSelectedBranch('')
        router.push('/dashboard/reports/list')
    }

    return (
        <div className="rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-4">
                {/* Başlangıç Tarihi */}
                <div className="space-y-2">
                    <Label htmlFor="dateFrom">Başlangıç Tarihi</Label>
                    <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                {/* Bitiş Tarihi */}
                <div className="space-y-2">
                    <Label htmlFor="dateTo">Bitiş Tarihi</Label>
                    <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                {/* Şube Seçimi */}
                <div className="space-y-2">
                    <Label htmlFor="branch">Şube</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger id="branch">
                            <SelectValue placeholder="Tüm şubeler" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tüm şubeler</SelectItem>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Butonlar */}
                <div className="flex items-end gap-2">
                    <Button onClick={handleFilter} className="flex-1">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrele
                    </Button>
                    <Button onClick={handleClear} variant="outline">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
