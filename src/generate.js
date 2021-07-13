//#region Imports
// Library ----------------------------------------------------------------------------------
const Logger = require("./lib/logger.js");
//const FilePaths = require("./lib/file-paths.js");
const PuppeteerWrapper = require("./lib/puppeteer-wrapper.js");

//#endregion

//#region Setup - Dependency Injection-----------------------------------------------
const _logger = new Logger();
//const _filePaths = new FilePaths(_logger, "odi");
const _puppeteerWrapper = new PuppeteerWrapper(
  _logger,
  /**_filePaths,*/ {
    headless: true,
  }
);

//#endregion

//#region Main ----------------------------------------------------------------------
const host = "http://my.bigoiptv.com/";
const registrationLink = host + "index.php?action=register";
const loginLink = host + "index.php?action=login";
const iptvLink = host + "userpanel/iptv.php";
const randomUsername =
  Math.random().toString(36).substr(2, 9) +
  Math.random().toString(36).substr(9);

const generateBtn = document.getElementById("generateBtn");
const output1 = document.getElementById("output1");
const output2 = document.getElementById("output2");

async function main() {
  const page = await _puppeteerWrapper.newPage();
  page.setDefaultNavigationTimeout(500000);
  page.setDefaultTimeout(500000);

  let input;

  /** registration */
  await page.goto(registrationLink);
  generateBtn.innerText = "registration..";
  // type the username
  generateBtn.innerText = "setting username..";
  input = await page.$('input[type="text"][name="login"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername);

  // type the password
  generateBtn.innerText = "setting password..";
  input = await page.$('input[type="text"][name="pass"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername);

  // type the password confirmation
  generateBtn.innerText = "setting password confirmation..";
  input = await page.$('input[type="password"][name="pass_conf"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername);

  // type the email
  generateBtn.innerText = "setting email..";
  input = await page.$('input[type="text"][name="email"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername + "@mohmal.in");

  // submit
  generateBtn.innerText = "submitting data..";
  input = await page.$('button[type="submit"]');
  await page.waitForTimeout(1000);
  await input.click();
  await page.waitForNavigation();
  generateBtn.innerText = "registration done";
  /** end Registration */

  await page.waitForTimeout(2000);

  /** Login */
  await page.goto(loginLink);
  generateBtn.innerText = "login..";
  // type the username
  generateBtn.innerText = "setting username..";
  input = await page.$('input[type="text"][name="login"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername);

  // type the password
  generateBtn.innerText = "setting password..";
  input = await page.$('input[type="password"][name="pass"]');
  await input.click({ clickCount: 3 });
  await input.type(randomUsername);

  // submit
  generateBtn.innerText = "submitting data..";
  input = await page.$('button[type="submit"]');
  await page.waitForTimeout(1000);
  await input.click();
  await page.waitForNavigation();
  generateBtn.innerText = "login done";

  await page.waitForTimeout(2000);

  /** Creating playlist */
  await page.goto(iptvLink);
  generateBtn.innerText = "creating playlist..";
  // select
  generateBtn.innerText = "select plan..";
  input = (
    await page.$x(
      "/html/body/div[1]/div[2]/div[2]/div/div/div[4]/div[5]/form/div/div/div[2]/center[5]/div/label/input"
    )
  )[0];
  await input.click();

  // submit
  generateBtn.innerText = "submitting data..";
  input = (
    await page.$x(
      "/html/body/div[1]/div[2]/div[2]/div/div/div[4]/div[5]/form/div/div/div[2]/button"
    )
  )[0];
  await page.waitForTimeout(1000);
  await input.click();
  await page.waitForNavigation();
  /** end Creating playlist */

  await page.waitForTimeout(2000);

  /** Showing results */
  input = await page.$('font[color="brown"]');
  const html = await page.evaluate((el) => el.outerHTML, input);
  const text = await page.$eval(
    'font[color="brown"]>strong',
    (el) => el.innerText
  );
  const textSplitted = text.split("\n");
  const link = `<font color="aliceblue"><strong>Link: http://${
    textSplitted[0].split(": ")[1]
  }:${textSplitted[1].split(": ")[1]}/get.php?username=${
    textSplitted[2].split(": ")[1]
  }&password=${
    textSplitted[3].split(": ")[1]
  }&type=m3u_plus&output=hls</strong></font>`;
  output1.innerHTML = html.replace("brown", "aliceblue") + link;
  output2.innerHTML = `<font color="orange"><strong>Email: ${randomUsername}@mohmal.in<br>Username: ${randomUsername}<br>Password: ${randomUsername}<br></strong></font><font style="color: red;"><strong>YOU STILL CAN GENERATE TWO OTHERS ONE DAY PLAYLISTS WITH THE SAME ACCOUNT IF YOU WANT</strong></font>`;
  generateBtn.disabled = false;
  generateBtn.innerText = "generate";
  generateBtn.style.backgroundColor = "lightseagreen";
  await _puppeteerWrapper.cleanup();
}

const generate = async () => {
  try {
    generateBtn.disabled = true;
    generateBtn.style.backgroundColor = "grey";
    generateBtn.innerText = "starting..";
    const chromeSet = await _puppeteerWrapper.setup();
    if (!chromeSet) {
      return;
    }

    await main();
  } catch (e) {
    _logger.logError("Thrown error:");
    _logger.logError(e);
  } finally {
    await _puppeteerWrapper.cleanup();
  }

  _logger.logInfo("Done. Close window to exit");

  await _logger.exportLogs(_filePaths.logsPath());
};

//#endregion
generateBtn.onclick = generate;
