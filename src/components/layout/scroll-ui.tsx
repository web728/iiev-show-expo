"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";

/** Thin brand-gradient reading-progress bar under the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden="true" style={{ scaleX }} className="fixed inset-x-0 top-0 z-[61] h-[3px] origin-left bg-brand-gradient" />;
}

const HIDE_ON = ["/exhibit/book-a-stall/", "/visit/register/", "/sponsorship/enquire/", "/conference/register/", "/conference/apply-to-speak/", "/become-a-partner/", "/contact/", "/visit/badge/"];

/** Mobile-only sticky action bar that appears after the hero; hidden on form pages. */
export function StickyCta() {
  const pathname = usePathname() || "/";
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Appear once the first screen (which carries the page's own CTAs) has scrolled away.
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <div className={`no-print fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-white/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!show}>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/visit/register/" className={buttonClass("secondary", "md", "w-full")} tabIndex={show ? 0 : -1}>Get Visitor Badge</Link>
        <Link href="/exhibit/book-a-stall/" className={buttonClass("primary", "md", "w-full")} tabIndex={show ? 0 : -1}>Book a Stall</Link>
      </div>
    </div>
  );
}
