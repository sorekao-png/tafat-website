import { useEffect, useRef, useState } from "react";

/**
 * Hero artwork media layer (TAFAT homepage, "Drip of Discovery" hero).
 *
 * Why this exists: the artwork in the hero is currently a flat inline SVG
 * (PR #30). The owner approved the structural prototype but rejected the flat
 * artwork and will upload a cinematic asset separately (optimized WebM/MP4 +
 * poster, or an animated image/sequence). This component makes the artwork
 * slot *swappable* without touching the approved structure:
 *
 *   - All hero copy, CTAs and the search box stay live HTML in src/routes/index.tsx.
 *   - The whole decorative stage is aria-hidden (screen readers never see it).
 *   - A poster paints immediately: the inline SVG today, or the owner's poster
 *     image once HERO_MEDIA.poster is set. The poster never waits for motion.
 *   - Motion (video / animated image / frame sequence) is never fetched
 *     up-front: video uses preload="none", images use loading="lazy", and the
 *     element only mounts after the browser is idle AND the stage is near the
 *     viewport, and only when the user has not requested reduced motion and the
 *     screen is not a phone. It therefore can never block LCP.
 *   - prefers-reduced-motion -> poster only (JS gate below + CSS belt-and-braces
 *     in app.css).
 *   - <=760px viewports -> poster only (or HERO_MEDIA.mobileImage when set).
 *   - The stage keeps aspect-ratio 560/470 and every media layer uses
 *     object-fit: contain, so the central gold drop is never cropped
 *     (letterboxed, never clipped).
 *   - No external dependency. HERO_MEDIA is currently empty (owner paused the
 *     poster direction, 2026-08-08): with an empty HERO_MEDIA the rendered
 *     markup is identical to PR #30. The boundary stays ready for the next
 *     cinematic asset.
 */

export type HeroVideoSources = { webm: string; mp4: string };
export type HeroFrameSequence = { base: string; count: number; ext: string };

export type HeroMediaConfig = {
  /** Static poster shown immediately. Empty -> the inline SVG stays the poster. */
  poster: string;
  /** Cinematic loop. Prefer WebM; MP4 is the fallback source. Must not contain baked text. */
  video: HeroVideoSources;
  /** Animated image (WebP/GIF) — simpler alternative to video. Must not contain baked text. */
  animatedImage: string;
  /** Numbered frame sequence — alternative motion source (last resort; heavy). */
  frames: HeroFrameSequence;
  /** Simpler static image for small screens. Empty -> the poster is used on mobile. */
  mobileImage: string;
};

/**
 * SINGLE SWAP POINT — fill these paths when the owner delivers the cinematic
 * asset (place files under public/ and reference them from the site root, e.g.
 * "/hero/hero.webm"). Leave everything empty to keep the PR #30 prototype
 * exactly as approved. See /home/team/shared/hero-media-layer-design.md for the
 * full asset spec (frame 560:470, gold drop centered, no baked text).
 *
 * Pause state (owner, 2026-08-08): the previous poster direction is paused and
 * NOT an approved final treatment. `poster` is unpinned (empty) and the
 * uploaded poster file was removed from the tree. Wire the new photorealistic
 * cinematic asset here when the owner delivers it.
 */
export const HERO_MEDIA: HeroMediaConfig = {
  poster: "",
  video: { webm: "", mp4: "" },
  animatedImage: "",
  frames: { base: "", count: 0, ext: "webp" },
  mobileImage: "",
};

export type HeroMotionMode = "none" | "video" | "animatedImage" | "frames";

/** Pure decision: which motion source (if any) should run, given the environment. */
export function resolveHeroMotion(
  media: HeroMediaConfig,
  env: { reducedMotion: boolean; isMobile: boolean },
): HeroMotionMode {
  if (env.reducedMotion || env.isMobile) return "none";
  if (media.video.webm || media.video.mp4) return "video";
  if (media.animatedImage) return "animatedImage";
  if (media.frames.count > 0 && media.frames.base) return "frames";
  return "none";
}

/** The drip-art SVG exactly as shipped in PR #30 (fallback poster, no media configured). */
function DripArtSvg() {
  return (
    <svg className="drip-art" viewBox="0 0 560 470" role="presentation">
      <path className="drip-motif motif-left" d="M72 176h76m-38-38v76M92 346c18-22 40-22 58 0-18 22-40 22-58 0Z" />
      <path className="drip-motif motif-right" d="M425 142c18-20 42-20 60 0-18 20-42 20-60 0Zm10 178h58m-29-29v58" />
      <circle className="drip-orbit" cx="280" cy="308" r="112" />
      <ellipse className="drip-ripple" cx="280" cy="314" rx="142" ry="29" />
      <path className="drip-drop" d="M280 86c-18 29-34 49-34 68a34 34 0 0 0 68 0c0-19-16-39-34-68Z" />
      <text className="drip-mark" x="280" y="318" textAnchor="middle">TAFAT</text>
      <circle className="drip-spark" cx="280" cy="314" r="4" />
    </svg>
  );
}

/** Poster slot: paints on first render. `<picture>` picks the mobile image on small screens. */
function HeroPoster() {
  const { poster, mobileImage } = HERO_MEDIA;
  if (!poster) return <DripArtSvg />;
  return (
    <picture className="drip-poster">
      {mobileImage && <source media="(max-width: 760px)" srcSet={mobileImage} />}
      <img src={poster} alt="" width={560} height={470} loading="eager" fetchPriority="high" decoding="async" />
    </picture>
  );
}

/** Motion layer: only rendered once mounted (idle + in-view + motion allowed). */
function HeroMotion({ mode }: { mode: Exclude<HeroMotionMode, "none"> }) {
  if (mode === "video") {
    return (
      <video className="drip-motion-video" autoPlay muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}>
        {HERO_MEDIA.video.webm && <source src={HERO_MEDIA.video.webm} type="video/webm" />}
        {HERO_MEDIA.video.mp4 && <source src={HERO_MEDIA.video.mp4} type="video/mp4" />}
      </video>
    );
  }
  if (mode === "animatedImage") {
    return <img className="drip-motion-img" src={HERO_MEDIA.animatedImage} alt="" loading="lazy" decoding="async" />;
  }
  return <HeroFrameSequence frames={HERO_MEDIA.frames} />;
}

/** JS-driven image sequence (~30fps). Last-resort motion source. */
function HeroFrameSequence({ frames }: { frames: HeroFrameSequence }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (frames.count <= 1) return;
    let raf = 0;
    let last = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (now - last >= 33) {
        setFrame((current) => (current + 1) % frames.count);
        last = now;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [frames.count]);
  return (
    <img
      className="drip-motion-seq"
      src={`${frames.base}${String(frame).padStart(3, "0")}.${frames.ext}`}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * The decorative hero stage. Replaces the inline `.drip-stage` block in
 * index.tsx; renders PR #30's exact markup when HERO_MEDIA is empty.
 */
export function HeroArtwork() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Client-only environment detection. SSR and the first client render both
  // start with motion disabled, so server/client markup always matches.
  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setPrefersReducedMotion(mqReduced.matches);
      setIsMobile(mqMobile.matches);
    };
    update();
    mqReduced.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqReduced.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  const motionMode = resolveHeroMotion(HERO_MEDIA, { reducedMotion: prefersReducedMotion, isMobile });
  const motionReady = motionMode !== "none";

  // Defer mounting the motion layer until the main thread is idle AND the stage
  // is near the viewport, so hero motion can never delay LCP or first paint.
  useEffect(() => {
    if (!motionReady) return;
    const el = stageRef.current;
    if (!el) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let idleHandle: number | null = null;

    const armObserver = () => {
      if (cancelled) return;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setMounted(true);
            observer?.disconnect();
          }
        },
        { rootMargin: "200px 0px" },
      );
      observer.observe(el);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(armObserver, { timeout: 2500 });
    } else {
      idleHandle = window.setTimeout(armObserver, 300);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null) {
        if (typeof window.requestIdleCallback === "function") window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
      observer?.disconnect();
    };
  }, [motionReady]);

  return (
    <div className="drip-stage" aria-hidden="true" ref={stageRef}>
      <span className="drip-fragment fragment-one">EVIDENCE</span>
      <span className="drip-fragment fragment-two">QUALITY</span>
      <span className="drip-fragment fragment-three">VALUE</span>
      <span className="drip-fragment fragment-four">COMPARE</span>
      <HeroPoster />
      {motionReady && mounted && <HeroMotion mode={motionMode} />}
    </div>
  );
}
