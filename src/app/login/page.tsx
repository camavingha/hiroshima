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
      <div className="w-full max-w-md p-10 bg-surface rounded-[40px] shadow-2xl border border-dark-border">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground">HIROSHIMA</h1>
          <p className="text-muted text-xs mt-2 uppercase tracking-widest font-bold italic">Admin Access Only</p>
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
                  brand: '#569cd6',
                  brandAccent: '#4e8dc2',
                  inputBackground: '#3c3c3c',
                  inputBorder: '#474747',
                  inputText: '#d4d4d4',
                  inputPlaceholder: '#808080',
                  inputLabelText: '#808080',
                  defaultButtonBackground: '#569cd6',
                  defaultButtonText: '#ffffff',
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

        <p className="mt-8 text-center text-[10px] text-muted/50 uppercase tracking-widest">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}