import puppeteer from "puppeteer";
import { parseProduct } from "../parse/parseProduct.mjs";

export const productScrapt = async (url, url2) => {
  try{
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);
 
  while (true) {
    const findURL = await page.$(`a[href='${url2}']`);
    if (findURL) {
      await page.click(`a[href='${url2}']`);
      const parsedData=parseProduct(await page.content());
      console.log("parsedData",parsedData);
  
      await browser.close();
      break;
    }
    const nextSelector =
      'ul.pagination li a[rel="next"], ul.pagination li a[title="layout.pagination.next_html"]';
    const hasNext = await page.$(nextSelector);
    if (!hasNext) {
      break;
    }
    await page.click(nextSelector);
  }
}
catch(err){console.error(err.message)}
finally{console.log("Error Message")}
};
// await productScrapt(
//   "https://www.mollyjogger.com/collections/inventory",
//   "/collections/inventory/products/smallmouth-bass"
// );
