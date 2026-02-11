import OzAPI from "oz-agent-sdk";
import { execSync } from "child_process";

// ─────────────────────────────────────────────
// Vibe Translator — One Prompt, Five Stacks
// Powered by Oz Cloud Agents (TypeScript SDK)
// ─────────────────────────────────────────────

const STACKS = [
  {
    name: "react-tailwind",
    dir: "react",
    instruction:
      "Build this app using React with Tailwind CSS for styling. Create the project in the /react directory using Vite as the bundler. Structure it with clean, reusable components. Include a package.json with all dependencies. The app should be fully functional and production-quality.",
  },
  {
    name: "svelte-css",
    dir: "svelte",
    instruction:
      "Build this app using Svelte with vanilla CSS for styling. Create the project in the /svelte directory using Vite as the bundler. Use Svelte stores for state management where appropriate. Include a package.json with all dependencies. The app should be fully functional and production-quality.",
  },
  {
    name: "vue-tailwind",
    dir: "vue",
    instruction:
      "Build this app using Vue 3 with Tailwind CSS for styling. Create the project in the /vue directory using Vite as the bundler. Use the Composition API with <script setup> syntax. Include a package.json with all dependencies. The app should be fully functional and production-quality.",
  },
  {
    name: "vanilla-html-css-js",
    dir: "vanilla",
    instruction:
      "Build this app using only vanilla HTML, CSS, and JavaScript with zero dependencies. Create the project in the /vanilla directory with an index.html, style.css, and script.js. It should work by simply opening index.html in a browser. Keep it clean and well-structured.",
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function resolveEnvironmentId(name: string): string {
  const raw = execSync(
    `oz environment list --output-format json`
  ).toString();
  const envs = JSON.parse(raw) as { id: string; name: string }[];
  const env = envs.find((e) => e.name === name);
  if (!env) {
    console.error(`  [error] Environment '${name}' not found. Create it first on the Oz platform.`);
    process.exit(1);
  }
  return env.id;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRun(client: OzAPI, runId: string, label: string) {
  process.stdout.write(`  Waiting for ${label} (${runId})...`);
  while (true) {
    const run = await client.agent.runs.retrieve(runId);
    const state = (run as any).state ?? (run as any).status;
    if (["Succeeded", "succeeded", "Failed", "failed", "Error", "error"].includes(state)) {
      if (["Succeeded", "succeeded"].includes(state)) {
        console.log(` done!`);
      } else {
        console.log(` ${state}`);
      }
      return state;
    }
    await sleep(10_000);
  }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  const prompt = process.argv[2];

  if (!prompt) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vibe Translator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Usage: npx tsx vibe-translate.ts '<your app idea>'

  Examples:
    npx tsx vibe-translate.ts 'Build a pomodoro timer with dark mode'
    npx tsx vibe-translate.ts 'Build a kanban board with drag-and-drop'
    npx tsx vibe-translate.ts 'Build a markdown editor with live preview'
`);
    process.exit(1);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vibe Translator
  Prompt: ${prompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Resolve environment
  const envId = resolveEnvironmentId("vibe-translator");
  console.log(`[setup] Resolved environment: vibe-translator (${envId})\n`);

  // Init SDK
  const client = new OzAPI({ apiKey: process.env["WARP_API_KEY"] });

  // ── Phase 1: Launch 4 builder agents in parallel ──

  console.log("[Phase 1] Launching 4 builder agents in parallel...\n");

  const launches = STACKS.map((stack) =>
    client.agent.run({
      prompt: `You are a senior frontend developer. The user wants you to build an app based on this description: '${prompt}'.

${stack.instruction}

IMPORTANT:
- Work ONLY in the /${stack.dir} directory
- When finished, create a new git branch called 'vibe/${stack.name}'
- Commit all your files with a descriptive message
- Push the branch to origin
- Do NOT modify files outside your assigned directory`,
      config: {
        environment_id: envId,
        name: `vibe-${stack.name}`,
      },
    })
  );

  const results = await Promise.all(launches);
  const runIds = results.map((r, i) => {
    const id = r.run_id;
    console.log(`  [+] Agent ${STACKS[i].name} launched (run: ${id})`);
    return id;
  });

  console.log("\n[Phase 1] All 4 builder agents are running!\n");

  // ── Wait for Phase 1 ──

  console.log("[Waiting] Monitoring builder agents...\n");

  await Promise.all(
    runIds.map((id, i) => waitForRun(client, id, STACKS[i].name))
  );

  console.log("\n[Phase 1] All builders finished!\n");

  // ── Phase 2: Launch comparison agent ──

  console.log("[Phase 2] Launching comparison agent...\n");

  const compareResult = await client.agent.run({
    prompt: `You are a senior frontend architect and code reviewer. Your job is to compare 4 different implementations of the same app.

The original app request was: '${prompt}'

The 4 implementations are on these branches:
  1. vibe/react-tailwind       (React + Tailwind CSS)     -> /react directory
  2. vibe/svelte-css           (Svelte + Vanilla CSS)     -> /svelte directory
  3. vibe/vue-tailwind         (Vue 3 + Tailwind CSS)     -> /vue directory
  4. vibe/vanilla-html-css-js  (Vanilla HTML/CSS/JS)      -> /vanilla directory

INSTRUCTIONS:

1. Fetch all remote branches:
   git fetch --all

2. For each branch, checkout and carefully review the code in its directory.

3. Evaluate each implementation on these criteria (score 1-10 for each):
   - Code Quality: Clean structure, readability, best practices
   - Completeness: Does it fully implement the requested features?
   - UI/UX Design: Visual quality, responsiveness, accessibility
   - Performance: Bundle size considerations, rendering efficiency
   - Developer Experience: How easy to maintain and extend

4. Create the following files in the /comparison directory on a NEW branch called 'vibe/comparison-report':

FILE 1 — /comparison/report.md:
A detailed markdown report with:
- Executive summary (2-3 sentences)
- Side-by-side comparison table with all scores
- Detailed analysis per implementation (strengths and weaknesses)
- Winner declaration with justification
- 'Which stack for which scenario' recommendations

FILE 2 — /comparison/scores.json:
{
  "prompt": "<the original prompt>",
  "generated_at": "<ISO 8601 timestamp>",
  "implementations": {
    "react-tailwind": {
      "code_quality": <1-10>,
      "completeness": <1-10>,
      "ui_ux_design": <1-10>,
      "performance": <1-10>,
      "developer_experience": <1-10>,
      "total": <sum of above>,
      "summary": "<one line summary>"
    },
    "svelte-css": { ... },
    "vue-tailwind": { ... },
    "vanilla-html-css-js": { ... }
  },
  "winner": "<stack-name>",
  "verdict": "<2-3 sentence justification>"
}

FILE 3 — /comparison/index.html:
A beautiful standalone HTML comparison dashboard that:
- Displays the original prompt at the top
- Shows a visual scorecard for each implementation using bar charts (pure CSS or inline SVG)
- Highlights the winner with a trophy/crown visual
- Uses a responsive dark-mode design
- Works by opening the file directly in a browser (zero dependencies)
- Includes a summary verdict section at the bottom

5. Commit all files with a descriptive message and push the 'vibe/comparison-report' branch to origin.`,
    config: {
      environment_id: envId,
      name: "vibe-comparison-judge",
    },
  });

  console.log(`  [+] Comparison agent launched (run: ${compareResult.run_id})\n`);
  console.log("[Waiting] Waiting for comparison agent...\n");

  await waitForRun(client, compareResult.run_id, "comparison-judge");

  // ── Done ──

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vibe Translation Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Branches created:
    - vibe/react-tailwind
    - vibe/svelte-css
    - vibe/vue-tailwind
    - vibe/vanilla-html-css-js
    - vibe/comparison-report

  View the comparison:
    git fetch --all
    git checkout vibe/comparison-report
    open comparison/index.html
    cat comparison/report.md

  Open PRs:
    ./open-prs.sh
`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
