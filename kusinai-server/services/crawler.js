// kusinai-server/services/crawler.js

import axios from "axios";
import Recipe from "../models/Recipe.js";
import { extractRecipeFromURL } from "./extractor.js";

const SOURCES = [
  { name: "Panlasang Pinoy", base: "https://panlasangpinoy.com" },
  { name: "PinoyRecipe", base: "https://www.pinoyrecipe.net" },
  { name: "Kawaling Pinoy", base: "https://www.kawalingpinoy.com" }
];

function parseXmlLocs(xml) {
  const locs = [];
  const regex = /<loc>([^<]+)<\/loc>/gim;
  let m;
  while ((m = regex.exec(xml))) {
    locs.push(m[1].trim());
  }
  return locs;
}

function looksLikeRecipe(url) {
  const u = url.toLowerCase();
  return (
    u.includes("/recipe/") ||
    u.includes("/recipes/") ||
    u.includes("-recipe") ||
    u.includes("/food/")
  );
}

export async function discoverRecipeUrls() {
  const discovered = new Set();
  for (const src of SOURCES) {
    const candidates = [
      `${src.base}/sitemap.xml`,
      `${src.base}/sitemap_index.xml`,
      `${src.base}/sitemap_index.xml.gz`
    ];
    for (const sm of candidates) {
      try {
        const res = await axios.get(sm, { timeout: 15000 });
        const urls = parseXmlLocs(res.data);
        for (const u of urls) {
          if (u.endsWith(".xml") || u.endsWith(".gz")) {
            // nested sitemap
            try {
              const nested = await axios.get(u, { timeout: 15000 });
              const nestedUrls = parseXmlLocs(nested.data);
              nestedUrls.forEach((nu) => looksLikeRecipe(nu) && discovered.add(nu));
            } catch {}
          } else {
            if (looksLikeRecipe(u)) discovered.add(u);
          }
        }
      } catch {}
    }
  }
  return Array.from(discovered);
}

export async function autoUpdateAll({ discover = true } = {}) {
  const summary = { updated: 0, imported: 0, skipped: 0, failed: 0, errors: [] };
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");

  // 1) Update existing imported recipes
  const existing = await Recipe.find({ sourceUrl: { $ne: null } }).lean();
  for (const r of existing) {
    try {
      const data = await extractRecipeFromURL(r.sourceUrl, key);
      if (r.checksum && r.checksum === data.checksum) {
        summary.skipped++;
        continue;
      }
      await Recipe.findOneAndUpdate(
        { _id: r._id },
        {
          title: data.title,
          ingredients: data.ingredients,
          steps: data.steps,
          image: data.image,
          sourceName: data.sourceName,
          checksum: data.checksum,
          lastImportedAt: new Date()
        },
        { new: true }
      );
      summary.updated++;
    } catch (e) {
      summary.failed++;
      summary.errors.push({ url: r.sourceUrl, error: e.message });
    }
  }

  // 2) Discover new recipe URLs and import if not present
  if (discover) {
    try {
      const urls = await discoverRecipeUrls();
      for (const url of urls.slice(0, 150)) { // cap to keep job light
        try {
          const found = await Recipe.findOne({ sourceUrl: url }).lean();
          if (found) continue;
          const data = await extractRecipeFromURL(url, key);
          await Recipe.findOneAndUpdate(
            { sourceUrl: url },
            {
              title: data.title,
              ingredients: data.ingredients,
              steps: data.steps,
              image: data.image,
              sourceName: data.sourceName,
              sourceUrl: url,
              checksum: data.checksum,
              lastImportedAt: new Date()
            },
            { upsert: true }
          );
          summary.imported++;
        } catch (e) {
          summary.failed++;
          summary.errors.push({ url, error: e.message });
        }
      }
    } catch (e) {
      summary.errors.push({ stage: "discover", error: e.message });
    }
  }

  return summary;
}
