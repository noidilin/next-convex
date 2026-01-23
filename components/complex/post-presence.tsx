'use client'

import FacePile from '@convex-dev/presence/facepile'
import usePresence from '@convex-dev/presence/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

interface iAppProps {
  roomId: Id<'posts'>
  userId: string
}

export default function PostPresence({ roomId, userId }: iAppProps) {
  const presenceState = usePresence(api.presence, roomId, userId)

  // if no presenceState or there is no user
  if (!presenceState || presenceState.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        Viewing now
      </p>
      <div className="text-black">
        <FacePile presenceState={presenceState ?? []} />
      </div>
    </div>
  )
}
