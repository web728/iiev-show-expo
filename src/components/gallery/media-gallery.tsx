"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Clapperboard,
  Play,
  X,
} from "lucide-react";

type Photo = { src: string; folder: string };
type Tab = "photos" | "videos";

const PHOTO_BATCH = 24;
const VIDEO_BATCH = 6;

/* ---------- helpers ---------- */

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fileLabel(src: string) {
  const last = src.split("/").pop() ?? src;
  let name = last;

  try {
    name = decodeURIComponent(last);
  } catch {
    /* keep raw name */
  }

  return humanize(name.replace(/\.[^.]+$/, ""));
}

function pauseOthers(event: SyntheticEvent<HTMLVideoElement>) {
  document.querySelectorAll("video").forEach((video) => {
    if (video !== event.currentTarget) video.pause();
  });
}

function GalleryStyles() {
  return (
    <style>{`
      @keyframes gal-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: none; }
      }
      .gal-fade-up { animation: gal-fade-up .6s cubic-bezier(.22,1,.36,1) both; }
      @media (prefers-reduced-motion: reduce) {
        .gal-fade-up { animation: none; }
      }
    `}</style>
  );
}

/* ---------- photo tile (memoised: new batches don't re-render old tiles) ---------- */

const PhotoTile = memo(function PhotoTile({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: (index: number, el: HTMLButtonElement) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const label = fileLabel(photo.src);

  return (
    <li>
      <button
        type="button"
        onClick={(event) => onOpen(index, event.currentTarget)}
        aria-label={`View photograph: ${label}`}
        className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#E8F0EA] outline-none ring-[#23A455] ring-offset-2 focus-visible:ring-2"
      >
        {!loaded && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#E8F0EA] to-[#F4F8F5]"
          />
        )}

        <Image
          src={photo.src}
          alt={`Exhibition photograph: ${label}`}
          fill
          sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
          quality={60}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B13]/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </button>
    </li>
  );
});

/* ---------- lightbox ---------- */

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const count = photos.length;
  const current = photos[index];

  const prev = useCallback(
    () => onIndex((index - 1 + count) % count),
    [index, count, onIndex]
  );

  const next = useCallback(
    () => onIndex((index + 1) % count),
    [index, count, onIndex]
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "Tab" && dialogRef.current) {
        const controls = Array.from(
          dialogRef.current.querySelectorAll<HTMLButtonElement>(
            "button:not([disabled])"
          )
        );

        if (controls.length === 0) return;

        const first = controls[0];
        const last = controls[controls.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, prev, next]);

  if (!current) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Exhibition photograph viewer"
      className="fixed inset-0 z-[100] flex flex-col bg-[#091B13] text-white"
    >
      <div className="flex h-16 shrink-0 items-center justify-end px-4 sm:h-20 sm:px-8">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A455]"
        >
          <X size={23} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1 px-3 sm:px-8"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(delta) > 50) {
            if (delta > 0) prev();
            else next();
          }
        }}
      >
        <div className="relative mx-auto h-full w-full max-w-[1500px]">
          <Image
            key={current.src}
            src={current.src}
            alt={`Exhibition photograph: ${fileLabel(current.src)}`}
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-contain"
          />

          {/* warm the cache for neighbours */}
          {count > 1 &&
            [(index + 1) % count, (index - 1 + count) % count].map(
              (i) => (
                <Image
                  key={photos[i].src}
                  src={photos[i].src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="100vw"
                  quality={80}
                  loading="eager"
                  className="hidden"
                />
              )
            )}
        </div>
      </div>

      <div className="flex h-20 shrink-0 items-center justify-center gap-5 sm:h-24">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous photo"
          className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] transition-colors hover:border-[#23A455] hover:bg-[#23A455]"
        >
          <ArrowLeft size={21} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <span className="min-w-[88px] text-center text-xs font-semibold tabular-nums text-white/70">
          {index + 1} / {count}
        </span>

        <button
          type="button"
          onClick={next}
          aria-label="Next photo"
          className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] transition-colors hover:border-[#23A455] hover:bg-[#23A455]"
        >
          <ArrowRight size={21} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ---------- photos panel ---------- */

function PhotosPanel({ photos }: { photos: Photo[] }) {
  const [folder, setFolder] = useState("all");
  const [visible, setVisible] = useState(PHOTO_BATCH);
  const [active, setActive] = useState<number | null>(null);

  const openerRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach((p) =>
      counts.set(p.folder, (counts.get(p.folder) ?? 0) + 1)
    );

    return [...counts.entries()].sort((a, b) =>
      b[0].localeCompare(a[0], undefined, { numeric: true })
    );
  }, [photos]);

  const filtered = useMemo(
    () =>
      folder === "all"
        ? photos
        : photos.filter((p) => p.folder === folder),
    [photos, folder]
  );

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const loadMore = useCallback(
    () =>
      setVisible((v) => Math.min(v + PHOTO_BATCH, filtered.length)),
    [filtered.length]
  );

  // Infinite scroll: next batch loads shortly before the user reaches the end.
  useEffect(() => {
    if (!hasMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "1200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visible, loadMore]);

  const onOpen = useCallback(
    (index: number, el: HTMLButtonElement) => {
      openerRef.current = el;
      setActive(index);
    },
    []
  );

  const close = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const selectFolder = (value: string) => {
    setFolder(value);
    setVisible(PHOTO_BATCH);
    setActive(null);
  };

  if (photos.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#DFE9E1] bg-[#F6FAF7] px-7 py-16 text-center">
        <h3 className="text-xl font-extrabold text-[#102A1E]">
          No photos found
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#647469]">
          Add images to the public/images folder and they will
          appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      {folders.length > 1 && (
        <div
          role="group"
          aria-label="Filter photos by folder"
          className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {[["all", photos.length] as const, ...folders].map(
            ([key, total]) => {
              const selected = folder === key;
              const label =
                key === "all"
                  ? "All Photos"
                  : key === ""
                    ? "Other"
                    : humanize(key);

              return (
                <button
                  key={key || "other"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectFolder(key)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold transition-all duration-300 ${
                    selected
                      ? "border-[#23A455] bg-[#23A455] text-white shadow-[0_10px_24px_-14px_rgba(35,164,85,.8)]"
                      : "border-[#DDE8DF] bg-white text-[#35503F] hover:border-[#23A455]/50 hover:bg-[#F3F9F4]"
                  }`}
                >
                  {label}
                 
                </button>
              );
            }
          )}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((photo, index) => (
          <PhotoTile
            key={photo.src}
            photo={photo}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-xs font-semibold text-[#6B7D70]">
          Showing {shown.length} of {filtered.length} photos
        </p>

        {hasMore && (
          <>
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#DDE8DF] bg-white px-6 text-[12px] font-bold text-[#16893F] transition-colors hover:border-[#23A455] hover:bg-[#F3F9F4]"
            >
              Load more photos
            </button>
          </>
        )}
      </div>

      {active !== null && (
        <Lightbox
          photos={filtered}
          index={active}
          onIndex={setActive}
          onClose={close}
        />
      )}
    </>
  );
}

/* ---------- videos panel ---------- */

function VideoCard({ src }: { src: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // The <video> element is only created when the card is near the viewport,
  // and only metadata (first frame) is requested, never the whole file.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const title = fileLabel(src);

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#DEE9E0] bg-white shadow-[0_15px_45px_-40px_rgba(9,27,19,.35)] transition-all duration-500 hover:-translate-y-1 hover:border-[#23A455]/45 hover:shadow-[0_28px_58px_-40px_rgba(9,27,19,.4)]">
      <div
        ref={boxRef}
        className="relative aspect-video overflow-hidden bg-[#091B13]"
      >
        {inView ? (
          <video
            src={`${src}#t=0.6`}
            controls
            playsInline
            preload="metadata"
            onPlay={pauseOthers}
            aria-label={title}
            className="absolute inset-0 size-full bg-black object-contain"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#102A1E] to-[#091B13]"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-white/10 text-white">
              <Play size={22} fill="currentColor" />
            </span>
          </div>
        )}
      </div>

     
    </article>
  );
}

function VideosPanel({
  videos,
  extra,
}: {
  videos: string[];
  extra: ReactNode;
}) {
  const [visible, setVisible] = useState(VIDEO_BATCH);
  const shown = videos.slice(0, visible);
  const hasMore = visible < videos.length;

 

  return (
    <>
      {videos.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((src) => (
              <VideoCard key={src} src={src} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
           

            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  setVisible((v) =>
                    Math.min(v + VIDEO_BATCH, videos.length)
                  )
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#DDE8DF] bg-white px-6 text-[12px] font-bold text-[#16893F] transition-colors hover:border-[#23A455] hover:bg-[#F3F9F4]"
              >
                Load more videos
              </button>
            )}
          </div>
        </>
      )}

       
    </>
  );
}

/* ---------- main component ---------- */

export function MediaGallery({
  photos,
  videos,
  videosExtra = null,
}: {
  photos: Photo[];
  videos: string[];
  videosExtra?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("photos");

  // #videos / #photos in the URL pick the tab (the old /videos/ page redirects to #videos).
  useEffect(() => {
    const apply = () => {
      if (window.location.hash === "#videos") setTab("videos");
      else if (window.location.hash === "#photos") setTab("photos");
    };

    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const select = useCallback((next: Tab) => {
    setTab(next);
    try {
      window.history.replaceState(null, "", `#${next}`);
    } catch {
      /* ignore */
    }
  }, []);

  const isPhotos = tab === "photos";

  return (
    <div className="bg-white">
      <GalleryStyles />

      {/* INTRO + TOGGLE */}
      <section className="pb-8 pt-14 sm:pb-10 sm:pt-20">
        <div className="mx-auto max-w-[1380px] px-4 text-center sm:px-7 lg:px-10">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#23A455]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#16893F]">
              {isPhotos ? "Exhibition Moments" : "Exhibition Films"}
            </span>
            <span className="h-px w-8 bg-[#23A455]" />
          </div>

          <h2
            key={tab}
            className="gal-fade-up mt-5 text-[clamp(2rem,4.6vw,3.9rem)] font-extrabold leading-[1.1] tracking-[-0.055em] text-[#102A1E]"
          >
            {isPhotos ? (
              <>
                Moments from the{" "}
                <span className="text-[#23A455]">
                  exhibition floor.
                </span>
              </>
            ) : (
              <>
                Experience the show{" "}
                <span className="text-[#23A455]">
                  through video.
                </span>
              </>
            )}
          </h2>

          {/* Toggle */}
          <div className="mt-9 flex justify-center">
            <div
              role="tablist"
              aria-label="Choose media type"
              className="relative inline-grid grid-cols-2 rounded-full border border-[#DDE8DF] bg-white p-1.5 shadow-[0_18px_40px_-28px_rgba(9,27,19,.5)]"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-[#23A455] shadow-[0_10px_24px_-12px_rgba(35,164,85,.9)] transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${
                  isPhotos ? "translate-x-0" : "translate-x-full"
                }`}
              />

              {(
                [
                  ["photos", "Photos", Camera, photos.length],
                  ["videos", "Videos", Clapperboard, videos.length],
                ] as const
              ).map(([key, label, Icon, total]) => {
                const selected = tab === key;

                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    id={`tab-${key}`}
                    aria-selected={selected}
                    aria-controls={`panel-${key}`}
                    onClick={() => select(key)}
                    className={`relative z-10 inline-flex min-h-12 min-w-[140px] items-center justify-center gap-2 rounded-full px-6 text-[13px] font-extrabold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A455] sm:min-w-[170px] ${
                      selected
                        ? "text-white"
                        : "text-[#35503F] hover:text-[#16893F]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                    {label}
                    
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE PANEL (the inactive one is unmounted, so nothing extra loads) */}
      <section className="mx-auto max-w-[1380px] px-4 pb-20 sm:px-7 sm:pb-28 lg:px-10">
        <div
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="gal-fade-up"
        >
          {isPhotos ? (
            <PhotosPanel photos={photos} />
          ) : (
            <VideosPanel videos={videos} extra={videosExtra} />
          )}
        </div>
      </section>
    </div>
  );
}