import Navbar from '@/components/complex/navbar'

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
