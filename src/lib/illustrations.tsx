/**
 * TAFAT illustration language.
 *
 * A handcrafted, consistent visual system built from organic botanical and
 * scientific motifs: 2px rounded strokes, soft tinted fills, dashed orbit arcs,
 * seed dots and four-point stars. No stock photography, no AI-looking renders.
 *
 * Every illustration is an inline SVG so it renders crisp at any size, costs no
 * extra network request, and inherits palette tokens from CSS custom properties
 * (--ill-ink / --ill-sage / --ill-clay / --ill-gold / --ill-sky). Category
 * illustrations use `currentColor` so the surrounding card accent tints them.
 *
 * Accessibility: all square illustrations are decorative (`aria-hidden`) inside
 * cards that carry their own text and link; the hero illustration exposes a
 * `<title>` via role="img" so screen readers get a short description.
 */

import type { SVGProps } from "react";

type IllProps = SVGProps<SVGSVGElement> & { className?: string };

const STROKE = 2;

/** Tiny four-point star used as a handcrafted "spark" motif. */
function Star({ cx, cy, r = 3.4, ...rest }: { cx: number; cy: number; r?: number } & SVGProps<SVGPathElement>) {
  const s = r * 0.62;
  return (
    <path
      d={`M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`}
      {...rest}
    />
  );
}

/** Organic leaf: pointed tip, curved base, midrib line. */
function Leaf({ d, ...rest }: { d: string } & SVGProps<SVGPathElement>) {
  return (
    <g {...rest}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Category illustrations (square, 120x120)                            */
/* ------------------------------------------------------------------ */

/** Digital — calm laptop with a sprout growing from the screen. */
export function DigitalIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      {/* orbit dots */}
      <g fill="currentColor" opacity="0.55">
        <circle cx="90" cy="26" r="2.2" />
        <circle cx="24" cy="34" r="1.7" />
        <circle cx="99" cy="60" r="1.6" />
      </g>
      {/* sprout above screen */}
      <path d="M60 42 C58 33 61 27 59 18" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M59 30 C50 29 47 24 47.5 18 C54 18.5 57.5 22 59 30 Z" fill="currentColor" opacity="0.22" />
      <path d="M59 30 C50 29 47 24 47.5 18" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M59.5 24 C67 22.5 70.5 26.5 70.5 31 C65 31.5 61 28.5 59.5 24 Z" fill="currentColor" opacity="0.22" />
      <path d="M59.5 24 C67 22.5 70.5 26.5 70.5 31" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      {/* laptop */}
      <rect x="25" y="46" width="70" height="44" rx="7" fill="currentColor" opacity="0.08" />
      <rect x="25" y="46" width="70" height="44" rx="7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M18 95 h84" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M40 95 c2 6 8 9 20 9 h0 c12 0 18 -3 20 -9" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </svg>
  );
}

/** Health & Wellness — a botanical wreath cradling a growing sprig. */
export function HealthIllustration({ className }: IllProps) {
  const petal = (cx: number, cy: number, rot: number) => (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <path d={`M${cx} ${cy - 13} C${cx - 8} ${cy - 8} ${cx - 8} ${cy + 2} ${cx} ${cy + 6} C${cx + 8} ${cy + 2} ${cx + 8} ${cy - 8} ${cx} ${cy - 13} Z`} fill="currentColor" opacity="0.14" />
      <path d={`M${cx} ${cy - 13} C${cx - 8} ${cy - 8} ${cx - 8} ${cy + 2} ${cx} ${cy + 6} C${cx + 8} ${cy + 2} ${cx + 8} ${cy - 8} ${cx} ${cy - 13} Z`} fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`M${cx} ${cy + 4} L${cx} ${cy - 10}`} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="36" fill="currentColor" opacity="0.06" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="2 7" strokeLinecap="round" />
      {petal(60, 24, 0)}
      {petal(96, 48, 60)}
      {petal(82, 91, 120)}
      {petal(38, 91, 60)}
      {petal(24, 48, 120)}
      {/* center sprig */}
      <path d="M60 78 C60 68 62 62 58 52" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M60 64 C52 63 49 58 49.5 51 C56 52 59.5 56.5 60 64 Z" fill="currentColor" opacity="0.22" />
      <path d="M60 64 C52 63 49 58 49.5 51" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60.5 58 C68 57.5 71 62 71 68 C65.5 68.5 61.5 64 60.5 58 Z" fill="currentColor" opacity="0.22" />
      <path d="M60.5 58 C68 57.5 71 62 71 68" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="58" cy="48" r="2" fill="currentColor" />
      <Star cx="88" cy="34" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** Technology (future) — three nodes joined by organic arcs around a leaf. */
export function TechnologyIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M36 40 C52 52 70 50 86 36" fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="1 6" strokeLinecap="round" />
      <path d="M86 38 C84 58 76 76 60 86" fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="1 6" strokeLinecap="round" />
      <path d="M58 84 C42 74 34 58 36 42" fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="1 6" strokeLinecap="round" />
      <circle cx="36" cy="40" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="36" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="86" cy="36" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="86" cy="36" r="7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="60" cy="86" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="60" cy="86" r="7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      {/* center sprout */}
      <path d="M60 66 C59 58 61 52 60 45" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M60 55 C53 54.5 50.5 50.5 51 44.5 C57 45.5 60 49 60 55 Z" fill="currentColor" opacity="0.22" />
      <path d="M60 55 C53 54.5 50.5 50.5 51 44.5" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="40" r="2" fill="currentColor" />
      <Star cx="22" cy="80" r="3" fill="currentColor" opacity="0.6" />
      <Star cx="96" cy="86" r="2.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Coffee (future) — a cup with steam curling into a leaf. */
export function CoffeeIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M34 96 h52" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M42 54 h36 l-5 30 a16 16 0 0 1 -26 0 Z" fill="currentColor" opacity="0.1" />
      <path d="M42 54 h36 l-5 30 a16 16 0 0 1 -26 0 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M78 58 h7 a11 11 0 0 1 0 22 h-9" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      {/* steam curling into a leaf */}
      <path d="M52 46 C50 38 56 33 55 25" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M64 45 C66 38 61 32 63.5 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M55 18 C48 17.5 46 13 46.5 8 C53 9 55.5 12.5 55 18 Z" fill="currentColor" opacity="0.22" />
      <path d="M55 18 C48 17.5 46 13 46.5 8" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="30" r="2" fill="currentColor" opacity="0.7" />
      <Star cx="28" cy="26" r="2.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Books (future) — an open book with a sprig rising from the spine. */
export function BooksIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M60 66 C46 56 30 54 18 56 L18 84 C30 82 46 84 60 94 C74 84 90 82 102 84 L102 56 C90 54 74 56 60 66 Z" fill="currentColor" opacity="0.08" />
      <path d="M60 66 C46 56 30 54 18 56 L18 84 C30 82 46 84 60 94 C74 84 90 82 102 84 L102 56 C90 54 74 56 60 66 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M60 66 L60 94" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M34 62 C40 64 46 64.5 52 66" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" opacity="0.7" />
      <path d="M68 66 C74 64.5 80 64 86 62" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" opacity="0.7" />
      {/* sprig from spine */}
      <path d="M60 60 C58 50 61 42 60 30" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M60 48 C52 47.5 49 43 49.5 37 C56 38 59.5 42 60 48 Z" fill="currentColor" opacity="0.22" />
      <path d="M60 48 C52 47.5 49 43 49.5 37" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60.5 42 C68 41.5 71 45.5 71 51 C65.5 51.5 61.5 47.5 60.5 42 Z" fill="currentColor" opacity="0.22" />
      <path d="M60.5 42 C68 41.5 71 45.5 71 51" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="26" r="2" fill="currentColor" />
      <Star cx="30" cy="40" r="2.6" fill="currentColor" opacity="0.6" />
      <Star cx="90" cy="38" r="2.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Art (future) — brush, palette blob and a leaf accent. */
export function ArtIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      {/* palette */}
      <path d="M34 58 C34 40 52 28 74 30 C92 31.5 100 42 98 54 C96 64 84 70 70 69 C62 68.5 58 71 54 76 C50 72 46 70 40 71 C34 64 34 62 34 58 Z" fill="currentColor" opacity="0.1" />
      <path d="M34 58 C34 40 52 28 74 30 C92 31.5 100 42 98 54 C96 64 84 70 70 69 C62 68.5 58 71 54 76 C50 72 46 70 40 71 C34 64 34 62 34 58 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <circle cx="50" cy="42" r="3" fill="currentColor" opacity="0.85" />
      <circle cx="70" cy="38" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="86" cy="50" r="3" fill="currentColor" opacity="0.85" />
      {/* brush */}
      <path d="M42 78 L74 46" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
      <path d="M74 46 L82 38" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      {/* leaf accent */}
      <path d="M88 76 C84 82 76 85 70 84 C74 78 80 74.5 88 76 Z" fill="currentColor" opacity="0.22" />
      <path d="M88 76 C84 82 76 85 70 84" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Star cx="30" cy="80" r="2.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Health & Wellness topic motifs (square, 120x120)                    */
/* ------------------------------------------------------------------ */

/** Vitamins & Minerals — flask with a leaf inside. */
export function VitaminsIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M50 30 h20 M54 30 v12 l-16 32 a10 10 0 0 0 9 14 h26 a10 10 0 0 0 9 -14 L66 42 v-12" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 66 a10 10 0 0 0 9 12 h-26 a10 10 0 0 1 -9 -14 Z" fill="currentColor" opacity="0.1" />
      <path d="M60 70 C59 62 61.5 56 60 48" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d="M60 60 C54.5 59.5 52.5 56 53 51 C58.5 51.5 60.5 54.5 60 60 Z" fill="currentColor" opacity="0.25" />
      <path d="M60 60 C54.5 59.5 52.5 56 53 51" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="80" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="70" cy="86" r="1.6" fill="currentColor" opacity="0.5" />
      <path d="M38 44 l-5 5 M84 38 l4 4" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Sleep & Rest — crescent moon, stars, resting sprig. */
export function SleepIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M72 30 A26 26 0 1 0 84 72 A21 21 0 1 1 72 30 Z" fill="currentColor" opacity="0.16" />
      <path d="M72 30 A26 26 0 1 0 84 72 A21 21 0 1 1 72 30 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <Star cx="38" cy="38" r="3.2" fill="currentColor" opacity="0.8" />
      <Star cx="88" cy="88" r="2.6" fill="currentColor" opacity="0.6" />
      <path d="M42 84 C46 78 56 76 66 79" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M48 84 C49 79.5 53.5 77.5 58 78.5 C57 81.5 52.5 83.5 48 84 Z" fill="currentColor" opacity="0.25" />
      <path d="M48 84 C49 79.5 53.5 77.5 58 78.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Gut Health — an organic spiral with a leaf. */
export function GutIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M60 82 C46 80 36 70 36 56 C36 42 46 32 60 32 C74 32 84 42 84 56 C84 68 76 78 62 78" fill="currentColor" opacity="0.08" />
      <path d="M60 82 C46 80 36 70 36 56 C36 42 46 32 60 32 C74 32 84 42 84 56 C84 68 76 78 62 78" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M60 70 C52 69 45 63 45 56 C45 48 51 42 59 42 C66 42 72 48 72 56 C72 62 67 67 61 67" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="60" cy="52" r="2" fill="currentColor" />
      <path d="M88 82 C84 88 76 91 70 90" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M88 82 C84 88 76 91 70 90 C74 84 80 80.5 88 82 Z" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

/** Hydration & Electrolytes — droplet with a ripple arc. */
export function HydrationIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M60 26 C60 26 40 54 40 72 A20 20 0 0 0 80 72 C80 54 60 26 60 26 Z" fill="currentColor" opacity="0.12" />
      <path d="M60 26 C60 26 40 54 40 72 A20 20 0 0 0 80 72 C80 54 60 26 60 26 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M56 60 C57 66 62 70 68 70" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M30 88 C38 94 50 96 62 94" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity="0.7" />
      <path d="M88 62 C86 68 78 72 70 73 C74 67 80 63 88 62 Z" fill="currentColor" opacity="0.22" />
      <path d="M88 62 C86 68 78 72 70 73" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Star cx="90" cy="34" r="2.6" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** Healthy Movement — rolling hills, sun and a small sprout. */
export function MovementIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M22 44 C22 30 34 22 46 26 C50 27.5 52 30 54 34" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d="M96 40 C96 27 84 20 72 24 C68 25.5 66 28 64.5 32" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <circle cx="60" cy="34" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="60" cy="34" r="7" fill="none" stroke="currentColor" strokeWidth={1.8} />
      {/* motion arcs */}
      <path d="M46 18 C50 12 56 10 62 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="1 5" strokeLinecap="round" />
      <path d="M78 20 C84 16 90 17 94 22" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="1 5" strokeLinecap="round" />
      <path d="M20 84 C34 72 52 68 66 74 C76 78 88 76 100 68" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M20 94 C36 84 54 80 68 86 C80 90 92 88 102 82" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      {/* sprout */}
      <path d="M60 84 C59 78 60 74 60 68" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M60 76 C55 75.5 53.5 72.5 54 68.5 C58.5 69 60 71.5 60 76 Z" fill="currentColor" opacity="0.25" />
      <path d="M60 76 C55 75.5 53.5 72.5 54 68.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** General Wellness — sun with rays and a leaf. */
export function GeneralWellnessIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="56" r="16" fill="currentColor" opacity="0.1" />
      <circle cx="60" cy="56" r="16" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M60 28 v-8 M60 92 v-8 M28 56 h-8 M100 56 h-8 M37 33 l-6 -6 M89 85 l-6 -6 M83 33 l6 -6 M31 85 l6 -6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M84 78 C80 86 72 90 64 89 C68 82 75 78 84 78 Z" fill="currentColor" opacity="0.22" />
      <path d="M84 78 C80 86 72 90 64 89" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Star cx="92" cy="28" r="2.6" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Magnesium guide hero (wide, mineral + botany)                       */
/* ------------------------------------------------------------------ */

/**
 * Hero illustration for the Complete Guide to Magnesium. A handcrafted scene
 * that matches the guide's subject: a cluster of crystalline forms (the
 * mineral), botanical sprigs (food sources and the natural world), a soft sun
 * (energy) and a small flask (science). Palette tokens come from CSS vars so
 * the illustration stays in TAFAT's restrained palette.
 */
export function MagnesiumHeroIllustration({ className }: IllProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 960 400"
      role="img"
      aria-labelledby="magnesium-hero-title"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="magnesium-hero-title">Hand-drawn illustration of magnesium crystals with botanical leaves and a laboratory flask</title>
      <g stroke="var(--ill-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* sun */}
        <circle cx="822" cy="88" r="30" stroke="var(--ill-gold)" strokeWidth="2" />
        <g stroke="var(--ill-gold)" strokeWidth="1.6">
          <path d="M822 44 v-12 M822 132 v-12 M768 88 h-12 M876 88 h12 M783 49 l-9 -9 M861 127 l-9 9 M861 49 l9 -9 M783 127 l-9 9" />
        </g>
        {/* ground line */}
        <path d="M60 336 C220 318 400 326 540 330 C660 333 800 322 906 328" />
        <path d="M120 344 l-8 8 M168 340 l-6 6 M240 342 l8 8 M320 344 l-7 7 M470 336 l8 8 M560 338 l-6 6 M640 340 l7 7 M740 336 l-8 8 M830 332 l6 6" strokeWidth="1.4" opacity="0.6" />
        {/* crystals */}
        <g>
          <path d="M214 108 l64 24 v66 l-64 24 l-64 -24 v-66 Z" fill="var(--ill-sage)" fillOpacity="0.28" />
          <path d="M214 108 l64 24 v66 l-64 24 l-64 -24 v-66 Z" />
          <path d="M214 108 l64 24 l-64 24 l-64 -24 Z" fill="var(--ill-gold)" fillOpacity="0.14" />
          <path d="M278 132 v66 l-64 24" opacity="0.55" />
          <path d="M214 108 v48 l-64 24" opacity="0.4" />
          <path d="M150 156 l64 24 v66" opacity="0.55" />
        </g>
        <g>
          <path d="M128 188 l44 16 v48 l-44 16 l-44 -16 v-48 Z" fill="var(--ill-sky)" fillOpacity="0.35" />
          <path d="M128 188 l44 16 v48 l-44 16 l-44 -16 v-48 Z" />
          <path d="M172 204 v48 l-44 16" opacity="0.5" />
        </g>
        <g>
          <path d="M292 226 l36 12 v38 l-36 12 l-36 -12 v-38 Z" fill="var(--ill-gold)" fillOpacity="0.2" />
          <path d="M292 226 l36 12 v38 l-36 12 l-36 -12 v-38 Z" />
          <path d="M328 238 v38 l-36 12" opacity="0.5" />
        </g>
        {/* sprig */}
        <path d="M150 330 C170 290 210 262 262 244 C296 232 318 224 336 210" />
        <path d="M196 296 C188 300 180 300 174 296 C180 288 190 285 196 296 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M196 296 C188 300 180 300 174 296" />
        <path d="M232 272 C224 276 216 275 211 270 C218 263 227 262 232 272 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M232 272 C224 276 216 275 211 270" />
        <path d="M276 250 C268 254 260 252 256 247 C263 240 271 241 276 250 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M276 250 C268 254 260 252 256 247" />
        <path d="M320 222 C314 228 306 229 301 225 C306 218 315 215 320 222 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M320 222 C314 228 306 229 301 225" />
        {/* small ground sprout */}
        <path d="M420 336 C418 318 422 304 420 288" />
        <path d="M420 312 C412 311 409 306.5 409.5 301 C416 301.5 419.5 305.5 420 312 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M420 312 C412 311 409 306.5 409.5 301" />
        <path d="M420.5 302 C428 301.5 431 305.5 431 311 C425.5 311.5 421.5 307.5 420.5 302 Z" fill="var(--ill-sage)" fillOpacity="0.4" />
        <path d="M420.5 302 C428 301.5 431 305.5 431 311" />
        {/* flask */}
        <path d="M640 330 h96" opacity="0.5" />
        <path d="M666 296 h44 M674 296 v-18 h28 v18" />
        <path d="M672 296 C664 296 656 306 660 316 C662 320 668 322 688 322 C708 322 714 320 716 316 C720 306 712 296 704 296" fill="var(--ill-sky)" fillOpacity="0.3" />
        <path d="M672 296 C664 296 656 306 660 316 C662 320 668 322 688 322 C708 322 714 320 716 316 C720 306 712 296 704 296" />
        <path d="M662 314 C666 318 670 319 676 319" stroke="var(--ill-sky)" strokeWidth="2" />
        <circle cx="696" cy="306" r="2" fill="var(--ill-sky)" stroke="none" />
        <circle cx="706" cy="310" r="1.5" fill="var(--ill-sky)" stroke="none" />
        {/* scatter dots + stars */}
        <circle cx="470" cy="150" r="2.4" fill="var(--ill-clay)" stroke="none" />
        <circle cx="540" cy="212" r="2" fill="var(--ill-gold)" stroke="none" />
        <circle cx="610" cy="120" r="2.4" fill="var(--ill-sage)" stroke="none" />
        <circle cx="720" cy="230" r="2" fill="var(--ill-clay)" stroke="none" />
        <circle cx="380" cy="170" r="2" fill="var(--ill-gold)" stroke="none" />
        <path d="M520 120 l0 -8 M516 124 l-8 0 M524 124 l8 0 M520 128 l0 8" stroke="var(--ill-clay)" strokeWidth="1.6" />
        <path d="M668 84 l0 -6 M665 87 l-6 0 M671 87 l6 0 M668 90 l0 6" stroke="var(--ill-gold)" strokeWidth="1.6" />
        <path d="M470 240 l0 -6 M467 243 l-6 0 M473 243 l6 0 M470 246 l0 6" stroke="var(--ill-sage)" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small editorial icons (callouts, checklists, comparisons)           */
/* ------------------------------------------------------------------ */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Leaf + check — research highlight. */
export function LeafCheckIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M11 20.5A7.5 7.5 0 0 1 3.5 13C3.5 8.6 7 4.4 13.5 3.5c4.6-.7 7 1.6 7 6 0 5.2-4 11-9.5 11z" />
      <path d="M3.5 20.5C7 15.5 11.5 11.5 17 8.5" />
      <path d="m9 12.4 2 2 3.6-3.9" />
    </svg>
  );
}

/** Balance scale — comparison. */
export function ScaleIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3.5v17M8.5 20.5h7M7 4h10M7 4l-3.3 6.8a3.1 3.1 0 0 0 5.4 0L7 4zM17 4l-3.3 6.8a3.1 3.1 0 0 0 5.4 0L17 4z" />
    </svg>
  );
}

/** Open book — checklists and reading. */
export function BookIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 6.5C9.5 4.8 6.5 4.5 3.5 5v13c3-.5 6-.2 8.5 1.5 2.5-1.7 5.5-2 8.5-1.5V5c-3-.5-6-.2-8.5 1.5z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

/** Speech mark — claim / myth. */
export function QuoteIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M10 7.5c-3 .6-5 2.6-5 5.4 0 2.4 1.6 4 3.8 4 2 0 3.4-1.4 3.4-3.4 0-2-1.4-3.4-3.4-3.4-.2 0-.5 0-.7.1.4-1.7 1.8-2.8 3.6-3.3L10 7.5z" />
      <path d="M20 7.5c-3 .6-5 2.6-5 5.4 0 2.4 1.6 4 3.8 4 2 0 3.4-1.4 3.4-3.4 0-2-1.4-3.4-3.4-3.4-.2 0-.5 0-.7.1.4-1.7 1.8-2.8 3.6-3.3L20 7.5z" />
    </svg>
  );
}

/** Shield with check — safety. */
export function ShieldIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3l7 2.8v5.4c0 4.7-3.2 8-7 9.8-3.8-1.8-7-5.1-7-9.8V5.8z" />
      <path d="m9.2 11.8 2 2 3.6-3.9" />
    </svg>
  );
}

/** Flask — evidence / science. */
export function FlaskIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M9 3h6M10 3v5.2L4.6 16.9A2 2 0 0 0 6.3 20h11.4a2 2 0 0 0 1.7-3.1L14 8.2V3" />
      <path d="M7.4 14.5h9.2" />
    </svg>
  );
}

/** Thermometer-free "meter" — a small gauge for evidence ratings. */
export function MeterIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <path d="M12 9v6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial Standard premium section (wide, book + botany motif)       */
/* ------------------------------------------------------------------ */

/**
 * Wide illustration for the premium "Editorial Standard" section and its
 * dedicated page. Handcrafted in the same botanical/scientific language as
 * the rest of TAFAT: an open book with a sprig rising from the spine,
 * flanking leaves, a quill, scattered seed dots and four-point stars.
 *
 * The scene is drawn in `currentColor` so the surrounding surface controls
 * the tone (soft gold on the dark editorial section). Decorative only.
 */
export function EditorialStandardIllustration({ className }: IllProps) {
  return (
    <svg className={className} viewBox="0 0 960 220" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* ground line */}
        <path d="M120 168 C260 158 420 164 560 166 C700 168 820 160 880 164" opacity="0.5" />
        {/* open book */}
        <path d="M480 126 C452 110 420 106 392 108 L392 150 C420 148 452 152 480 168 C508 152 540 148 568 150 L568 108 C540 106 508 110 480 126 Z" fill="currentColor" opacity="0.09" />
        <path d="M480 126 L480 168" />
        <path d="M412 122 C434 124 456 126 476 130" opacity="0.5" strokeWidth="1.4" />
        <path d="M484 130 C504 126 526 124 548 122" opacity="0.5" strokeWidth="1.4" />
        {/* sprig rising from the book */}
        <path d="M480 116 C478 98 481 86 480 70" />
        <path d="M480 102 C470 101 466 95 467 87 C476 88 480 93 480 102 Z" fill="currentColor" opacity="0.22" />
        <path d="M480 102 C470 101 466 95 467 87" />
        <path d="M481 90 C491 89 495 94 494 102 C485 101 481 96 481 90 Z" fill="currentColor" opacity="0.22" />
        <path d="M481 90 C491 89 495 94 494 102" />
        <circle cx="480" cy="62" r="2.4" fill="currentColor" stroke="none" />
        {/* quill */}
        <path d="M616 148 C648 130 672 104 682 78" />
        <path d="M682 78 C670 88 656 102 642 116" opacity="0.55" />
        <path d="M626 138 C634 132 642 128 648 128 C648 128 640 134 630 140 C626 142 623 141 626 138 Z" fill="currentColor" opacity="0.18" />
        <path d="M618 146 C622 143 626 141 628 141 C626 143 622 147 616 150 C614 151 614 149 618 146 Z" fill="currentColor" opacity="0.18" />
        {/* flanking sprigs */}
        <path d="M288 152 C286 136 290 122 288 106" opacity="0.9" />
        <path d="M288 132 C278 131 274 125 275 117 C284 118 288 123 288 132 Z" fill="currentColor" opacity="0.22" />
        <path d="M288 132 C278 131 274 125 275 117" opacity="0.9" />
        <path d="M288.5 118 C298 117 302 122 301 130 C292 129 288 124 288.5 118 Z" fill="currentColor" opacity="0.22" />
        <path d="M288.5 118 C298 117 302 122 301 130" opacity="0.9" />
        <path d="M672 152 C674 138 670 124 672 110" opacity="0.9" />
        <path d="M672 132 C662 131 658 125 659 117 C668 118 672 123 672 132 Z" fill="currentColor" opacity="0.22" />
        <path d="M672 132 C662 131 658 125 659 117" opacity="0.9" />
        <path d="M671.5 118 C681 117 685 122 684 130 C675 129 671 124 671.5 118 Z" fill="currentColor" opacity="0.22" />
        <path d="M671.5 118 C681 117 685 122 684 130" opacity="0.9" />
        {/* stars + seed dots */}
        <path d="M352 88 q4.4 8 8.8 0 q-4.4 -8 -8.8 0 Z" fill="currentColor" opacity="0.7" stroke="none" />
        <path d="M604 92 q3.4 6.2 6.8 0 q-3.4 -6.2 -6.8 0 Z" fill="currentColor" opacity="0.7" stroke="none" />
        <path d="M432 176 q3 5.4 6 0 q-3 -5.4 -6 0 Z" fill="currentColor" opacity="0.55" stroke="none" />
        <path d="M528 176 q3 5.4 6 0 q-3 -5.4 -6 0 Z" fill="currentColor" opacity="0.55" stroke="none" />
        <circle cx="232" cy="120" r="2" fill="currentColor" opacity="0.6" stroke="none" />
        <circle cx="742" cy="112" r="2" fill="currentColor" opacity="0.6" stroke="none" />
        <circle cx="184" cy="88" r="1.7" fill="currentColor" opacity="0.45" stroke="none" />
        <circle cx="792" cy="78" r="1.7" fill="currentColor" opacity="0.45" stroke="none" />
        {/* dashed orbit arcs */}
        <path d="M60 118 C120 60 240 36 340 44" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" opacity="0.6" />
        <path d="M900 118 C840 60 720 36 620 44" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial Standard principle icons (24x24, handcrafted set)          */
/* ------------------------------------------------------------------ */

/** Eye — transparency. */
export function EyeIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

/** Four-point star — quality over hype (a merit mark, not a rating). */
export function QualityIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3.4l1.9 4.6 4.6 1.9-4.6 1.9L12 16.4l-1.9-4.6-4.6-1.9 4.6-1.9z" />
      <path d="M5.6 15.2l.9 2.2 2.2.9" opacity="0.6" />
      <path d="M18.4 15.2l-.9 2.2-2.2.9" opacity="0.6" />
    </svg>
  );
}

/** Price tag — value matters. */
export function TagIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20.3 13.4 13.4 20.3a2 2 0 0 1-2.8 0L3 12.7V3h9.7l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="8.2" cy="8.2" r="1.5" />
    </svg>
  );
}

/** Circular review arrows — continuous review. */
export function ReviewIcon({ className }: IllProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M19.6 12.6a7.7 7.7 0 1 1-2.3-5.7" />
      <path d="M19.8 3.8v3.5h-3.5" />
      <path d="M12 9.6c-1.6-.2-2.6-1-2.6-2 0-1.2 1.3-2 3-2 1.9 0 3.1.9 3.1 2.2 0 1-.9 1.7-2.4 2z" fill="currentColor" opacity="0.14" stroke="none" />
    </svg>
  );
}

/** Principle icon lookup used by the premium editorial section. */
export const principleIconByKey: Record<string, (props: IllProps) => React.ReactElement> = {
  flask: FlaskIcon,
  eye: EyeIcon,
  star: QualityIcon,
  tag: TagIcon,
  scale: ScaleIcon,
  review: ReviewIcon,
};

/** Illustration renderer lookup used by category surfaces. */
export const illustrationByKey: Record<string, (props: IllProps) => React.ReactElement> = {
  digital: DigitalIllustration,
  health: HealthIllustration,
  technology: TechnologyIllustration,
  coffee: CoffeeIllustration,
  books: BooksIllustration,
  art: ArtIllustration,
  vitamins: VitaminsIllustration,
  sleep: SleepIllustration,
  gut: GutIllustration,
  hydration: HydrationIllustration,
  movement: MovementIllustration,
  general: GeneralWellnessIllustration,
};
