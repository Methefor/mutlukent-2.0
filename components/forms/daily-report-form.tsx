"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Upload, Banknote, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createDailyReport } from "@/lib/actions/reports"
import { Branch } from "@/lib/actions/branches"

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Helper to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
    }).format(value)
}

const formSchema = z.object({
    branch_id: z.string().uuid("Şube seçimi zorunludur."),
    report_date: z.date({
        required_error: "Rapor tarihi gereklidir.",
    }),
    cash_sales: z.coerce.number().min(0, "Negatif değer girilemez."),
    credit_card_sales: z.coerce.number().min(0, "Negatif değer girilemez."),
    notes: z.string().optional(),
    photo: z
        .custom<FileList>()
        .optional()
        .refine((files) => !files || files.length === 0 || files.length === 1, "Sadece 1 dosya yükleyebilirsiniz.")
        .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, "Dosya boyutu 5MB'dan küçük olmalı.")
        .refine(
            (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "Sadece .jpg, .jpeg, .png ve .webp formatları kabul edilir."
        ),
})

interface DailyReportFormProps {
    branches?: Branch[]
    userRole?: string
    userBranchId?: string
    userBranchName?: string
}

export function DailyReportForm({ branches = [], userRole, userBranchId, userBranchName }: DailyReportFormProps) {
    const [isPending, startTransition] = useTransition()

    // Determine if user is manager or coordinator
    const isManagerOrCoordinator = userRole === 'general_manager' || userRole === 'coordinator'
    const isBranchManager = userRole === 'branch_manager'

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            branch_id: isBranchManager && userBranchId ? userBranchId : "",
            report_date: new Date(),
            cash_sales: 0,
            credit_card_sales: 0,
            notes: "",
        },
    })

    const cashSales = form.watch("cash_sales")
    const creditCardSales = form.watch("credit_card_sales")
    const totalSales = (Number(cashSales) || 0) + (Number(creditCardSales) || 0)

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("branch_id", values.branch_id)
            formData.append("report_date", values.report_date.toISOString())
            formData.append("cash_sales", values.cash_sales.toString())
            formData.append("credit_card_sales", values.credit_card_sales.toString())
            formData.append("notes", values.notes || "")

            if (values.photo && values.photo.length > 0) {
                formData.append("photo", values.photo[0])
            }

            const result = await createDailyReport({ message: null, errors: {} }, formData)

            if (result.message === 'success') {
                toast.success("Z-raporu başarıyla kaydedildi!")
                form.reset({
                    branch_id: isBranchManager && userBranchId ? userBranchId : "",
                    report_date: new Date(),
                    cash_sales: 0,
                    credit_card_sales: 0,
                    notes: "",
                })
            } else if (result.errors) {
                if (result.errors.branch_id) form.setError("branch_id", { message: result.errors.branch_id[0] })
                if (result.errors.report_date) form.setError("report_date", { message: result.errors.report_date[0] })
                if (result.errors.cash_sales) form.setError("cash_sales", { message: result.errors.cash_sales[0] })
                toast.error("Formda hatalar var, lütfen kontrol ediniz.")
            } else {
                toast.error(result.message || "Bir hata oluştu.")
            }
        })
    }

    function onInvalid(errors: any) {
        console.log("Form Validation Errors:", errors)
        if (errors.branch_id) {
            toast.error(errors.branch_id.message || "Şube bilgisi eksik. Lütfen sayfayı yenileyin veya yöneticiyle görüşün.")
        } else {
            toast.error("Lütfen formdaki eksik alanları doldurunuz.")
        }
    }

    // Show warning if branch manager has no branch assigned
    if (isBranchManager && !userBranchId) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                <h3 className="font-semibold text-lg mb-2">Hata: Şube Tanımlanmamış</h3>
                <p>Kullanıcı hesabınıza tanımlanmış bir şube bulunamadı. Rapor girişi yapmak için lütfen sistem yöneticisi ile iletişime geçiniz.</p>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                {/* Branch Selection Logic */}
                {isManagerOrCoordinator && (
                    <FormField
                        control={form.control}
                        name="branch_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Şube Seçiniz</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Şube seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {branches.map(branch => (
                                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="report_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Rapor Tarihi</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Tarih seçiniz</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="cash_sales"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nakit Satış</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" className="pl-9" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="credit_card_sales"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kredi Kartı</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" className="pl-9" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Toplam Satış:</span>
                        <span>{formatCurrency(totalSales)}</span>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notlar</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Günün özeti, karşılaşılan sorunlar vb."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Opsiyonel olarak gün ile ilgili notlar ekleyebilirsiniz.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Rapor Fotoğrafı (Opsiyonel)</FormLabel>
                            <FormControl>
                                <Input
                                    {...fieldProps}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        onChange(event.target.files)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? "Kaydediliyor..." : "Raporu Kaydet"}
                </Button>
            </form>
        </Form>
    )
}
