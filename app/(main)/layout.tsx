import Navbar from '@/components/web/navbar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <section>
      <Navbar />
      {children}
    </section>
  )
}
