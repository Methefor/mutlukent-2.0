<<<<<<< HEAD
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getBranches } from '@/lib/actions/branches'
import { X } from 'lucide-react'

interface Branch {
  id: string
  name: string
}

function ReportFiltersContent({
  defaultDateFrom,
  defaultDateTo,
  defaultBranchId,
}: {
  defaultDateFrom?: string
  defaultDateTo?: string
  defaultBranchId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateFrom, setDateFrom] = useState(defaultDateFrom || '')
  const [dateTo, setDateTo] = useState(defaultDateTo || '')
  const [branchId, setBranchId] = useState(defaultBranchId || '')
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches()
        if (Array.isArray(response)) {
          setBranches(response)
          console.log('Available branches:', response)
        } else {
          setBranches([])
          console.log('Available branches: unexpected response', response)
        }
      } catch (err) {
        console.error('Error fetching branches:', err)
        setBranches([])
      }
    }
    fetchBranches()
  }, [])

  useEffect(() => {
    console.log('Current filters:', { dateFrom, dateTo, branchId })
  }, [dateFrom, dateTo, branchId])

  const handleFilter = () => {
    const params = new URLSearchParams()
    params.set('page', '1') // Reset to page 1 when filtering

    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (branchId) params.set('branchId', branchId)

    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setDateFrom('')
    setDateTo('')
    setBranchId('')
    router.push('?page=1')
  }

  const hasFilters = dateFrom || dateTo || branchId

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom" className="text-sm font-medium">
            Başlangıç Tarihi
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo" className="text-sm font-medium">
            Bitiş Tarihi
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch" className="text-sm font-medium">
            Şube
          </Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger id="branch" className="h-10">
              <SelectValue placeholder="Tüm Şubeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Şubeler</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={handleFilter}
            className="h-10 flex-1"
            variant="default"
          >
            Filtrele
          </Button>
          {hasFilters && (
            <Button
              onClick={handleClear}
              className="h-10"
              variant="outline"
              size="icon"
              title="Filtreleri Temizle"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReportFilters({
  defaultDateFrom,
  defaultDateTo,
  defaultBranchId,
}: {
  defaultDateFrom?: string
  defaultDateTo?: string
  defaultBranchId?: string
}) {
  return (
    <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted" />}>
      <ReportFiltersContent
        defaultDateFrom={defaultDateFrom}
        defaultDateTo={defaultDateTo}
        defaultBranchId={defaultBranchId}
      />
    </Suspense>
  )
=======
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
>>>>>>> 0b2b8c47afe27ca45005f53f2b338165629c90e2
}
