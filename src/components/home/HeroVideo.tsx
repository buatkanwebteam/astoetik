"use client";

import { useEffect, useRef, useState } from "react";

// Latar video YouTube lewat IFrame API: tanpa kontrol, tanpa subtitle, loop dari detik `start`,
// dan meminta kualitas HD. Video tidak diunduh ke codebase.
interface YTPlayer {
  destroy(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  mute(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  setPlaybackQuality(q: string): void;
  unloadModule?(name: string): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (e: { target: YTPlayer }) => void;
        onStateChange: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

export function HeroVideo({ videoId, start = 0 }: { videoId: string; start?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const inView = useRef(true);
  const playerRef = useRef<YTPlayer | null>(null);
  // Video baru ditampilkan saat benar-benar playing, supaya tombol play/loading YouTube tidak pernah terlihat.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let player: YTPlayer | undefined;
    let cancelled = false;

    loadApi().then((YT) => {
      if (cancelled || !host.current) return;
      const mount = document.createElement("div");
      host.current.appendChild(mount);
      player = playerRef.current = new YT.Player(mount, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0, // subtitle mati
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start,
          vq: "hd720",
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.setVolume(0);
            e.target.setPlaybackQuality("hd720");
            e.target.playVideo();
          },
          onStateChange: (e) => {
            // Pastikan tetap bisu di setiap perubahan status (play, pause, loop).
            e.target.mute();
            e.target.setVolume(0);
            if (e.data === 1) {
              e.target.setPlaybackQuality("hd720"); // playing
              setVisible(true);
            }
            if (e.data === 2 || e.data === 5) {
              // paused / cued: sembunyikan lalu paksa jalan lagi
              setVisible(false);
              if (inView.current) e.target.playVideo();
            }
            if (e.data === 0) {
              // ended: ulang dari detik `start`
              e.target.seekTo(start, true);
              e.target.playVideo();
            }
          },
        },
      });
    });

    // Hemat CPU/GPU: jeda video saat hero tidak terlihat.
    const el = host.current;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      const p = playerRef.current;
      if (!p) return;
      try {
        if (entry.isIntersecting) p.playVideo();
        else p.pauseVideo();
      } catch {
        /* player belum siap */
      }
    });
    if (el) io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      playerRef.current = null;
      player?.destroy();
    };
  }, [videoId, start]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Diperbesar dari tengah; navbar blur menutupi sisa logo di kiri atas video. */}
      <div
        ref={host}
        className={`absolute left-1/2 top-1/2 h-[max(100vh,56.25vw)] w-[max(100vw,177.78vh)] origin-center -translate-x-1/2 -translate-y-1/2 scale-[1.35] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
