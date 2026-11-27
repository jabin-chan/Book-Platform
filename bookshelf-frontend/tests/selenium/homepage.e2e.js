const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

async function main() {
  let driver;

  try {
    const options = new chrome.Options();

    options.setChromeBinaryPath(
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
    );

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // open the homepage
    await driver.get("http://localhost:3000");

    // locate and wait until the heading becomes visible
    const heading = await driver.wait (
      until.elementIsVisible(
        await driver.findElement(
          By.xpath("//h1[normalize-space()='Brewed Pages']")
        )
      ),
      10000
    );

    assert.strictEqual(await heading.isDisplayed(), true);

    // locate and click the signup button
    const signupButton = await driver.findElement(
      By.xpath("//button[normalize-space()='Join the Community']")
    );

    await signupButton.click();

    // verify navigation to signup
    await driver.wait(until.urlContains("/signup"), 10000);

    console.log(
      "Selenium test passed: homepage and signup navigation."
    );

  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main().catch((error) => {
  console.error("Selenium test failed:", error);
  process.exitCode = 1;
});