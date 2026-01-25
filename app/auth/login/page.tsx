import type { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Login | Next 16 on board project',
  description:
    'Client-side authentication with TanStack Form onBlur validation, useTransition for loading states, and BetterAuth authClient.signIn.email for secure email sign-in with toast notifications',
  category: 'Client Auth + Form Validation',
  keywords: [
    'Next.js 16',
    'BetterAuth',
    'TanStack Form',
    'client authentication',
    'email sign-in',
    'useTransition',
    'form validation',
  ],
  authors: [{ name: 'noidilin' }],
}

export default function LoginPage() {
  return <LoginForm />
}
