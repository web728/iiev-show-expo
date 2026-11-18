"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { mainNav, type NavItem } from "@/config/site";

const EASE = [0.22, 1, 0.36, 1] as const;

const REGISTER_URL = "/visit/register/";
const EXHIBIT_URL = "/exhibit/book-a-stall/";

/* ---------- path helpers ---------- */

function normalizePath(path: string) {
  const clean = path.split("#")[0].split("?")[0];
  if (clean === "/") return "/";
  return clean.replace(/\/+$/, "");
}

function matchesPath(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  return (
    current === target ||
    (target !== "/" && current.startsWith(`${target}/`))
  );
}

function isActive(pathname: string, item: NavItem) {
  return (
    matchesPath(pathname, item.href) ||
    Boolean(
      item.children?.some((child) =>
        matchesPath(pathname, child.href)
      )
    )
  );
}

/* ---------- desktop item ---------- */

function DesktopItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const openedByHover = useRef(false);

  const menuId = useId();
  const reduceMotion = useReducedMotion();

  const hasChildren = Boolean(item.children?.length);
  const active = isActive(pathname, item);

  const clearTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (byHover: boolean) => {
    clearTimer();
    openedByHover.current = byHover;
    setOpen(true);
  };

  const scheduleClose = () => {
    clearTimer();
    closeTimer.current = setTimeout(() => {
      openedByHover.current = false;
      setOpen(false);
    }, 140);
  };

  // Close when the route changes.
  useEffect(() => {
    clearTimer();
    setOpen(false);
  }, [pathname]);

  // Clean up the timer on unmount.
  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      if (
        itemRef.current &&
        !itemRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        itemRef.current
          ?.querySelector<HTMLButtonElement>("button")
          ?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointer
      );
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const baseClass = `
    group relative inline-flex h-11 items-center
    gap-1.5 rounded-xl px-3.5
    text-[13px] font-bold
    tracking-[-0.01em]
    transition-colors duration-200
    hover:bg-[#F1F8F3]
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[#23A455]
    ${
      active || open
        ? "text-[#16893F]"
        : "text-[#20352A] hover:text-[#16893F]"
    }
  `;

  const underline = (visible: boolean) => (
    <span
      aria-hidden="true"
      className={`
        absolute bottom-1 left-3.5 right-3.5
        h-[2px] origin-left rounded-full
        bg-gradient-to-r from-[#23A455] to-[#7BD69A]
        transition-transform duration-300
        ${
          visible
            ? "scale-x-100"
            : "scale-x-0 group-hover:scale-x-100"
        }
      `}
    />
  );

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          className={baseClass}
          aria-current={
            matchesPath(pathname, item.href)
              ? "page"
              : undefined
          }
        >
          {item.label}
          {underline(active)}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={itemRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") openMenu(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") scheduleClose();
      }}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={baseClass}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => {
          // If hover already opened the menu, a click keeps it open
          // instead of closing it right away.
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((previous) => !previous);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu(false);
            window.setTimeout(() => {
              itemRef.current
                ?.querySelector<HTMLAnchorElement>(
                  "[data-dropdown] a"
                )
                ?.focus();
            }, 40);
          }
        }}
      >
        {item.label}

        <ChevronDown
          size={15}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />

        {underline(active || open)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            data-dropdown
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 10, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.98 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: EASE,
            }}
            className="
              absolute left-1/2 top-full z-50
              w-[350px] -translate-x-1/2 pt-3
            "
          >
            <div
              className="
                relative overflow-hidden rounded-2xl
                border border-white/10
                bg-[#102A1E]
                p-2.5 text-white
                shadow-[0_30px_70px_-20px_rgba(0,0,0,0.45)]
              "
            >
              {/* decorative glow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.28),transparent)]"
              />

              <div className="relative px-3.5 pb-3 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#71D49A]">
                  {item.label}
                </p>
                <div className="mt-3 h-px bg-white/10" />
              </div>

              <ul className="relative space-y-1">
                {item.children?.map((child) => {
                  const selected = matchesPath(
                    pathname,
                    child.href
                  );

                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setOpen(false)}
                        aria-current={
                          selected ? "page" : undefined
                        }
                        className={`
                          group/link flex items-start
                          justify-between gap-4
                          rounded-xl px-3.5 py-3
                          transition-colors duration-200
                          focus-visible:outline-2
                          focus-visible:outline-[#23A455]
                          ${
                            selected
                              ? "bg-white/10"
                              : "hover:bg-white/[0.07]"
                          }
                        `}
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-2 text-[13px] font-bold text-white">
                            {selected && (
                              <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-[#23A455]"
                              />
                            )}
                            {child.label}
                          </span>

                          {child.description && (
                            <span className="mt-1 block text-[11px] leading-5 text-white/55">
                              {child.description}
                            </span>
                          )}
                        </div>

                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="
                            mt-0.5 shrink-0 text-[#71D49A]
                            transition-transform duration-200
                            group-hover/link:-translate-y-0.5
                            group-hover/link:translate-x-0.5
                          "
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ---------- mobile drawer ---------- */

function MobileMenu({
  open,
  onClose,
  pathname,
  editionLine,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  editionLine: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(
    null
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open the section of the current page by default.
  useEffect(() => {
    if (!open) return;

    const current = mainNav.find(
      (item) =>
        item.children?.length && isActive(pathname, item)
    );

    setExpanded(current?.href ?? null);
  }, [open, pathname]);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]'
        ) ?? []
      );

    focusables()[0]?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusables();
      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

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

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);

      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const itemMotion = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x: 16 },
          animate: { opacity: 1, x: 0 },
          transition: {
            delay: 0.08 + index * 0.04,
            duration: 0.35,
            ease: EASE,
          },
        };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] xl:hidden"
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-[#07170F]/75 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? {} : { x: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 320,
                    damping: 35,
                    mass: 0.9,
                  }
            }
            className="
              absolute inset-y-0 right-0
              flex w-full max-w-[390px]
              flex-col overflow-hidden
              border-l border-white/10
              bg-[#0D2418] text-white
              shadow-[-20px_0_60px_rgba(0,0,0,0.25)]
            "
          >
            {/* drawer glow */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.25),transparent)]"
            />

            {/* Header */}
            <div className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
              <div className="min-w-0 pr-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-white">
                  India International EV Show
                </p>
                {editionLine && (
                  <p className="mt-1 truncate text-[10px] text-[#71D49A]">
                    {editionLine}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="
                  flex size-11 shrink-0 items-center
                  justify-center rounded-full
                  border border-white/15
                  text-white transition-colors
                  hover:border-[#23A455]
                  hover:bg-[#23A455]
                  focus-visible:outline-2
                  focus-visible:outline-[#23A455]
                "
              >
                <X size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            {/* Links */}
            <nav
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                <motion.li {...itemMotion(0)}>
                  <Link
                    href="/"
                    onClick={onClose}
                    aria-current={
                      pathname === "/" ? "page" : undefined
                    }
                    className={`
                      flex min-h-12 items-center
                      rounded-xl px-4 text-[14px]
                      font-bold transition-colors
                      ${
                        pathname === "/"
                          ? "bg-[#23A455]/15 text-[#71D49A]"
                          : "text-white/85 hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    Home
                  </Link>
                </motion.li>

                {mainNav.map((item, index) => {
                  const hasChildren = Boolean(
                    item.children?.length
                  );
                  const active = isActive(pathname, item);
                  const isExpanded = expanded === item.href;

                  return (
                    <motion.li
                      key={item.href}
                      {...itemMotion(index + 1)}
                    >
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpanded((previous) =>
                                previous === item.href
                                  ? null
                                  : item.href
                              )
                            }
                            className={`
                              flex min-h-12 w-full
                              items-center justify-between
                              rounded-xl px-4 text-left
                              text-[14px] font-bold
                              transition-colors
                              hover:bg-white/[0.06]
                              ${
                                active || isExpanded
                                  ? "text-[#71D49A]"
                                  : "text-white/85"
                              }
                            `}
                          >
                            {item.label}

                            <ChevronDown
                              size={18}
                              aria-hidden="true"
                              className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.ul
                                initial={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: reduceMotion
                                    ? 0
                                    : 0.25,
                                  ease: EASE,
                                }}
                                className="overflow-hidden"
                              >
                                <li className="ml-4 border-l border-[#23A455]/40 py-2 pl-3">
                                  <ul className="space-y-1">
                                    {item.children?.map(
                                      (child) => {
                                        const selected =
                                          matchesPath(
                                            pathname,
                                            child.href
                                          );

                                        return (
                                          <li key={child.href}>
                                            <Link
                                              href={child.href}
                                              onClick={onClose}
                                              aria-current={
                                                selected
                                                  ? "page"
                                                  : undefined
                                              }
                                              className={`
                                                block rounded-lg
                                                px-3 py-2.5
                                                transition-colors
                                                hover:bg-white/[0.06]
                                                ${
                                                  selected
                                                    ? "bg-white/[0.05]"
                                                    : ""
                                                }
                                              `}
                                            >
                                              <span
                                                className={`block text-[13px] leading-5 ${
                                                  selected
                                                    ? "font-bold text-[#71D49A]"
                                                    : "font-semibold text-white/80"
                                                }`}
                                              >
                                                {child.label}
                                              </span>

                                              {child.description && (
                                                <span className="mt-0.5 block text-[11px] leading-5 text-white/45">
                                                  {child.description}
                                                </span>
                                              )}
                                            </Link>
                                          </li>
                                        );
                                      }
                                    )}
                                  </ul>
                                </li>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={
                            matchesPath(pathname, item.href)
                              ? "page"
                              : undefined
                          }
                          className={`
                            flex min-h-12 items-center
                            rounded-xl px-4
                            text-[14px] font-bold
                            transition-colors
                            ${
                              active
                                ? "bg-[#23A455]/15 text-[#71D49A]"
                                : "text-white/85 hover:bg-white/[0.06]"
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* CTAs */}
            <div className="relative shrink-0 border-t border-white/10 bg-[#0A1E13] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="grid gap-3">
                <Link
                  href={EXHIBIT_URL}
                  onClick={onClose}
                  className="
                    group flex min-h-12 items-center
                    justify-center gap-2 rounded-xl
                    bg-[#23A455] px-5 py-3
                    text-[13px] font-extrabold
                    text-white transition-colors
                    hover:bg-[#1C8846]
                  "
                >
                  Book Your Stall
                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  href={REGISTER_URL}
                  onClick={onClose}
                  className="
                    flex min-h-12 items-center
                    justify-center gap-2 rounded-xl
                    border border-white/25
                    px-5 py-3 text-[13px]
                    font-bold text-white
                    transition-colors
                    hover:border-[#23A455]
                    hover:bg-white/[0.06]
                  "
                >
                  Register as Visitor
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ---------- header ---------- */

export function SiteHeader({
  editionLine,
}: {
  editionLine: string;
}) {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 32,
    restDelta: 0.001,
  });

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      <header
        style={{ viewTransitionName: "site-header" }}
        className={`
          sticky top-0 z-50
          border-b border-[#102A1E]/[0.08]
          bg-white/95 backdrop-blur-xl
          transition-[box-shadow,background-color]
          duration-300
          supports-[backdrop-filter]:bg-white/90
          ${
            scrolled
              ? "shadow-[0_10px_34px_-18px_rgba(9,27,19,0.28)]"
              : "shadow-none"
          }
        `}
      >
        <div
          className={`
            mx-auto flex max-w-[1440px] items-center
            justify-between gap-4 px-4 sm:px-6 lg:px-8 2xl:px-10
            transition-[height] duration-300 ease-out
            ${
              scrolled
                ? "h-[62px] lg:h-[66px]"
                : "h-[70px] lg:h-[78px]"
            }
          `}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="India International EV Show homepage"
            className="
              relative flex shrink-0 items-center rounded-lg
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#23A455]
            "
          >
            <Image
              src="/brand/iiev-9th-edition-logo-trimmed.png"
              alt="India International EV Show, 9th Edition"
              width={1538}
              height={734}
              priority
              sizes="(max-width:640px) 130px, 155px"
              className={`
                w-auto object-contain
                transition-[height] duration-300 ease-out
                ${
                  scrolled
                    ? "h-[40px] sm:h-[44px] lg:h-[48px]"
                    : "h-[46px] sm:h-[52px] lg:h-[57px]"
                }
              `}
            />

            <span className="sr-only">{editionLine}</span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:block"
          >
            <ul className="flex items-center gap-0.5">
              {mainNav.map((item) => (
                <DesktopItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </nav>

          {/* CTAs */}
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={REGISTER_URL}
              className="
                hidden min-h-11 items-center
                justify-center rounded-full
                border border-[#D5E1D8]
                bg-white px-4
                text-[12px] font-extrabold
                text-[#102A1E]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-[#23A455]
                hover:bg-[#F1F8F3]
                hover:text-[#16893F]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#23A455]
                lg:inline-flex
              "
            >
              Register as Visitor
            </Link>

            <Link
              href={EXHIBIT_URL}
              className="
                group hidden min-h-11
                items-center justify-center
                gap-2 rounded-full
                bg-[#23A455] px-5
                text-[12px] font-extrabold
                text-white
                shadow-[0_8px_22px_-12px_rgba(35,164,85,0.65)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#1C8846]
                hover:shadow-[0_14px_28px_-12px_rgba(35,164,85,0.75)]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#23A455]
                md:inline-flex
              "
            >
              Book Your Stall

              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="
                  transition-transform duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="
                inline-flex size-11
                items-center justify-center
                rounded-full border border-[#D5E1D8]
                text-[#102A1E]
                transition-colors duration-200
                hover:border-[#23A455]
                hover:bg-[#F1F8F3]
                hover:text-[#23A455]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#23A455]
                xl:hidden
              "
            >
              <Menu size={21} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scroll progress line */}
        <motion.div
          aria-hidden="true"
          style={{
            scaleX: reduceMotion
              ? scrollYProgress
              : smoothProgress,
          }}
          className="
            absolute bottom-0 left-0 h-[2px] w-full
            origin-left
            bg-gradient-to-r from-[#23A455] to-[#7BD69A]
          "
        />
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={closeMobile}
        pathname={pathname}
        editionLine={editionLine}
      />
    </>
  );
}