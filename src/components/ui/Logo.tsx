interface LogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
  clickable?: boolean
}

export const Logo = ({ className = "", width = 200, height = 60, alt = "Custom Lead Match", clickable = true }: LogoProps) => {
  const logoImage = (
    <img 
      src="/assets/logo.png" 
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  )

  if (clickable) {
    return (
      <a 
        href="https://customleadmatch.com" 
        className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
      >
        {logoImage}
      </a>
    )
  }

  return logoImage
}
