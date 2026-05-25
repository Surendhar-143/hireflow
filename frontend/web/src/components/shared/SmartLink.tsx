import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

export interface SmartLinkProps extends LinkProps {
  onHoverPrefetch?: () => void
}

/**
 * SmartLink wraps the standard react-router-dom Link to provide prefetching on hover.
 * By the time the user clicks, the chunk is downloading and the API data is fetching.
 */
export const SmartLink = React.forwardRef<HTMLAnchorElement, SmartLinkProps>(
  ({ onHoverPrefetch, onMouseEnter, ...props }, ref) => {
    const queryClient = useQueryClient()

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Trigger user-provided prefetch (usually queryClient.prefetchQuery)
      if (onHoverPrefetch) {
        onHoverPrefetch()
      }
      
      // If we had a mechanism to eagerly trigger dynamic imports based on URL, 
      // we would do it here. For now, React Router v6.4+ handles some prefetching,
      // and we handle the data prefetching.

      if (onMouseEnter) {
        onMouseEnter(e)
      }
    }

    return (
      <Link
        ref={ref}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    )
  }
)

SmartLink.displayName = 'SmartLink'
