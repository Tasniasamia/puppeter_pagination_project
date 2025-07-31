import { homeScrap } from "./scrapt/homePageScrap.mjs";
import { PrismaClient } from "./generated/prisma/index.js";
import { parseProduct } from "./parse/parseProduct.mjs";
import { productScrapt } from "./scrapt/productScrap.mjs";
const prisma = new PrismaClient();

const linkCollect = async (url) => {
  try {
    const collectedLinks = await homeScrap(url);
    if (collectedLinks.length > 0) {
      const findLinks = await prisma.page.findMany({ take: 5 });
      if (findLinks.length > 0) {
        return findLinks;
      }

      const data = await prisma.page.createMany({
        data: [...collectedLinks],
      });
      return collectedLinks.slice(0, 5);
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error in main:", err);
  }
};

const main = async () => {
  try {
    const allLinks = await linkCollect(
      "https://www.mollyjogger.com/collections/inventory"
    );
    console.log("All Links:", allLinks);

    if (allLinks?.length === 0) {
      console.log("কোনো লিঙ্ক পাওয়া যায়নি!");
      return;
    }

    let jsonData = [];

    for (let el of allLinks) {
      const fullUrl = el.link;
      const shortUrl = fullUrl.replace("https://www.mollyjogger.com", "");

      // product data scrape
      const productData = await productScrapt(
        "https://www.mollyjogger.com/collections/inventory",
        shortUrl
      );

      // যদি title থাকে তাহলে data push করো
      if (productData?.title) {
        jsonData.push(productData);
      }

      // API call এর মধ্যে delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // data insert করার আগে duplicate filter করো
    if (jsonData?.length > 0) {
      const dataToInsert = jsonData.map((p) => ({
        title: p.title,
        description: p.description || null,
        price: parseFloat(p.price),
        currency: p.currency || "USD",
        images: JSON.stringify(p.images),
        link: p.url,
      }));

      // Duplicate link remove (Set দিয়ে)
      const uniqueData = [];
      const links = new Set();

      for (const p of dataToInsert) {
        if (!links.has(p.link)) {
          links.add(p.link);
          uniqueData.push(p);
        }
      }

      // createMany call (skipDuplicates ছাড়া)
      for (const p of uniqueData) {
        try {
          // ডাটাবেসে আগেই আছে কিনা চেক করো
          const exists = await prisma.product.findUnique({
            where: { link: p.link },
          });

          if (!exists) {
            await prisma.product.create({ data: p });
          }
        } catch (err) {
          console.log(`❌ Error inserting ${p.link}:`, err.message);
        }
      }
    }
    const productAll = await prisma.product.findMany();
    if (productAll.length > 0) {
      return productAll;
    }
  } catch (err) {
    console.error("Error in main:", err);
  } finally {
  }
};

await main();
