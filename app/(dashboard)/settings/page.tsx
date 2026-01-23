import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>İsim</Label>
                <Input defaultValue="Test Admin" disabled />
              </div>
              <div>
                <Label>E-posta</Label>
                <Input defaultValue="admin@mutlukent.com" disabled />
              </div>
              <div>
                <Label>Rol</Label>
                <Input defaultValue="Yönetici" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Şifre değiştirme özelliği yakında eklenecek.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
