import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { BrandLogo } from '@/components/ui/brand-logo'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  console.log('Is admin in dashboard layout:', profile?.role === 'admin')
  console.log('Server-side profile data:', profile)
  console.log('Is admin on server:', profile?.role === 'admin')

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-naijaplay-green text-white py-4 px-6 shadow-md">
          <div className="flex items-center">
            <BrandLogo variant="default" onDarkBackground={true} />
            <span className="ml-2 text-xl font-bold">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

