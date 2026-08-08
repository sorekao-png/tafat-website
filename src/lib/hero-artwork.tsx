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
 *   - Motion (video) mounts immediately after the initial client render — no
 *     idle-callback or in-view deferral (owner spec: the desktop sequence must
 *     run automatically, right away). The poster <img> still owns the first
 *     paint (eager + fetchPriority=high) and sits beneath the video; once the
 *     video reports `playing`, the poster is hidden so there is no double paint,
 *     and on video error the video element is removed so the poster is the
 *     visible fallback.
 *   - prefers-reduced-motion -> poster only (JS gate below + CSS belt-and-braces
 *     in app.css).
 *   - <=760px viewports -> poster only (or HERO_MEDIA.mobileImage when set).
 *     Desktop widths above 760px always get the video (a moderately narrow
 *     desktop is NOT treated as mobile).
 *   - The stage keeps aspect-ratio 560/470 and every media layer uses
 *     object-fit: contain, so the central gold drop is never cropped
 *     (letterboxed, never clipped).
 *   - No external dependency. With HERO_MEDIA empty the rendered markup is
 *     identical to PR #30 (inline SVG fallback poster). The owner-approved
 *     Kling 3 Omni production package (WebM/MP4 + JPG poster) is wired below —
 *     preview chain only, nothing merges to production main.
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
 * SINGLE SWAP POINT — the owner-approved Kling 3 Omni production package
 * (2026-08-08) is wired here, preview-only. Files live under public/media/ and
 * are served from the site root: WebM preferred, MP4 fallback, JPG poster.
 * The videos have no audio track; playback runs once (no loop) and holds the
 * final frame. Leave everything empty to keep the PR #30 prototype exactly as
 * approved. See /home/team/shared/hero-media-layer-design.md for the boundary
 * spec and /home/team/shared/hero-preview-final/ for the visual record.
 */
export const HERO_MEDIA: HeroMediaConfig = {
  poster: "/media/tafat-drip-discovery-poster.jpg",
  video: {
    webm: "/media/tafat-drip-discovery-hero.webm",
    mp4: "/media/tafat-drip-discovery-hero.mp4",
  },
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
      <img src={poster} alt="" width={1920} height={1080} loading="eager" fetchPriority="high" decoding="async" />
    </picture>
  );
}

/**
 * Motion layer: only rendered once mounted (environment resolved + motion
 * allowed — desktop, no reduced motion). Playback semantics per owner spec:
 * muted autoplay, playsinline, no controls, NO loop — plays once from t=0 and
 * holds the final frame at `ended`. The poster <img> beneath is the immediate
 * paint and the failure fallback.
 */
function HeroVideo({ onStateChange }: { onStateChange: (s: HeroVideoState) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Owner spec: explicitly set currentTime = 0 before calling play(), and
  // swallow a rejected play() promise so an autoplay block (or slow data)
  // never surfaces as an unhandled error — the poster simply stays visible.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let cancelled = false;
    try {
      v.currentTime = 0;
    } catch {
      // Media not ready yet; play() below (or the canplay retry) resets it.
    }
    const tryPlay = () => {
      if (cancelled || !v.paused) return;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    // If play() ran before enough data was buffered, retry once data is ready.
    v.addEventListener("canplay", tryPlay);
    return () => {
      cancelled = true;
      v.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="drip-motion-video"
      autoPlay
      muted
      playsInline
      preload="auto"
      poster={HERO_MEDIA.poster}
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => onStateChange("playing")}
      onError={() => onStateChange("error")}
    >
      {HERO_MEDIA.video.webm && <source src={HERO_MEDIA.video.webm} type="video/webm" />}
      {HERO_MEDIA.video.mp4 && <source src={HERO_MEDIA.video.mp4} type="video/mp4" />}
    </video>
  );
}

function HeroMotion({ mode, onVideoState }: { mode: Exclude<HeroMotionMode, "none">; onVideoState: (s: HeroVideoState) => void }) {
  if (mode === "video") {
    return (
      <div className="drip-motion">
        <HeroVideo onStateChange={onVideoState} />
      </div>
    );
  }
  if (mode === "animatedImage") {
    return (
      <div className="drip-motion">
        <img className="drip-motion-img" src={HERO_MEDIA.animatedImage} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className="drip-motion">
      <HeroFrameSequence frames={HERO_MEDIA.frames} />
    </div>
  );
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

export type HeroVideoState = "idle" | "playing" | "error";

/**
 * The decorative hero stage. Replaces the inline `.drip-stage` block in
 * index.tsx; renders PR #30's exact markup when HERO_MEDIA is empty.
 */
export function HeroArtwork() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoState, setVideoState] = useState<HeroVideoState>("idle");

  // Client-only environment detection. SSR and the first client render both
  // start with motion disabled, so server/client markup always matches.
  // Once the environment is known, the motion layer mounts immediately — no
  // idle-callback or in-view deferral (owner spec: automatic desktop sequence).
  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 760px)");
    const update = () => {
      const reduced = mqReduced.matches;
      const mobile = mqMobile.matches;
      setPrefersReducedMotion(reduced);
      setIsMobile(mobile);
      setMounted(resolveHeroMotion(HERO_MEDIA, { reducedMotion: reduced, isMobile: mobile }) !== "none");
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

  return (
    <div className="drip-stage" aria-hidden="true" data-video-state={videoState}>
      <span className="drip-fragment fragment-one">EVIDENCE</span>
      <span className="drip-fragment fragment-two">QUALITY</span>
      <span className="drip-fragment fragment-three">VALUE</span>
      <span className="drip-fragment fragment-four">COMPARE</span>
      <HeroPoster />
      {motionReady && mounted && <HeroMotion mode={motionMode} onVideoState={setVideoState} />}
    </div>
  );
}
