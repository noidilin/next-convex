import { Loading01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from 'convex/react'
import Link from 'next/link'
import { useState } from 'react'
import { api } from '@/convex/_generated/api'
import { Input } from '../ui/input'

export default function SearchInput() {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)

  const results = useQuery(
    api.posts.searchPosts,
    term.length >= 2 ? { limit: 5, term: term } : 'skip',
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value)
    setOpen(true)
  }

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-2 left-2 size-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search Posts..."
          className="w-full bg-background pl-8"
          value={term}
          onChange={handleInputChange}
        />
      </div>
      {open && term.length >= 2 && (
        <div className="fade-in-0 zoom-in-95 absolute top-full mt-2 animate-in rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
          {results === undefined ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="mr-2 size-4 animate-spin"
              />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground text-sm">
              No results found!
            </p>
          ) : (
            <div className="py-1">
              {results.map((post) => (
                <Link
                  className="flex cursor-pointer flex-col px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  href={`/blog/${post._id}`}
                  key={post._id}
                  onClick={() => {
                    setTerm('')
                    setOpen(false)
                  }}
                >
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="pt-1 text-shadow-muted text-xs">
                    {post.body.substring(0, 60)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
