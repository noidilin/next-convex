'use client'

import { Leva } from 'leva'

export function LevaRoot() {
  return <Leva hidden={process.env.NODE_ENV === 'production'} />
}
