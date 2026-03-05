import Image from "next/image";

export function BrainLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/lightbrain.png"
      alt="Athion"
      width={size}
      height={size}
      className={`block light-invert ${className ?? ""}`}
      priority
    />
  );
}
