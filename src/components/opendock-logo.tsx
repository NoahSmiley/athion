import Image from "next/image";

export function OpenDockLogo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/opendock-logo.png"
      alt="OpenDock"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
