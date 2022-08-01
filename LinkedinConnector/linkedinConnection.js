import puppeteer from "puppeteer";

import { config } from "dotenv";
import { CompaniesList } from "./CompaniesList.js";
config();
const password = process.env.LINKEDIN_PASSWORD;
const username = process.env.LINKEDIN_USERNAME;
// console.log(process.env.LINKEDIN_USERNAME);

let pending = 0;
const automate = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // fix the size of window
    await page._client.send("Emulation.clearDeviceMetricsOverride");
    await page.goto(
      "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
    );
    await page.waitForSelector(`input[aria-describedby="error-for-username"]`);
    await page.type(
      `input[aria-describedby="error-for-username"]`,
      process.env.LINKEDIN_USERNAME
    );
    await page.waitForSelector(`input[aria-describedby="error-for-password"]`);
    await page.type(
      `input[aria-describedby="error-for-password"]`,
      process.env.LINKEDIN_PASSWORD
    );
    await page.waitForSelector(`button[data-litms-control-urn="login-submit"]`);
    await page.click(`button[data-litms-control-urn="login-submit"]`);
    await page.waitForTimeout(4000);
    for (let i = 0; i < CompaniesList.length; i++) {
      const companyName = CompaniesList[i];
      await page.goto(
        `https://www.linkedin.com/search/results/people/?keywords=${companyName}&network=%5B%22S%22%2C%22O%22%5D&origin=FACETED_SEARCH&sid=Eos`
      );

      await page.waitForSelector(
        ".entity-result__title-line--2-lines > span > a"
      );

      let connections = await page.$$(".mb1 .app-aware-link");
      let connectionLinks = [];

      for (let i = 0; i < connections.length; i++) {
        let link = await page.evaluate(function (elem) {
          return elem.getAttribute("href");
        }, connections[i]);
        connectionLinks.push(link);
      }

      for (let i = 0; i < connectionLinks.length; i++) {
        const singleConnection = connectionLinks[i];
        // await page.setDefaultNavigationTimeout(0);
        await page.goto(singleConnection);
        await page.waitForSelector(
          `div.pv-top-card-v2-ctas>div.pvs-profile-actions> button`
        );
        await page.waitForTimeout(3000);
        // div.pv - text - details__left - panel > div > h1;
        await page.waitForSelector(`img[height="200"]`);
        let element = await page.$(`img[height="200"]`);
        const value = await page.evaluate(
          (el) => el.getAttribute("title"),
          element
        );
        let el = await page.$(
          `div.pv-top-card-v2-ctas>div.pvs-profile-actions> button`
        );
        const btnText = await page.evaluate((el) => el.textContent, el);
        console.log(
          btnText.trim(),
          value,
          companyName,
          `total pending ${pending}`
        );
        if (btnText.trim() == "Pending") {
          pending++;
        }
        if (btnText.trim() == "Connect") {
          const message = `Hello ${
            value.split(" ")[0]
          }, Hope you are fine. Your profile is a good source of motivation for me to grow. would love to connect with you and grow`;

          await page.click(
            `div.pv-top-card-v2-ctas>div.pvs-profile-actions> button`,
            {
              delay: 1000,
            }
          );
          await page.waitForSelector(`button[aria-label="Add a note"]`);
          await page.click(`button[aria-label="Add a note"]`, {
            delay: 1000,
          });
          await page.waitForSelector(`textarea[name="message"]`);
          await page.type(`textarea[name="message"]`, message);
          await page.waitForTimeout(4000);
          await page.waitForSelector(`button[aria-label="Send now"]`);
          await page.click(`button[aria-label="Send now"]`, {
            delay: 1000,
          });
          await page.waitForTimeout(1000);
        }
      }
    }
    console.log("completed ");

    // const companyName = "amazon";
  } catch (error) {
    console.log(error);
  }
};

automate();
