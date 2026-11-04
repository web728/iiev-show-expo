
"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

import type { PublicAlbum } from "@/lib/data/public";

type GalleryImage = PublicAlbum["images"][number];

export function LightboxGrid({
  images,
}: {
  images: PublicAlbum["images"];
}) {
  const [activeIndex, setActiveIndex] = useState<
    number | null
  >(null);

  const openerRef =
    useRef<HTMLButtonElement | null>(null);

  const closeRef =
    useRef<HTMLButtonElement | null>(null);

  const dialogRef =
    useRef<HTMLDivElement | null>(null);

  const imageCount = images.length;

  const close = useCallback(() => {
    setActiveIndex(null);

    // Return keyboard focus to the photo
    // that originally opened the preview.
    requestAnimationFrame(() => {
      openerRef.current?.focus();
    });
  }, []);

  const previous = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || imageCount === 0) {
        return current;
      }

      return (
        (current - 1 + imageCount) % imageCount
      );
    });
  }, [imageCount]);

  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || imageCount === 0) {
        return current;
      }

      return (current + 1) % imageCount;
    });
  }, [imageCount]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }

      // Keep keyboard focus within the dialog.
      if (
        event.key === "Tab" &&
        dialogRef.current
      ) {
        const controls = Array.from(
          dialogRef.current.querySelectorAll<
            HTMLButtonElement
          >(
            "button:not([disabled])"
          )
        );

        if (controls.length === 0) return;

        const first = controls[0];
        const last = controls[controls.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [activeIndex, close, previous, next]);

  const activeImage: GalleryImage | null =
    activeIndex !== null
      ? images[activeIndex] ?? null
      : null;

  if (imageCount === 0) return null;

  return (
    <>
      {/* PHOTO-ONLY MASONRY GRID */}
      <ul className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 xl:columns-4">
        {images.map((image, index) => (
          <li
            key={`${image.src}-${index}`}
            className="mb-3 break-inside-avoid sm:mb-4"
          >
            <button
              type="button"
              onClick={(event) => {
                openerRef.current =
                  event.currentTarget;

                setActiveIndex(index);
              }}
              aria-label={`View photograph: ${image.alt}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[15px] bg-[#EEF3EF] outline-none ring-offset-4 focus-visible:ring-2 focus-visible:ring-[#23A455]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width ?? 1200}
                height={image.height ?? 800}
                sizes="(min-width:1280px) 24vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                loading="lazy"
                className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
                style={{
                  objectPosition: `${
                    image.focalX ?? 50
                  }% ${image.focalY ?? 50}%`,
                }}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* FULLSCREEN PHOTO VIEWER */}
      {activeImage && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Exhibition photograph viewer"
          className="fixed inset-0 z-[100] flex flex-col bg-[#091B13] text-white"
        >
          {/* CLOSE CONTROL — OUTSIDE IMAGE */}
          <div className="flex h-16 shrink-0 items-center justify-end px-4 sm:h-20 sm:px-8">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close photo viewer"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A455]"
            >
              <X
                size={23}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* ONLY PHOTO — NO OVERLAY OR TEXT */}
          <div className="relative min-h-0 flex-1 px-3 sm:px-8">
            <div className="relative mx-auto h-full w-full max-w-[1500px]">
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* NAVIGATION OUTSIDE IMAGE */}
          <div className="flex h-20 shrink-0 items-center justify-center gap-5 sm:h-24">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous photo"
              className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] text-white transition-colors hover:border-[#23A455] hover:bg-[#23A455]"
            >
              <ArrowLeft
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] text-white transition-colors hover:border-[#23A455] hover:bg-[#23A455]"
            >
              <ArrowRight
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
