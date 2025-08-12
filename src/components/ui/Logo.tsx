import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
  clickable?: boolean
  withBadge?: boolean
  withTagline?: boolean
  isSticky?: boolean
}

export const Logo = ({ 
  className = "", 
  width = 200, 
  height = 60, 
  alt = "Custom Lead Match", 
  clickable = true,
  withBadge = false,
  withTagline = false,
  isSticky = false
}: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  
  const actualWidth = isSticky ? width * 0.8 : width
  const actualHeight = isSticky ? height * 0.8 : height
  
  const logoContent = (
    <div className="relative">
      {!imageError ? (
        <img 
          src="/assets/logo.png" 
          alt={alt}
          width={actualWidth}
          height={actualHeight}
          className={`object-contain ${className}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className={`flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg ${className}`}
          style={{ width: `${actualWidth}px`, height: `${actualHeight}px` }}
        >
          <span className="text-center text-sm">
            CUSTOM<br />LEAD<br />MATCH
          </span>
        </div>
      )}
    </div>
  )

  const logoWithEnhancements = (
    <div className="flex flex-col items-center">
      <div 
        className={`${withBadge ? 'bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-4 shadow-lg' : ''} 
                   ${withBadge ? 'filter drop-shadow-md' : ''} 
                   transition-all duration-300`}
        style={{ 
          filter: withBadge ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none'
        }}
      >
        {logoContent}
      </div>
      {withTagline && (
        <p className="text-gray-600 text-sm font-semibold mt-3 text-center tracking-wide">
          Exclusive Local Leads — AI Matched
        </p>
      )}
    </div>
  )

  if (clickable) {
    return (
      <a 
        href="https://www.customleadmatch.com" 
        className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
      >
        {logoWithEnhancements}
      </a>
    )
  }

  return logoWithEnhancements
}
