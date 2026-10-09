/** Auth screens: a centered card, no site header. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas px-4 py-12">
      {children}
    </main>
  )
}
