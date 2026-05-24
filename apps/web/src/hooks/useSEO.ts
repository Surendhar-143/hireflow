import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOOptions {
  title?: string
  description?: string
  ogImage?: string
}

export function useSEO({ title, description, ogImage }: SEOOptions) {
  const location = useLocation()

  useEffect(() => {
    // Determine title
    let fullTitle = 'HireFlow — Find Your Next Role'
    if (title) {
      fullTitle = `${title} | HireFlow`
    } else {
      // Fallback based on route
      const path = location.pathname.split('/').pop()
      if (path && path !== 'app') {
        const capitalizedPath = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
        fullTitle = `${capitalizedPath} | HireFlow`
      }
    }

    document.title = fullTitle

    // Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    // Update OG Image
    if (ogImage) {
      let metaOGImage = document.querySelector('meta[property="og:image"]')
      if (!metaOGImage) {
        metaOGImage = document.createElement('meta')
        metaOGImage.setAttribute('property', 'og:image')
        document.head.appendChild(metaOGImage)
      }
      metaOGImage.setAttribute('content', ogImage)
    }

  }, [title, description, ogImage, location])
}
