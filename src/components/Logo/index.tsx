import Image from 'next/image'

interface LogoProps {
  size?: number
}

export function Logo({ size = 56 }: Readonly<LogoProps>) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}
    >
      <Image
        src="/images/logo.webp"
        alt="Gabutin"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        priority
      />
    </div>
  )
}
