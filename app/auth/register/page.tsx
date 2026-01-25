import type { Metadata } from 'next'
import RegisterForm from './register-form'

export const metadata: Metadata = {
  title: 'Register | Next 16 on board project',
  description:
    'User registration with TanStack Form onBlur validation, useTransition for loading states, and BetterAuth authClient.signUp.email for secure account creation with toast notifications',
  category: 'Client Auth + Form Validation',
  keywords: [
    'Next.js 16',
    'BetterAuth',
    'TanStack Form',
    'user registration',
    'email sign-up',
    'useTransition',
    'form validation',
  ],
  authors: [{ name: 'noidilin' }],
}

export default function RegisterPage() {
  return <RegisterForm />
}
