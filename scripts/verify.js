import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import path from 'path';

const appDir = path.resolve('./');
const previewPort = process.env.PORT || '4173';
const previewUrl = `http://localhost:${previewPort}`;
const PREVIEW_CMD = ['npx', 'vite', 'preview', '--host', '0.0.0.0', '--port', previewPort];

function waitForServer(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = async () => {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          return resolve();
        }
      } catch (err) {
        // ignore until ready
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server did not start within ${timeoutMs}ms`));
      }
      setTimeout(attempt, 250);
    };
    attempt();
  });
}

async function run() {
  console.log('Building production assets...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Starting preview server...');
  const preview = spawn('cmd.exe', ['/c', PREVIEW_CMD.join(' ')], {
    cwd: appDir,
    stdio: 'ignore',
    shell: false,
  });

  let serverRunning = false;
  try {
    await waitForServer(previewUrl);
    serverRunning = true;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });

    const hero = await page.locator('[data-testid="hero-image"]');
    const heroHasWidth = await hero.getAttribute('width');
    const heroHasHeight = await hero.getAttribute('height');
    const heroSrcSet = await hero.getAttribute('srcset');

    if (!heroHasWidth || !heroHasHeight || !heroSrcSet) {
      throw new Error('Hero image is missing width, height, or srcset attributes');
    }

    const list = await page.locator('[data-testid="article-list"]');
    const items = await list.locator('[data-testid="article-item"]').count();
    if (items >= 50) {
      throw new Error(`Virtualized list rendered too many items: ${items}`);
    }

    console.log('Verification passed: hero image attributes and virtualization are correct.');
    await browser.close();
  } finally {
    if (serverRunning && preview.pid) {
      preview.kill();
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
