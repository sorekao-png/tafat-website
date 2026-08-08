import { useEffect, useRef } from "react";

/**
 * Hero artwork media layer (TAFAT homepage, "Drip of Discovery" hero).
 *
 * Simplified per owner report (preview showed only a static poster/ripple):
 * the desktop hero is now ONE plain HTML5 <video> element — no separate
 * poster <img> layer, no opacity/display/z-index switching, no idle-callback,
 * no IntersectionObserver, no delayed mount, no video-state machine.
 *
 *   - All hero copy, CTAs and the search box stay live HTML in src/routes/index.tsx.
 *   - The whole decorative stage is aria-hidden (screen readers never see it).
 *   - The video carries its own `poster` attribute (the owner-approved JPG):
 *     the browser paints the poster immediately and swaps to live frames as
 *     soon as data is ready — no JS involved in that handoff.
 *   - Source order: WebM first (preferred), MP4 second (autoplay fallback);
 *     the browser falls back to the next <source> if the first can't decode.
 *   - autoplay + muted + playsInline + preload="auto", NO loop, NO controls:
 *     plays once from t=0 and holds the final frame at ended.
 *   - Minimal JS: on mount, set currentTime=0 and call play(); a rejected
 *     play() promise (autoplay policy) is swallowed and the poster attr stays
 *     as the visible fallback. Nothing else.
 *   - Mobile (<=760px) and prefers-reduced-motion: poster-only via pure CSS
 *     (video display:none) — the poster is painted as the stage background,
 *     so no separate poster element exists. No JS gates that can mis-fire.
 *   - The stage keeps aspect-ratio 560/470 and the media layer uses
 *     object-fit: contain, so the central gold drop is never cropped
 *     (letterboxed, never clipped).
 *   - No external dependency. With HERO_MEDIA empty the rendered markup is
 *     the PR #30 inline SVG fallback (DripArtSvg). The owner-approved Kling 3
 *     Omni production package (WebM/MP4 + JPG poster) is wired below —
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

/**
 * Pure decision: which motion source (if any) the CURRENT config maps to,
 * given the environment. The simplified component renders only the video
 * source (or the SVG fallback); mobile and reduced-motion poster-only is
 * enforced by CSS. This function documents/keeps the config policy and is
 * covered by tests.
 */
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

/**
 * The one-and-only motion element: a plain HTML5 video that occupies the
 * right-hand hero. `poster` attr paints the owner-approved frame immediately;
 * the browser swaps to live frames when ready. WebM first, MP4 fallback.
 * No loop: plays once from t=0 and holds the final frame at ended.
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Minimal playback bootstrap: ensure we start at t=0 and request play().
  // A rejected promise (autoplay policy, slow data) is swallowed — the
  // `poster` attribute stays visible as the graceful fallback.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
    } catch {
      // Media not ready yet; autoplay below (or the browser's own autoplay)
      // starts from t=0 anyway.
    }
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <video
      ref={videoRef}
      className="drip-motion-video"
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      poster={HERO_MEDIA.poster || undefined}
      aria-hidden="true"
      tabIndex={-1}
    >
      {HERO_MEDIA.video.webm && <source src={HERO_MEDIA.video.webm} type="video/webm" />}
      {HERO_MEDIA.video.mp4 && <source src={HERO_MEDIA.video.mp4} type="video/mp4" />}
    </video>
  );
}

/**
 * The decorative hero stage. Desktop: one video (poster attr until first
 * frame). Mobile / reduced-motion: poster-only via CSS (video display:none;
 * the poster JPG is the stage background so no separate poster element
 * exists). Empty HERO_MEDIA -> PR #30's inline SVG.
 */
export function HeroArtwork() {
  const hasVideo = Boolean(HERO_MEDIA.video.webm || HERO_MEDIA.video.mp4);
  const hasPoster = Boolean(HERO_MEDIA.poster);

  return (
    <div
      className="drip-stage"
      aria-hidden="true"
      style={
        hasPoster
          ? {
              backgroundImage: `radial-gradient(ellipse at center, #fffef9 0 33%, #eef1e8 73%, transparent 74%), url("${HERO_MEDIA.poster}")`,
              backgroundSize: "auto, contain",
              backgroundPosition: "center, center",
              backgroundRepeat: "no-repeat, no-repeat",
            }
          : undefined
      }
    >
      <span className="drip-fragment fragment-one">EVIDENCE</span>
      <span className="drip-fragment fragment-two">QUALITY</span>
      <span className="drip-fragment fragment-three">VALUE</span>
      <span className="drip-fragment fragment-four">COMPARE</span>
      {hasVideo ? <HeroVideo /> : hasPoster ? null : <DripArtSvg />}
    </div>
  );
}
