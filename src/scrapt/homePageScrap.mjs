import puppeteer from "puppeteer";

export const homeScrap = async (url) => {
  try{
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });
  let collectedArray=[];
  while (true) {
    // প্রোডাক্ট গুলো count করো
    const products = await page.$$eval('[class*="box product"]', (productEls) => {
      let temp = [];
      productEls.forEach((el) => {
        temp.push({
          link: el.querySelector("a")?.href || "",
        });
      });
      return temp; // বাইরে পাঠালাম
    });
    

    
    collectedArray.push(...products);
    console.log("Products on this page:", collectedArray.length);

    // Next page আছে কিনা চেক করো
    const nextSelector = 'ul.pagination li a[rel="next"], ul.pagination li a[title="layout.pagination.next_html"]';
    const hasNext = await page.$(nextSelector);
    if (!hasNext) {
      console.error("No more pages. Scraping complete!");
      break;
    }

    const prevCount = products.length;

    // Click করো
    await page.click(nextSelector);

    // এখন products update হওয়া পর্যন্ত wait করো (full navigation এর বদলে)
    await page.waitForFunction(
      (selector, prev) => document.querySelectorAll(selector).length !== prev,
      { timeout: 60000 },
      '[class*="box product"]',
      prevCount
    );
  }
  await browser.close();
  return collectedArray;
}
catch(err){console.error(err.message)}
finally{console.log("Error Message")}
 
};


