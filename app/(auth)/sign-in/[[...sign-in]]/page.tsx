import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Sign in to contribute</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Help improve the CA firms directory by contributing missing information.
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
