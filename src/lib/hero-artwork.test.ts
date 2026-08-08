import { describe, expect, test } from "bun:test";
import { HERO_MEDIA, resolveHeroMotion, type HeroMediaConfig } from "./hero-artwork";
const empty: HeroMediaConfig = {
  poster: "",
  video: { webm: "", mp4: "" },
  animatedImage: "",
  frames: { base: "", count: 0, ext: "webp" },
  mobileImage: "",
};
const withVideo: HeroMediaConfig = { ...empty, video: { webm: "/hero/hero.webm", mp4: "/hero/hero.mp4" } };
const withAnimatedImage: HeroMediaConfig = { ...empty, animatedImage: "/hero/hero-loop.webp" };
const withFrames: HeroMediaConfig = { ...empty, frames: { base: "/hero/frames/f-", count: 120, ext: "webp" } };
describe("resolveHeroMotion", () => {
  test("empty config -> none on desktop without reduced motion", () => {
    expect(resolveHeroMotion(empty, { reducedMotion: false, isMobile: false })).toBe("none");
  });
  test("video wins when configured", () => {
    expect(resolveHeroMotion(withVideo, { reducedMotion: false, isMobile: false })).toBe("video");
  });
  test("animated image is used when no video is configured", () => {
    expect(resolveHeroMotion(withAnimatedImage, { reducedMotion: false, isMobile: false })).toBe("animatedImage");
  });
  test("frame sequence is used when no video or animated image is configured", () => {
    expect(resolveHeroMotion(withFrames, { reducedMotion: false, isMobile: false })).toBe("frames");
  });
  test("frame config without a base path -> none", () => {
    const brokenFrames: HeroMediaConfig = { ...empty, frames: { base: "", count: 120, ext: "webp" } };
    expect(resolveHeroMotion(brokenFrames, { reducedMotion: false, isMobile: false })).toBe("none");
  });
  test("reduced motion -> poster only, regardless of any configured media", () => {
    expect(resolveHeroMotion(withVideo, { reducedMotion: true, isMobile: false })).toBe("none");
    expect(resolveHeroMotion(withAnimatedImage, { reducedMotion: true, isMobile: false })).toBe("none");
    expect(resolveHeroMotion(withFrames, { reducedMotion: true, isMobile: false })).toBe("none");
  });
  test("mobile -> poster/simplified source only, no motion", () => {
    expect(resolveHeroMotion(withVideo, { reducedMotion: false, isMobile: true })).toBe("none");
    expect(resolveHeroMotion(withAnimatedImage, { reducedMotion: false, isMobile: true })).toBe("none");
    expect(resolveHeroMotion(withFrames, { reducedMotion: false, isMobile: true })).toBe("none");
  });
});
describe("HERO_MEDIA live config (owner-approved Kling 3 Omni production package)", () => {
  test("poster is wired to the exact supplied JPG", () => {
    expect(HERO_MEDIA.poster).toBe("/media/tafat-drip-discovery-poster.jpg");
  });
  test("video slots carry the exact supplied WebM (preferred) and MP4 (fallback)", () => {
    expect(HERO_MEDIA.video.webm).toBe("/media/tafat-drip-discovery-hero.webm");
    expect(HERO_MEDIA.video.mp4).toBe("/media/tafat-drip-discovery-hero.mp4");
  });
  test("other motion sources stay empty (video is the chosen source)", () => {
    expect(HERO_MEDIA.animatedImage).toBe("");
    expect(HERO_MEDIA.frames.count).toBe(0);
    expect(HERO_MEDIA.frames.base).toBe("");
    expect(HERO_MEDIA.mobileImage).toBe("");
  });
  test("desktop without reduced motion -> video; reduced motion and mobile -> poster only", () => {
    expect(resolveHeroMotion(HERO_MEDIA, { reducedMotion: false, isMobile: false })).toBe("video");
    expect(resolveHeroMotion(HERO_MEDIA, { reducedMotion: true, isMobile: false })).toBe("none");
    expect(resolveHeroMotion(HERO_MEDIA, { reducedMotion: false, isMobile: true })).toBe("none");
  });
});
