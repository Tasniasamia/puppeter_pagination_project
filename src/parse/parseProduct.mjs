import { JSDOM } from "jsdom";

export const parseProduct = (html) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.querySelector("meta[property='og:title']")?.content || "";
  const description = document.querySelector("meta[property='og:description']")?.content || "";
  const price = document.querySelector("meta[property='og:price:amount']")?.content || "";
  const currency = document.querySelector("meta[property='og:price:currency']")?.content || "";

  // সব image collect
  const images = Array.from(document.querySelectorAll("meta[property='og:image']"))
    .map((img) => img.content);

  const url = document.querySelector("link[rel='canonical']")?.href || "";

  return {
    title,
    description,
    price,
    currency,
    images,
    url,
  };
};

