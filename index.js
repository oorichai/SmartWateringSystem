require('dotenv').config();
const puppeteer = require('puppeteer-core');
const readline = require('readline');

const browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const classCode = process.env.TINKERCAD_CLASS_CODE;
const projectUrl = process.env.TINKERCAD_PROJECT_URL;

function waitForEnter() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Log in manually, then press Enter here to continue...', () => {
      rl.close();
      resolve();
    });
  });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.tinkercad.com/joinclass', { waitUntil: 'networkidle2' });

  await waitForEnter();

  try {
    await page.click('#signInClassCodeButton');
  } catch {}

  try {
    await page.waitForSelector('input[name="classCode"]', { timeout: 10000 });
    await page.type('input[name="classCode"]', classCode);
    await page.keyboard.press('Enter');
  } catch {}

  await page.waitForTimeout(3000);

  if (projectUrl) {
    await page.goto(projectUrl, { waitUntil: 'networkidle2' });
  }
}

run();