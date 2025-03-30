"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import { User, Bell, Moon, Shield, CheckCircle } from "lucide-react"
import { Sun } from "@/components/sun"
import { Laptop } from "@/components/laptop"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error.message)
          throw error
        }

        if (!data.session) {
          console.log("No active session found, redirecting to login")
          window.location.href = "/login"
          return
        }

        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) {
          console.log("No user found, redirecting to login")
          window.location.href = "/login"
          return
        }

        console.log("User authenticated:", userData.user.id)
        setUser(userData.user)

        // Fetch profile data
        await fetchProfile(userData.user.id)
      } catch (error: any) {
        console.error("Authentication error:", error.message)
        toast({
          title: "Error autentikasi",
          description: error.message,
          variant: "destructive",
        })
        window.location.href = "/login"
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [toast])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      setProfile(data)
      setFullName(data?.full_name || "")
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error mengambil profil",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateProfile = async () => {
    if (!user) return

    setSaving(true)
    setSuccess(false)

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) {
        throw profileError
      }

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (userError) {
        throw userError
      }

      toast({
        title: "Profil diperbarui",
        description: "Informasi profil Anda telah berhasil diperbarui.",
      })

      setSuccess(true)

      // Refresh user data
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setUser(userData.user)
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error memperbarui profil",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader user={user} />
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Pengaturan</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto p-0 bg-transparent">
                <TabsTrigger value="profile" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifikasi
                </TabsTrigger>
                <TabsTrigger value="appearance" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Moon className="h-4 w-4 mr-2" />
                  Tampilan
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Shield className="h-4 w-4 mr-2" />
                  Keamanan
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>Kelola informasi profil Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Profil berhasil diperbarui!</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                      <p className="text-sm text-muted-foreground">Email Anda tidak dapat diubah</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={updateProfile} disabled={saving}>
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifikasi</CardTitle>
                    <CardDescription>Konfigurasikan bagaimana Anda ingin menerima notifikasi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Notifikasi Email</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Terima notifikasi melalui email
                        </span>
                      </Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="activity-reminders" className="flex flex-col space-y-1">
                        <span>Pengingat Aktivitas</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Terima pengingat untuk mencatat aktivitas Anda
                        </span>
                      </Label>
                      <Switch id="activity-reminders" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="achievement-notifications" className="flex flex-col space-y-1">
                        <span>Notifikasi Pencapaian</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Terima notifikasi saat Anda mencapai tujuan
                        </span>
                      </Label>
                      <Switch id="achievement-notifications" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                        <span>Email Pemasaran</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Terima email tentang fitur dan pembaruan baru
                        </span>
                      </Label>
                      <Switch id="marketing-emails" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Simpan Preferensi</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Tampilan</CardTitle>
                    <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="justify-start">
                          <Sun className="h-4 w-4 mr-2" />
                          Terang
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Moon className="h-4 w-4 mr-2" />
                          Gelap
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Laptop className="h-4 w-4 mr-2" />
                          Sistem
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Warna Aksen</Label>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-blue-500" />
                        <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer" />
                        <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer" />
                        <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer" />
                        <div className="h-8 w-8 rounded-full bg-yellow-500 cursor-pointer" />
                        <div className="h-8 w-8 rounded-full bg-pink-500 cursor-pointer" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="reduce-animations" className="flex flex-col space-y-1">
                        <span>Kurangi Animasi</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Kurangi animasi untuk performa yang lebih baik
                        </span>
                      </Label>
                      <Switch id="reduce-animations" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Simpan Preferensi</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Keamanan</CardTitle>
                    <CardDescription>Kelola pengaturan keamanan akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                      <Input id="current-password" type="password" placeholder="Masukkan kata sandi saat ini" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Kata Sandi Baru</Label>
                      <Input id="new-password" type="password" placeholder="Masukkan kata sandi baru" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
                      <Input id="confirm-password" type="password" placeholder="Konfirmasi kata sandi baru" />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="two-factor" className="flex flex-col space-y-1">
                        <span>Autentikasi Dua Faktor</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Aktifkan autentikasi dua faktor untuk keamanan tambahan
                        </span>
                      </Label>
                      <Switch id="two-factor" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Perbarui Kata Sandi</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

