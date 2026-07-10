import puppeteer from "puppeteer";

const SLIDES = [
  { index: 0, steps: 1 },   // intro
  { index: 1, steps: 1 },   // overview (OVERVIEW_TOTAL_STEPS = 1)
  { index: 2, steps: 2 },   // one-model (ONE_MODEL_TOTAL_STEPS = 2)
  { index: 3, steps: 11 },  // power (POWER_TOTAL_STEPS = 11)
  { index: 4, steps: 4 },   // execute (EXECUTE_TOTAL_STEPS = 4)
  { index: 5, steps: 8 },   // refine (REFINE_V2_TOTAL_STEPS = 8)
  { index: 6, steps: 1 },   // end
];

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WIDTH = 1280;
const HEIGHT = 800;

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });

  // Set session cookie to bypass auth
  await page.setCookie({
    name: "ml_explainer_session",
    value: JSON.stringify({ user: "thumbgen@local", name: "Thumbnail Generator" }),
    domain: new URL(BASE_URL).hostname,
    path: "/",
  });

  // Build all (slideIndex, stepIndex) pairs
  const pairs = [];
  for (const s of SLIDES) {
    if (s.steps <= 1) {
      pairs.push({ slideIndex: s.index, stepIndex: 0 });
    } else {
      for (let step = 0; step < s.steps; step++) {
        pairs.push({ slideIndex: s.index, stepIndex: step });
      }
    }
  }

  console.log(`Capturing ${pairs.length} thumbnails...`);

  for (const { slideIndex, stepIndex } of pairs) {
    const url = `${BASE_URL}?audience=true&mode=self&slide=${slideIndex}&subStep=${stepIndex}&skipAnimation=true`;
    const filename = `slide-${slideIndex}-${stepIndex}.jpg`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 800));

    await page.screenshot({
      path: `public/slide-thumbnails/${filename}`,
      type: "jpeg",
      quality: 80,
    });

    console.log(`  ✓ ${filename}`);
  }

  await browser.close();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
