export const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aria&backgroundColor=ffd5dc,ffdfbf,c0aede,b6e3f4,d1d4f9';

export function isImageAvatar(a: string) {
  return a.startsWith('http') || a.startsWith('data:image');
}

export default function Avatar({ src, alt, size = 32, className = '' }: { src: string; alt?: string; size?: number; className?: string }) {
  if (!isImageAvatar(src)) {
    return <span className={className} style={{ fontSize: size * 0.7 }} aria-hidden>{src}</span>;
  }
  return (
    <img
      src={src}
      alt={alt ?? 'avatar'}
      loading="lazy"
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-white object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
