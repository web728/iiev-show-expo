import { readdir } from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const IMAGE_DIR = "images";
const VIDEO_DIR = "video";

/** public/images ke jis subfolder ko gallery mein nahi dikhana, uska naam yahan likho */
const EXCLUDED_FOLDERS: string[] = [];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);

export type LocalPhoto = {
  src: string;
  /** first subfolder name, or "" when the file sits directly in public/images */
  folder: string;
};

async function walk(dir: string, root: string, out: string[]) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(full, root, out);
    } else {
      out.push(
        path.relative(root, full).split(path.sep).join("/")
      );
    }
  }
}

const natural = (a: string, b: string) =>
  a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });

const toUrl = (base: string, rel: string) =>
  `/${base}/${rel
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

export async function getLocalPhotos(): Promise<LocalPhoto[]> {
  const root = path.join(PUBLIC_DIR, IMAGE_DIR);
  const files: string[] = [];

  await walk(root, root, files);

  return files
    .filter((rel) =>
      IMAGE_EXT.has(path.extname(rel).toLowerCase())
    )
    .filter((rel) => {
      const first = rel.split("/")[0];
      return !EXCLUDED_FOLDERS.includes(first);
    })
    .sort(natural)
    .map((rel) => {
      const parts = rel.split("/");

      return {
        src: toUrl(IMAGE_DIR, rel),
        folder: parts.length > 1 ? parts[0] : "",
      };
    });
}

export async function getLocalVideos(): Promise<string[]> {
  const root = path.join(PUBLIC_DIR, VIDEO_DIR);
  const files: string[] = [];

  await walk(root, root, files);

  return files
    .filter((rel) =>
      VIDEO_EXT.has(path.extname(rel).toLowerCase())
    )
    .sort(natural)
    .map((rel) => toUrl(VIDEO_DIR, rel));
}