'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Branch } from '@/lib/actions/branches'
import { createUser, updateUser, User } from '@/lib/actions/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, PlusCircle } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const createFormSchema = z.object({
    full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir email adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    role: z.string().min(1, 'Rol seçimi zorunludur.'),
    branch_id: z.string().optional(),
})

const editFormSchema = z.object({
    full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir email adresi giriniz.'),
    password: z.string().optional().or(z.literal('')), // Optional for edit
    role: z.string().min(1, 'Rol seçimi zorunludur.'),
    branch_id: z.string().optional(),
})

interface UserDialogProps {
    branches: Branch[]
    user?: User
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'general_manager', label: 'Genel Müdür' },
    { value: 'coordinator', label: 'Koordinatör' },
    { value: 'branch_manager', label: 'Şube Müdürü' },
    { value: 'accountant', label: 'Muhasebe' },
    { value: 'warehouse_manager', label: 'Depo Sorumlusu' },
    { value: 'staff', label: 'Personel' },
]

export function UserDialog({ branches, user, open: controlledOpen, onOpenChange }: UserDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const isEdit = !!user
    const schema = isEdit ? editFormSchema : createFormSchema

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            full_name: user?.full_name || '',
            email: user?.email || '',
            password: '',
            role: user?.role_id || (user?.role ? ROLES.find(r => r.label === user.role || r.value === user.role)?.value : '') || '', 
            branch_id: user?.branch_id || undefined,
        },
    })

    // Reset form when user changes or modal opens
    useEffect(() => {
        if (isOpen) {
            // Try to resolve role value from role name if ID not present, fallback to empty
            const roleValue = user?.role_id || (user?.role ? ROLES.find(r => r.label === user.role || r.value === user.role)?.value : '') || ''
            
            form.reset({
                full_name: user?.full_name || '',
                email: user?.email || '',
                password: '',
                role: roleValue,
                branch_id: user?.branch_id || undefined,
            })
        }
    }, [user, isOpen, form])

    const selectedRole = form.watch('role')
    const showBranchSelect = ['branch_manager', 'staff'].includes(selectedRole)

    function onSubmit(values: z.infer<typeof schema>) {
        startTransition(async () => {
            try {
                if (!showBranchSelect) {
                    values.branch_id = undefined
                }

                let result
                if (isEdit && user) {
                    result = await updateUser(user.id, values as any)
                } else {
                    result = await createUser(values as any)
                }
                
                if (result.success) {
                    toast.success(isEdit ? 'Kullanıcı güncellendi.' : 'Kullanıcı oluşturuldu.')
                    setOpen(false)
                    if (!isEdit) form.reset()
                } else {
                    toast.error(result.message || 'Bir hata oluştu.')
                }
            } catch (error) {
                toast.error('Beklenmedik bir hata oluştu.')
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Yeni Kullanıcı
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Kullanıcı bilgilerini güncelleyin.' : 'Sisteme yeni bir kullanıcı eklemek için bilgileri doldurun.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ad Soyad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mehmet Yılmaz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="mehmet@ornek.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Şifre {isEdit && '(Değiştirmek istemiyorsanız boş bırakın)'}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Rol seçin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {showBranchSelect && (
                            <FormField
                                control={form.control}
                                name="branch_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Şube</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Şube seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id}>
                                                        {branch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Güncelle' : 'Oluştur'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
