

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/devlayers/logo" // Adjust path if needed

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Check for token in localStorage
    const token = localStorage.getItem("token")

    if (!token) {
      // 2. If no token, redirect to login immediately
      router.replace("/login")
    } else {
      // 3. If token exists, stop loading and show content
      setIsLoading(false)
    }
  }, [router])

  // 4. Show a loading screen while checking auth
  // This prevents the "flash" of protected content
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="animate-pulse">
          <Logo />
        </div>
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // 5. Render the protected page
  return <>{children}</>
}