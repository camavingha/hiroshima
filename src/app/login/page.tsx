'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // 1. Listen for changes in auth state (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/') // Redirect to homepage on success
        router.refresh() // Refresh the sidebar to show your email
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter">HIROSHIMA</h1>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-bold italic">Admin Access Only</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          view="sign_in" // 👈 Forces the view to ONLY show Login
          showLinks={false} // 👈 Deletes "Don't have an account? Sign Up" links
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'black',
                  brandAccent: '#333',
                },
                radii: {
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                }
              }
            }
          }}
          providers={[]} 
        />
        
        <p className="mt-8 text-center text-[10px] text-gray-300 uppercase tracking-widest">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}