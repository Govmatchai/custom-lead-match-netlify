interface LogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
}

export const Logo = ({ className = "", width = 200, height = 60, alt = "Custom Lead Match" }: LogoProps) => {
  return (
    <img 
      src="/assets/logo.png" 
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  )
}
