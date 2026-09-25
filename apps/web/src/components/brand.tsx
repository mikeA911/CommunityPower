import Image from "next/image";
import Link from "next/link";

export function CPMark({ size = 44, priority = false }: { size?: number; priority?: boolean }) {
  return <span className="cp-mark" style={{ width: size, height: size }} aria-hidden="true">
    <Image src="/brand/cp-logo.png" width={1408} height={768} alt="" priority={priority} />
  </span>;
}

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand ${inverse ? "brand-inverse" : ""}`} aria-label="Community Power home">
    <CPMark priority /><span>community<span className="brand-bottom">power<span className="brand-dot">.</span></span></span>
  </Link>;
}
