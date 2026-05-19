import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Join the community</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to start contributing to the CA firms directory.
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
