import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
  clickable?: boolean
}

export const Logo = ({ className = "", width = 200, height = 60, alt = "Custom Lead Match", clickable = true }: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  
  const logoImage = (
    <div className="relative">
      {!imageError ? (
        <img 
          src="/assets/logo.png" 
          alt={alt}
          width={width}
          height={height}
          className={`object-contain ${className}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className={`flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg ${className}`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <span className="text-center text-sm">
            CUSTOM<br />LEAD<br />MATCH
          </span>
        </div>
      )}
    </div>
  )

  if (clickable) {
    return (
      <a 
        href="https://www.customleadmatch.com" 
        className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
      >
        {logoImage}
      </a>
    )
  }

  return logoImage
}
