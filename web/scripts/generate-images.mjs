#!/usr/bin/env node
/**
 * Pre-generates the brand imagery for the MenMade landing page using Google's
 * Gemini 2.5 Flash Image ("nano-banana"). Outputs land in /public/generated.
 *
 * Why pre-gen instead of runtime: deterministic brand world, no API key in the
 * browser, free CDN edge caching. Re-run this script to refresh the imagery.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-images.mjs           # all assets
 *   GEMINI_API_KEY=... node scripts/generate-images.mjs hero      # one slug
 */

import { GoogleGenAI } from "@google/genai";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "..", ".env.local") });
loadEnv({ path: resolve(__dirname, "..", ".env") });
const OUT_DIR = resolve(__dirname, "..", "public", "generated");
const MODEL = "gemini-2.5-flash-image";

// One world spec, prepended to every prompt. This is the "brand lock" — the
// reason multiple images look like one site rather than a moodboard collage.
const BRAND_WORLD = `
Editorial-grade documentary photography for a private squad app for men.
Tone: confident, grounded, lived-in. Real men with real bodies, varied
ethnicities, varied ages 24-52, varied builds. Shot on a 35mm prime,
medium-format feel, natural light, no studio gloss. Color grade: warm
ember highlights against cool charcoal shadows; deep ink-black blacks
(#0c0a09), cream-bone neutrals (#ece7dc), one ember accent (#dd5722) used
sparingly in clothing or environmental light. Subjects are doing real
things — training, running, lifting, plunging, working — not posing for
the camera. Composition leaves a quiet area for typography overlay.

Strict bans: no logos, no watermarks, no on-image text, no neon lighting,
no purple/teal cinematic LUTs, no AI fantasy elements, no levitating dust
particles, no obvious AI symmetry, no glassmorphism overlays, no
"motivational" stock-photo cliches (no fists in the air, no shouting at
the sky, no chalk-clap silhouettes, no inspirational sunrise mountain
peaks). Faces should look like specific real men, not composite averages.
`.trim();

const TARGETS = [
  {
    slug: "hero",
    aspect: "16:9",
    prompt: `
${BRAND_WORLD}

Subject: a small group of four men, 28-45, mixed backgrounds, walking
quietly together at the start of a pre-dawn run on an empty waterfront
boardwalk. Mid-stride, breath visible in cool air. They look like
friends, not models. One mid-laugh at a comment from another, two
stoic. Wide cinematic frame, the men positioned right-of-center so the
left third is breathable atmospheric space (low fog, faint city
silhouette across the water). Warm sodium streetlamp on the right side
casts a single soft ember accent on the lead runner's jacket; the rest
of the scene is cool charcoal. Documentary realism, slight 35mm grain.
No text, no logos.
`.trim(),
  },
  {
    slug: "section-impact",
    aspect: "16:9",
    prompt: `
${BRAND_WORLD}

Subject: medium-tight editorial portrait — the back of two men's heads
and shoulders looking down at a single phone held between them in a
dimly lit gym chalk-room or garage. Their attention is on a private
group chat (do NOT show the screen content; the screen glow on their
faces is what matters). Six other faintly visible figures sit on
benches in the background, reading their own phones — a squad sharing
a moment, not a stock crowd. Shadow-heavy frame, ember accent only on
the screen-glow rim-lighting. Natural texture, sweat-on-skin realism,
quiet intimacy. No on-image text.
`.trim(),
  },
  {
    slug: "section-how",
    aspect: "16:9",
    prompt: `
${BRAND_WORLD}

Subject: an overhead three-quarter table-top still life. A worn paper
field-log notebook open with a pen, a half-drunk cup of black coffee in
a chipped enamel mug, a stopwatch, a folded running bib (no readable
numbers), three men's hands in frame from different angles — one
writing in the notebook, one pushing a mug toward another, one
half-out-of-frame holding a phone face-down. The surface is a scuffed
oak workshop table, warm tungsten work-light from one side. Editorial,
documentary, tactile. Ember accent only as the glow temperature of the
light. Shot from slightly above and to the side — not flat lay. No
logos, no readable text, no AI symmetry.
`.trim(),
  },
  // Six varied portraits for testimonials. Each is intentionally distinct
  // (city, age, build, framing) so the avatar grid reads as real people
  // rather than the same face six ways.
  {
    slug: "avatar-1",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Marcus, 34, Nigerian-British, broad runner build,
short fade haircut, light beard, in a charcoal long-sleeve technical
shirt, just finished a half marathon, mid-breath cooldown by a
waterfront railing in overcast Lagos morning light. Looking just past
the camera, mouth relaxed, faint smile of exhaustion-relief. Tight
chest-up framing, shallow depth of field, soft cool grey background
with a single warm ember catchlight in his eye. Natural skin texture,
real sweat, no retouching gloss. No on-image text.
`.trim(),
  },
  {
    slug: "avatar-2",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Eitan, 41, Israeli, lean-wiry build, salt-and-pepper
buzz cut, weathered face, in a faded olive crew sweatshirt, sitting on
a stone wall at dusk in Tel Aviv with his back lit by golden hour
spilling around his shoulders into ember rim-light. Looking down and
slightly to one side as if mid-thought, not at the camera. Tight
shoulders-up framing. Cool deep-charcoal foreground, ember backlight
only. Documentary feel, 35mm grain. No on-image text.
`.trim(),
  },
  {
    slug: "avatar-3",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Tomás, 29, Brazilian, athletic-medium build, dark
curly hair tied back, three-day stubble, wearing a heather-grey crewneck
over a black tee, leaning against a concrete wall in a São Paulo
co-working garage at night. Direct gaze into camera, calm and steady.
Single warm work-lamp providing ember key light from camera-left, deep
ink-black falloff on the right. Tight chest-up framing, slight
asymmetric crop. Documentary realism, no studio gloss. No on-image
text.
`.trim(),
  },
  {
    slug: "avatar-4",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Devan, 47, African-American, fuller build, neatly
trimmed graying beard and short twists, in a worn navy denim jacket
over a cream henley, on the porch of a craftsman house at golden hour
in Atlanta. Looking off-camera to the right, faint amused expression as
if listening to a friend just out of frame. Tight shoulders-up framing.
Warm ember side-light from a low sun, cool blue hour beginning to creep
in behind him. Documentary tone, real skin texture. No on-image text.
`.trim(),
  },
  {
    slug: "avatar-5",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Hideo, 38, Japanese, lean climber build, undercut
hair, clean-shaven, wearing a charcoal technical shell jacket, taking
shelter under a stone overhang on a misty mountain trail in Hokkaido,
hands wrapped around a metal thermos. Looking three-quarters away from
camera into the mist, breath visible. Cool grey-blue palette throughout
with a single ember reflection on the thermos rim. Tight shoulders-up
framing. Documentary feel, slight grain. No on-image text.
`.trim(),
  },
  {
    slug: "avatar-6",
    aspect: "4:5",
    prompt: `
${BRAND_WORLD}

Single portrait: Caleb, 31, Indigenous Australian, medium build,
shoulder-length wavy hair tied back, light beard, in a faded rust
work shirt rolled at the sleeves, walking out of a workshop into late
afternoon light in regional New South Wales. Mid-stride glance toward
the camera, relaxed. Warm ember sunlight from the open doorway behind
him casts a halo of dust motes; foreground is deep tool-shop charcoal.
Tight chest-up framing. Real workshop dust on the shirt, natural skin
texture. No on-image text.
`.trim(),
  },
];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function generateOne(ai, target) {
  const start = Date.now();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: target.prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: target.aspect },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.find((p) => p.inlineData?.data);
  if (!inline) {
    const txt = parts.find((p) => p.text)?.text ?? "<no-content>";
    throw new Error(
      `No image returned for ${target.slug}. Model said: ${txt.slice(0, 200)}`,
    );
  }

  const buf = Buffer.from(inline.inlineData.data, "base64");
  const ext = inline.inlineData.mimeType?.includes("png") ? "png" : "jpg";
  const path = resolve(OUT_DIR, `${target.slug}.${ext}`);
  await writeFile(path, buf);

  const ms = Date.now() - start;
  const kb = (buf.length / 1024).toFixed(0);
  console.log(`  ${target.slug.padEnd(18)}  ${ext}  ${kb.padStart(5)} KB  ${ms}ms`);
  return path;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "Missing GEMINI_API_KEY (or GOOGLE_API_KEY). Get one at https://aistudio.google.com/apikey",
    );
    process.exit(2);
  }

  const filter = process.argv.slice(2);
  const queue = filter.length
    ? TARGETS.filter((t) => filter.includes(t.slug))
    : TARGETS;
  if (!queue.length) {
    console.error(`No matching slugs. Known: ${TARGETS.map((t) => t.slug).join(", ")}`);
    process.exit(2);
  }

  await ensureDir(OUT_DIR);
  console.log(`Generating ${queue.length} image(s) with ${MODEL} -> ${OUT_DIR}`);

  const ai = new GoogleGenAI({ apiKey });

  // Sequential — Gemini's free tier rate-limits parallel image calls hard.
  for (const t of queue) {
    try {
      await generateOne(ai, t);
    } catch (err) {
      console.error(`  ${t.slug.padEnd(18)}  FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();
