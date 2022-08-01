import puppeteer from "puppeteer";

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

    const companyName = "tcs";
    await page.goto(
      `https://www.linkedin.com/search/results/people/?keywords=${companyName}&network=%5B%22F%22%5D&origin=FACETED_SEARCH&sid=keZ`
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
      await page.goto(singleConnection);

      await page.waitForTimeout(3000);

      await page.waitForSelector(`img[height="200"]`);
      let element = await page.$(`img[height="200"]`);
      const value = await page.evaluate(
        (el) => el.getAttribute("title"),
        element
      );

      await page.waitForSelector(`.entry-point a`);
      let el = await page.$(`.entry-point a`);
      const linkToChat = await page.evaluate(
        (el) => el.getAttribute("href"),
        el
      );
      await page.goto(`https://www.linkedin.com${linkToChat}`);
      await page.waitForSelector(`div.msg-form__msg-content-container`);
      const message = `Hello ${value.split(" ")[0]}, can you help me `;

      await page.click(`div.msg-form__msg-content-container`, {
        delay: 1000,
      });
      await page.type(`div.msg-form__msg-content-container`, message);
      //
      await page.waitForSelector(`button.msg-form__send-button`);
      //   await page.waitForSelector(`button[aria-label="Send now"]`);
      await page.click(`button.msg-form__send-button`, {
        delay: 1000,
      });
      await page.waitForTimeout(4000);
    }
  } catch (error) {
    console.log(error);
  }
};

automate();
