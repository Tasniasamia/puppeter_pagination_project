import { homeScrap } from './scrapt/homePageScrap.mjs';
import { PrismaClient } from './generated/prisma/index.js';
import { parseProduct } from './parse/parseProduct.mjs';
import { productScrapt } from './scrapt/productScrap.mjs';
const prisma = new PrismaClient();

const linkCollect=async(url)=>{
  try {
    const collectedLinks = await homeScrap(url);
    if(collectedLinks.length>0){
      const findLinks=await prisma.page.findMany({});
       if(findLinks.length>0){
        return findLinks;
       }
   
        const data=await prisma.page.createMany({
          data:[...collectedLinks]
        });
        // console.log("database Links",collectedLinks);
        return collectedLinks
      
      
    }
  } catch (err) {
    console.error("Error in main:", err);
  } finally {
    await prisma.$disconnect();
  }
}


const main = async () => {
  try{
 const allLinks=await linkCollect("https://www.mollyjogger.com/collections/inventory");
 console.log("All Links",allLinks);
 let jsonData=[];
 for(let el of allLinks){
  const fullUrl = el.link;
const shortUrl = fullUrl.replace("https://www.mollyjogger.com", "");
  const productData=await productScrapt("https://www.mollyjogger.com/collections/inventory",shortUrl);
  jsonData.push(productData);
  await new Promise((resolve,reject)=>{setTimeout(resolve,3000)})
 
 }
  
 console.log("Product JSON",jsonData);
}
catch(error){
  console.error(error.message)
}
finally{
  
}
};

await main();
