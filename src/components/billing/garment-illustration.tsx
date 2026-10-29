import type { ReactNode } from "react";
import type { IllustrationKey } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ShirtPaths() {
  return (
    <>
      <path d="M22 24 L32 18 L40 24 L48 18 L58 24 L52 32 L52 62 L28 62 L28 32 Z" {...stroke} />
      <path d="M40 24 V34" {...stroke} />
    </>
  );
}

function JacketPaths() {
  return (
    <>
      <path d="M20 24 L32 16 L40 22 L48 16 L60 24 L54 34 L54 64 L26 64 L26 34 Z" {...stroke} />
      <path d="M32 16 L36 28 L40 22 L44 28 L48 16" {...stroke} />
      <path d="M40 22 V64" {...stroke} />
    </>
  );
}

function TrouserPaths() {
  return (
    <>
      <path d="M28 16 H52 L50 28 L56 66 H44 L40 36 L36 66 H24 L30 28 Z" {...stroke} />
      <path d="M30 28 H50" {...stroke} />
    </>
  );
}

function DressPaths() {
  return (
    <>
      <path d="M32 16 L40 22 L48 16 L52 28 L58 66 H22 L28 28 Z" {...stroke} />
      <path d="M32 16 L36 26 M48 16 L44 26" {...stroke} />
    </>
  );
}

const ILLUSTRATIONS: Record<IllustrationKey, ReactNode> = {
  jacket: <JacketPaths />,
  overcoat: (
    <>
      <path d="M18 22 L32 14 L40 20 L48 14 L62 22 L56 32 L56 68 L24 68 L24 32 Z" {...stroke} />
      <path d="M40 20 V68" {...stroke} />
      <path d="M24 44 H56" {...stroke} />
    </>
  ),
  shirt: <ShirtPaths />,
  "silk-shirt": (
    <>
      <ShirtPaths />
      <path d="M32 44 H48" {...stroke} />
    </>
  ),
  suit: (
    <>
      <JacketPaths />
      <path d="M34 44 H46" {...stroke} />
    </>
  ),
  suit3: (
    <>
      <JacketPaths />
      <path d="M30 38 H50" {...stroke} />
      <path d="M34 46 H46" {...stroke} />
    </>
  ),
  sweater: (
    <>
      <path d="M18 28 L30 20 L40 26 L50 20 L62 28 L54 36 L54 64 L26 64 L26 36 Z" {...stroke} />
      <path d="M30 44 H50" {...stroke} />
    </>
  ),
  tie: (
    <>
      <path d="M40 14 L46 22 L40 28 L34 22 Z" {...stroke} />
      <path d="M40 28 L46 62 L40 68 L34 62 Z" {...stroke} />
    </>
  ),
  trouser: <TrouserPaths />,
  jeans: (
    <>
      <TrouserPaths />
      <path d="M32 38 L36 50 M48 38 L44 50" {...stroke} />
    </>
  ),
  blazer: <JacketPaths />,
  tshirt: (
    <>
      <path d="M24 26 L34 18 L46 18 L56 26 L50 32 L50 62 L30 62 L30 32 Z" {...stroke} />
      <path d="M34 18 L40 26 L46 18" {...stroke} />
    </>
  ),
  dress: <DressPaths />,
  "evening-dress": (
    <>
      <path d="M32 14 L40 20 L48 14 L50 28 L62 68 H18 L30 28 Z" {...stroke} />
      <path d="M40 20 V36" {...stroke} />
    </>
  ),
  scarf: (
    <>
      <path d="M28 18 Q40 8 52 18 Q58 28 48 34 L34 58 Q28 66 24 58 Q22 36 28 18 Z" {...stroke} />
    </>
  ),
  skirt: (
    <>
      <path d="M30 20 H50 L58 62 H22 Z" {...stroke} />
      <path d="M30 20 L34 28 M50 20 L46 28" {...stroke} />
    </>
  ),
  top: (
    <>
      <path d="M26 24 L36 16 L44 16 L54 24 L48 30 L48 54 L32 54 L32 30 Z" {...stroke} />
    </>
  ),
  saree: (
    <>
      <path d="M28 16 L40 22 L44 16 L52 24 L56 66 H24 L30 28 Z" {...stroke} />
      <path d="M40 22 C52 30 54 46 50 66" {...stroke} />
    </>
  ),
  gown: (
    <>
      <path d="M32 14 L40 20 L48 14 L50 26 L64 70 H16 L30 26 Z" {...stroke} />
    </>
  ),
  lehenga: (
    <>
      <path d="M34 14 H46 L50 32 H30 Z" {...stroke} />
      <path d="M26 32 H54 L64 68 H16 Z" {...stroke} />
    </>
  ),
  nightwear: (
    <>
      <path d="M28 18 L40 24 L52 18 L54 30 L50 64 H30 L26 30 Z" {...stroke} />
      <path d="M32 44 H48" {...stroke} />
    </>
  ),
  legging: (
    <>
      <path d="M30 14 H50 L48 24 L54 68 H44 L40 32 L36 68 H26 L32 24 Z" {...stroke} />
    </>
  ),
  duvet: (
    <>
      <rect x="16" y="22" width="48" height="36" rx="4" {...stroke} />
      <path d="M16 34 H64 M28 22 V58 M52 22 V58" {...stroke} />
    </>
  ),
  kurta: (
    <>
      <path d="M22 22 L32 16 L40 22 L48 16 L58 22 L52 30 L52 66 L28 66 L28 30 Z" {...stroke} />
      <path d="M40 22 V40" {...stroke} />
    </>
  ),
  blouse: (
    <>
      <path d="M26 26 L36 18 L44 18 L54 26 L48 32 L48 50 L32 50 L32 32 Z" {...stroke} />
      <path d="M36 18 L40 24 L44 18" {...stroke} />
    </>
  ),
  sneakers: (
    <>
      <path d="M14 55 C24 57 56 57 66 53 C66 48 62 45 56 45 L46 45 L38 34 L26 36 L20 45 C16 47 14 51 14 55 Z" {...stroke} />
      <path d="M34 38 L42 44 M30 42 L38 48" {...stroke} />
      <path d="M14 52 H66" {...stroke} />
    </>
  ),
  "leather-shoe": (
    <>
      <path d="M14 54 C22 56 54 56 66 52 C64 44 58 42 50 42 L42 36 L30 38 L22 46 C16 48 14 51 14 54 Z" {...stroke} />
      <path d="M52 55 V59 H64 V52" {...stroke} />
      <path d="M34 40 L38 46" {...stroke} />
    </>
  ),
  boots: (
    <>
      <path d="M30 20 H48 V42 L58 46 C64 48 66 52 64 56 C56 58 26 58 20 56 C20 50 24 48 30 46 Z" {...stroke} />
      <path d="M22 56 V60 H32 V57" {...stroke} />
      <path d="M30 24 H48 M38 28 L44 32 M38 34 L44 38" {...stroke} />
    </>
  ),
  sandal: (
    <>
      <path d="M18 56 C26 57 54 57 62 53" {...stroke} />
      <path d="M56 54 V62" {...stroke} />
      <path d="M22 56 C22 46 32 46 32 56" {...stroke} />
      <path d="M48 55 L52 42 C56 42 60 46 60 52" {...stroke} />
    </>
  ),
  loafers: (
    <>
      <path d="M16 54 C26 56 54 56 64 52 C64 46 58 44 50 44 L40 40 L28 42 L18 48 C15 50 16 54 16 54 Z" {...stroke} />
      <path d="M32 42 H42 V46 H32 Z" {...stroke} />
      <path d="M52 55 V59 H62 V52" {...stroke} />
    </>
  ),
  slippers: (
    <>
      <path d="M16 56 C28 58 52 58 64 54" {...stroke} />
      <path d="M24 56 C24 44 44 44 46 56" {...stroke} />
    </>
  ),
  "canvas-shoe": (
    <>
      <path d="M16 56 C24 58 56 58 64 54 L62 46 C56 46 48 44 44 36 L32 38 L22 46 C17 49 16 53 16 56 Z" {...stroke} />
      <path d="M24 48 C22 52 22 56 22 56" {...stroke} />
      <circle cx="50" cy="46" r="3" {...stroke} />
    </>
  ),
  "kids-wear": (
    <>
      <path d="M26 24 L34 18 L46 18 L54 24 L48 30 L48 58 L32 58 L32 30 Z" {...stroke} />
      <path d="M36 36 H44 V44 H36 Z" {...stroke} />
      <path d="M34 18 L40 24 L46 18" {...stroke} />
    </>
  ),
  bedsheet: (
    <>
      <path d="M18 34 L40 22 L62 34 L40 46 Z" {...stroke} />
      <path d="M18 34 V48 L40 60 L62 48 V34" {...stroke} />
      <path d="M40 46 V60" {...stroke} />
    </>
  ),
  "quilt-cover": (
    <>
      <rect x="20" y="24" width="40" height="34" rx="3" {...stroke} />
      <path d="M20 36 H60 M20 48 H60" {...stroke} />
      <circle cx="34" cy="30" r="1.5" fill="currentColor" />
      <circle cx="46" cy="30" r="1.5" fill="currentColor" />
    </>
  ),
  blanket: (
    <>
      <path d="M22 28 C22 22 34 22 34 28 V52 C34 58 22 58 22 52 Z" {...stroke} />
      <path d="M34 26 H56 C62 26 62 34 56 34 H34" {...stroke} />
      <path d="M34 44 H56 C62 44 62 52 56 52 H34" {...stroke} />
    </>
  ),
  comforter: (
    <>
      <rect x="18" y="22" width="44" height="38" rx="4" {...stroke} />
      <path d="M40 22 L62 41 L40 60 L18 41 Z" {...stroke} />
      <circle cx="40" cy="41" r="2" fill="currentColor" />
    </>
  ),
  curtains: (
    <>
      <path d="M14 18 H66" {...stroke} />
      <circle cx="14" cy="18" r="2" fill="currentColor" />
      <circle cx="66" cy="18" r="2" fill="currentColor" />
      <path d="M20 20 L22 62 C26 60 28 64 32 62 L30 20" {...stroke} />
      <path d="M60 20 L58 62 C54 60 52 64 48 62 L50 20" {...stroke} />
    </>
  ),
  pillow: (
    <>
      <rect x="20" y="22" width="40" height="38" rx="3" {...stroke} />
      <rect x="26" y="28" width="28" height="26" rx="2" {...stroke} />
      <path d="M40 37 L40 45 M36 41 L44 41" {...stroke} />
    </>
  ),
  "sofa-cover": (
    <>
      <path d="M20 32 V54 H60 V32" {...stroke} />
      <path d="M16 40 H24 V58 H16 Z" {...stroke} />
      <path d="M56 40 H64 V58 H56 Z" {...stroke} />
      <path d="M24 48 H56" {...stroke} />
    </>
  ),
  towel: (
    <>
      <path d="M18 24 H62" {...stroke} />
      <path d="M26 24 V58 C26 62 54 62 54 58 V24" {...stroke} />
      <path d="M26 50 H54" {...stroke} />
    </>
  ),
  tablecloth: (
    <>
      <ellipse cx="40" cy="30" rx="24" ry="10" {...stroke} />
      <path d="M16 30 C16 44 26 58 40 58 C54 58 64 44 64 30" {...stroke} />
      <path d="M24 48 Q32 54 40 48 Q48 54 56 48" {...stroke} />
    </>
  ),
  carpet: (
    <>
      <rect x="22" y="22" width="36" height="38" rx="2" {...stroke} />
      <path d="M22 28 H58 M22 54 H58" {...stroke} />
      <path d="M24 18 V22 M32 18 V22 M40 18 V22 M48 18 V22 M56 18 V22" {...stroke} />
      <path d="M24 60 V64 M32 60 V64 M40 60 V64 M48 60 V64 M56 60 V64" {...stroke} />
    </>
  ),
  "custom-item": (
    <>
      <path d="M40 26 C36 26 36 20 40 20 C44 20 44 26 40 26 Z" {...stroke} />
      <path d="M40 26 L20 42 C20 45 60 45 60 42 Z" {...stroke} />
      <path d="M40 48 V58 M35 53 H45" {...stroke} />
    </>
  ),
  "bridal-saree": (
    <>
      <path d="M28 16 L40 22 L44 16 L52 24 L56 66 H24 L30 28 Z" {...stroke} />
      <path d="M40 22 C52 30 54 46 50 66" {...stroke} />
      <path d="M28 36 H52 M26 48 H54 M24 60 H56" {...stroke} />
      <circle cx="40" cy="30" r="1.5" fill="currentColor" />
    </>
  ),
  waistcoat: (
    <>
      <path d="M24 22 L34 16 L40 24 L46 16 L56 22 L52 34 L52 64 L40 68 L28 64 L28 34 Z" {...stroke} />
      <path d="M40 24 V68" {...stroke} />
      <circle cx="40" cy="36" r="1.5" fill="currentColor" />
      <circle cx="40" cy="46" r="1.5" fill="currentColor" />
      <circle cx="40" cy="56" r="1.5" fill="currentColor" />
    </>
  ),
  sherwani: (
    <>
      <path d="M24 18 L34 14 L40 20 L46 14 L56 18 L52 32 L52 68 H28 L28 32 Z" {...stroke} />
      <path d="M40 20 V68" {...stroke} />
      <path d="M34 14 H46" {...stroke} />
      <circle cx="40" cy="28" r="1.5" fill="currentColor" />
      <circle cx="40" cy="38" r="1.5" fill="currentColor" />
      <circle cx="40" cy="48" r="1.5" fill="currentColor" />
    </>
  ),
  toy: (
    <>
      <circle cx="40" cy="40" r="16" {...stroke} />
      <circle cx="28" cy="24" r="7" {...stroke} />
      <circle cx="52" cy="24" r="7" {...stroke} />
      <circle cx="35" cy="36" r="2" fill="currentColor" />
      <circle cx="45" cy="36" r="2" fill="currentColor" />
      <ellipse cx="40" cy="44" rx="4" ry="2.5" {...stroke} />
      <path d="M38 43 L42 43" {...stroke} />
    </>
  ),
  backpack: (
    <>
      <rect x="24" y="24" width="32" height="42" rx="6" {...stroke} />
      <path d="M34 24 V16 C34 14 46 14 46 16 V24" {...stroke} />
      <rect x="28" y="38" width="24" height="20" rx="3" {...stroke} />
      <path d="M24 34 H56" {...stroke} />
    </>
  ),
  "trolley-bag": (
    <>
      <rect x="24" y="26" width="32" height="42" rx="4" {...stroke} />
      <path d="M32 26 V12 H48 V26" {...stroke} />
      <path d="M24 40 H56 M24 54 H56" {...stroke} />
      <circle cx="28" cy="70" r="3" {...stroke} />
      <circle cx="52" cy="70" r="3" {...stroke} />
    </>
  ),
  laundry: (
    <>
      <path d="M18 32 L24 64 H56 L62 32 Z" {...stroke} />
      <path d="M22 42 H58 M24 52 H56 M34 32 V64 M46 32 V64" {...stroke} />
      <path d="M14 32 H22 M58 32 H66" {...stroke} />
    </>
  ),
  "wash-fold": (
    <>
      <path d="M22 30 H58 L62 58 H18 Z" {...stroke} />
      <path d="M20 40 H60 M22 48 H58" {...stroke} />
      <circle cx="34" cy="22" r="3" {...stroke} />
      <circle cx="46" cy="20" r="2" {...stroke} />
    </>
  ),
  "wash-iron": (
    <>
      <path d="M22 52 H58 C62 52 64 48 62 44 L54 36 H30 C25 36 22 42 22 52 Z" {...stroke} />
      <path d="M26 36 V26 H48 V36" {...stroke} />
      <path d="M30 60 V56 M40 60 V56 M50 60 V56" {...stroke} />
    </>
  ),
};

export function GarmentIllustration({
  name,
  className,
}: {
  name: IllustrationKey;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn("h-[72px] w-[72px] text-slate-600", className)}
      aria-hidden
    >
      {ILLUSTRATIONS[name] ?? ILLUSTRATIONS.shirt}
    </svg>
  );
}
