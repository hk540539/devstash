import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams

  if (!token) {
    return <VerifyResult success={false} message="Missing verification token." />
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return <VerifyResult success={false} message="Invalid or already used verification link." />
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return <VerifyResult success={false} message="This verification link has expired. Please register again." />
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ])

  return <VerifyResult success message="Your email has been verified. You can now sign in." />
}

function VerifyResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold mx-auto">
          S
        </div>
        <h1 className="text-2xl font-bold">
          {success ? 'Email verified!' : 'Verification failed'}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/sign-in">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </div>
    </div>
  )
}
