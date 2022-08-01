import puppeteer from "puppeteer";
import { config } from "dotenv";

config();

const automate = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // fix the size of window
    await page._client.send("Emulation.clearDeviceMetricsOverride");
    await page.goto("https://angel.co/login");
    await page.waitForSelector(`input[placeholder="Email"]`);
    // console.log("hello");

    await page.type(`input[placeholder="Email"]`, process.env.ANGEL_USERNAME);
    await page.waitForSelector(`input[placeholder="Password"]`);
    await page.type(
      `input[placeholder="Password"]`,
      process.env.ANGEL_PASSWORD
    );
    await page.waitForSelector(`input[value="Log in"]`);
    await page.click(`input[value="Log in"]`);
    await page.waitForTimeout(4000);
    await page.waitForSelector(
      `div[class^="styles_controlButtons__"] > button:nth-child(2)`
    );
    let jobElems = await page.$$(`div[class^="styles_jobListingList_"] a`);
    let jobLinks = [];
    while (jobElems.length < 100) {
      await scrollTOBottom(page);
      jobElems = await page.$$(`div[class^="styles_jobListingList_"] a`);
      console.log(jobElems.length);
    }

    for (let i = 0; i < jobElems.length; i++) {
      let link = await page.evaluate(function (elem) {
        return elem.getAttribute("href");
      }, jobElems[i]);
      jobLinks.push(link);
    }

    const jobIds = jobLinks.map((elem) => {
      return elem.split("/")[4].split("-")[0];
    });
    console.log(jobIds);

    for (const i in jobIds) {
      await page.goto(`https://angel.co/jobs?job_listing_id=${jobIds[i]}`);
      await page.waitForSelector(
        `div[class^="styles_header__"] >div:nth-child(2)>button:nth-child(2)`
      );
      await page.click(
        `div[class^="styles_header__"] >div:nth-child(2)>button:nth-child(2)`
      );

      const message = "heloo";
      await page.waitForSelector(`textarea[name="userNote"]`);
      let placeHolderElem = await page.$(`textarea[name="userNote"]`);
      const placeholder = await page.evaluate(
        (el) => el.getAttribute("placeholder"),
        placeHolderElem
      );

      await page.waitForSelector('h3>a[href^="/company/"]');
      const companyName = await page.evaluate(
        () => document.querySelector('h3>a[href^="/company/"]').textContent
      );
      console.log(
        "applied to " + placeholder.split(" ")[4] + " company " + companyName
      );
      await page.type(`textarea[name="userNote"]`, message, { delay: 50 });
      await page.waitForSelector(
        `button[data-test="JobApplicationModal--SubmitButton"]`
      );
      // await page.click(`button[data-test="JobApplicationModal--SubmitButton"]`);
      await page.waitForTimeout(4000);
    }

    console.log("loop completed");
  } catch (error) {
    console.log(error);
  }
};

automate();
function scrollTOBottom(page) {
  return new Promise(async (res, rej) => {
    await page.evaluate(() => {
      window.scrollBy(
        0,
        window.scrollBy(
          0,
          document.querySelector(`div[data-test="JobSearchResults"] `)
            .scrollHeight
        )
      );
    });
    setTimeout(res, 3000);
  });
}
