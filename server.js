const express = require("express");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");

const app = express();
const PORT = 8000;

app.get("/new_contract", async (req, res) => {
  try {
    const pastLinkSchema = new mongoose.Schema({
      contractLink: { type: String, required: true, unique: true },
      createdAt: { type: Date, default: Date.now },
    });
    const Link = mongoose.model("Links", pastLinkSchema);

    await mongoose
      .connect(
        "mongodb+srv://boxinga41:ApgEv5YjA7PKVB9R@bidcluster.ttnnn.mongodb.net/?retryWrites=true&w=majority&appName=bidcluster",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
      });

    const browser = await puppeteer.launch({ headless: false }); // Set headless: true if you don't want to see the browser UI
    const page = await browser.newPage();
    const PAGE_SIZE = 25;
    const RES = [];
    await page.goto(
      `https://sam.gov/search/?page=1&pageSize=${PAGE_SIZE}&sort=-modifiedDate&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=roof&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=roof&sfm%5Bstatus%5D%5Bis_active%5D=true`,
      { waitUntil: "networkidle2" }
    );

    await page.setViewport({ width: 800, height: 800 });
    // const button = await page.$(
    //   "#sds-dialog-0 > layout-splash-modal > div.grid-row.flex-column.tablet\\:flex-row > div:nth-child(2) > div > button"
    // );

    // // await button.click();

    const searchInput = await page.$(
      "#filtersBody > sds-filters > div > formly-form > formly-field > sam-formly-wrapper-animation > div > ng-component > formly-group > formly-field:nth-child(1) > sam-formly-wrapper-animation > div > ng-component > div > sds-tabs > div.sds-tabs__content > sds-tab-panel:nth-child(1) > div > formly-field > sam-formly-wrapper-animation > div > ng-component > formly-group > formly-field:nth-child(2) > sam-formly-wrapper-animation > div > app-keyword-formly-field-text > app-keyword-text > div > input"
    );

    await searchInput.type("roof");
    await searchInput.press("Enter");

    const parentSelector =
      "#main-container > app-frontend-search-home > div > div > div > div.desktop\\:grid-col-8.tablet-lg\\:grid-col-12.mobile-lg\\:grid-col-12 > search-list-layout > div:nth-child(2) > div > div > sds-search-result-list";
    const parentElement = await page.$(parentSelector);

    if (!parentElement) return "No such element";

    const LINK = await page.evaluate(() => {
      const parentElement = document.querySelector(
        "#main-container > app-frontend-search-home > div > div > div > div.desktop\\:grid-col-8.tablet-lg\\:grid-col-12.mobile-lg\\:grid-col-12 > search-list-layout > div:nth-child(2) > div > div > sds-search-result-list"
      );
      if (!parentElement) {
        throw new Error("Parent element not found");
      }

      const anchorTags = parentElement.querySelectorAll(
        "#main-container > app-frontend-search-home > div > div > div > div.desktop\\:grid-col-8.tablet-lg\\:grid-col-12.mobile-lg\\:grid-col-12 > search-list-layout > div:nth-child(2) > div > div > sds-search-result-list > div > div > app-opportunity-result > div > div.grid-col-12.tablet\\:grid-col-9 > div:nth-child(1) > div > h3 > a"
      );

      const links = [];
      anchorTags.forEach((anchor) => {
        if (anchor.href) {
          links.push(anchor.href);
        }
      });

      return links;
    });

    //  WEBSITE URL
    // console.log(LINK);

    // FILTER FOR UNIQUE URL / NEW CONTRACT
    async function getUniqueLinks(newLinks) {
      try {
        const existingLinks = await Link.find({}, "contractLink");
        const existingUrls = existingLinks.map((link) => link.contractLink);

        const uniqueLinks = newLinks.filter(
          (link) => !existingUrls.includes(link)
        );

        if (uniqueLinks.length > 0) {
          // const linksToSave = uniqueLinks.map((url) => ({ url }));
          //   await Link.insertMany(linksToSave);
          //   console.log("Saved unique links to MongoDB.");
        } else {
          console.log("No unique links to save.");
        }

        return uniqueLinks;
      } catch (error) {
        // console.error("Error processing links:", error);
        throw error;
      }
    }

    const NEW_CONTRACT_TO_SCRAPE = await getUniqueLinks(LINK);

    // FILTER FOR EACH URL
    for (const link of NEW_CONTRACT_TO_SCRAPE) {
      try {
        await page.goto(link, { waitUntil: "networkidle2" });

        // GET USEFUL CONTENT
        const content = await page.evaluate((el) => {
          return {
            title:
              document.querySelector(
                "#main-container > ng-component > page > div > div > div.page-content.row > div.nine.wide.column > div.usa-width-three-fourths.br-double-after.ng-star-inserted > h1"
              )?.textContent || " ",
            active:
              document
                .querySelector(
                  "#header > div.sam-ui.padded.raised.segment > div.opportunity-top-left"
                )
                ?.textContent.trim() || " ",
            _id:
              document
                .querySelector(
                  "#header-solicitation-number > div > div.description"
                )
                ?.textContent.trim() || " ",
            updated_published_date:
              document.querySelector("#general-published-date")?.textContent ||
              "",
            original_published_date:
              document.querySelector("#general-original-published-date")
                .textContent || " ",
            contract_opp_type:
              document.querySelector("#general-type")?.textContent || "",
            original_inactive_type:
              document.querySelector("#general-original-published-date")
                ?.textContent || "",
            updated_inactive_date:
              document.querySelector("#general-original-archive-date")
                ?.textContent || " ",
            place_of_performance: "",
            original_set_aside:
              document.querySelector("#classification-original-set-aside")
                ?.textContent || "",
            product_service_code:
              document.querySelector("#classification-classification-code")
                ?.textContent || "",
            description:
              document.querySelector("#description")?.textContent || "",
            contracting_office_address:
              document.querySelector("#-contracting-office")?.textContent ||
              " ",
            primary_email:
              document.querySelector("#contact-primary-poc-email")
                ?.textContent || " ",
            primary_tel:
              document.querySelector("#contact-primary-poc-phone")
                ?.textContent || " ",
            department:
              document.querySelector(
                "#header-hierarchy-level > div > div:nth-child(2)"
              )?.textContent || " ",
            secondary_email:
              document.querySelector("#contact-secondary-poc-email")
                ?.textContent || "",
            secondary_tel:
              document.querySelector("#contact-secondary-poc-phone")
                ?.textContent || "",
          };
        });

        RES.push(content);
        console.log("🚀 ~ content ~ content:", content);

        // Save content to MongoDB
        // await collection.insertOne({ url: link, content });
      } catch (error) {
        console.error(`Error processing ${link}:`, error);
      }
    }

    res.send(RES);
  } catch (error) {
    throw error;
  } finally {
    mongoose.connection.close();
    // browser.close();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
