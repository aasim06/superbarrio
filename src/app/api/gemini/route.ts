import { NextRequest, NextResponse } from "next/server";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import type { GroceryProduct } from "@/types/grocery";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────
// Keyword map for local fallback engine
// Keys = concept, values = search tokens (Urdu, Roman Urdu, English)
// ─────────────────────────────────────────────────────────────────
const KEYWORD_GROUPS: Record<string, string[]> = {
  tomato: ["tamatar", "tomat", "tomato", "tomatoes", "tomates", "ٹماٹر", "surkh"],
  banana: ["kela", "kele", "banana", "bananas", "platano", "کیلا", "کیلے"],
  apple: ["seb", "apple", "apples", "manzana", "سیب"],
  broccoli: ["broccoli", "brocoli", "بروکولی", "hari gobhi"],
  carrot: ["gajar", "carrot", "carrots", "zanahoria", "گاجر", "gajrain"],
  milk: ["doodh", "dudh", "milk", "leche", "دودھ"],
  eggs: ["anday", "ande", "anda", "egg", "eggs", "huevo", "انڈے", "انڈا", "desi anday"],
  cheese: ["cheese", "queso", "paneer", "پنیر", "چیز", "cured cheese"],
  yogurt: ["dahi", "yogurt", "yogur", "دہی", "greek yogurt"],
  bread: ["bread", "sourdough", "pan", "roti", "بریڈ", "روٹی", "loaf"],
  croissant: ["croissant", "croissants", "کروسینٹ", "butter croissant"],
  chicken: ["chicken", "murghi", "gosht", "meat", "pollo", "چکن", "مرغی", "boneless"],
  oil: ["oil", "tel", "olive oil", "aceite", "تیل", "زیتون", "extra virgin"],
  rice: ["rice", "chawal", "arroz", "basmati", "چاول", "باسمتی"],
  juice: ["juice", "orange juice", "zumo", "sharbat", "جوس", "مالٹا", "orange"],
  almonds: ["almond", "almonds", "badam", "almendras", "بادام", "salted almonds"],
  chips: ["chips", "plantain", "banana chips", "چپس", "papar"],
  peanuts: ["peanut", "peanuts", "moongphali", "mungphali", "مونگ پھلی", "cacahuetes"],
  mixednuts: ["mixed nuts", "nuts", "dry fruit", "frutos secos", "میوہ", "ڈرائی فروٹ", "kaju", "akhrot"],
};

// English product name → Urdu display name
const URDU_NAMES: Record<string, string> = {
  "Farm Fresh Red Tomatoes": "تازہ لال ٹماٹر",
  "Organic Canary Cavendish Bananas": "کینری کے میٹھے کیلے",
  "Crisp Royal Gala Apples": "کرسپی رائل گالا سیب",
  "Fresh Green Broccoli Crowns": "تازہ ہری بروکولی",
  "Crunchy Farm Carrots": "دھلی ہوئی میٹھی گاجریں",
  "Full Cream Pure Farm Milk": "خالص فارم فل کریم دودھ",
  "Golden Free-Range Farm Eggs": "دیسی فارم کے سنہری انڈے",
  "Artisanal Cured Cheese Block": "روایتی پنیر / چیز بلاک",
  "Authentic Greek Natural Yogurt": "خالص کریمی یونانی دہی",
  "Artisan Sourdough Loaf": "ساورڈو روٹی / بریڈ",
  "Flaky French Butter Croissants": "خستہ فرنچ بٹر کروسینٹس",
  "Fresh Boneless Chicken Breast": "بغیر ہڈی کا تازہ چکن بریسٹ",
  "Premium Extra Virgin Olive Oil": "پریمیم ایکسٹرا ورجن زیتون کا تیل",
  "Royal Long-Grain Basmati Rice": "رائل لمبا باسمتی چاول",
  "Cold-Pressed Valencia Orange Juice": "ویلینسیا مالٹے کا تازہ جوس",
  "Roasted Lightly Salted Almonds": "ہلکے نمکین بھنے ہوئے بادام",
  "CrunchyBites Plantain Chips - Lightly Salted": "کرنچی بائٹس پلانٹین چپس",
  "CrunchyBites Spicy Roasted Peanuts": "کرنچی بائٹس مسالے دار مونگ پھلی",
  "CrunchyBites Deluxe Mixed Nuts": "کرنچی بائٹس ڈیلکس مکس ڈرائی فروٹ",
};

const CATEGORY_URDU: Record<string, string> = {
  "fruits-vegetables": "پھل اور سبزیاں",
  "dairy-eggs": "ڈیری اور انڈے",
  bakery: "بیکری اور بریڈ",
  "meat-poultry": "گوشت اور مرغی",
  "pantry-cooking": "پینٹری اور کوکنگ",
  beverages: "مشروبات اور جوس",
  snacks: "اسنیکس اور نمکین",
};

// ─── Build catalog text for LLM grounding ────────────────────────
function buildCatalogText(products: GroceryProduct[]): string {
  return products
    .map((p, i) => {
      const nameEn = p.nameEn || p.name;
      const nameUrdu = URDU_NAMES[nameEn] || nameEn;
      const unit = p.unitEn || p.unit;
      const catUrdu = CATEGORY_URDU[p.category] || p.category;
      const discountPct = p.originalPrice
        ? ` → ${(((p.originalPrice - p.price) / p.originalPrice) * 100).toFixed(0)}% OFF (was €${p.originalPrice.toFixed(2)})`
        : "";
      const badge = p.badgeEn || p.badge ? ` [${p.badgeEn || p.badge}]` : "";
      const stock = p.inStock ? "In Stock ✓" : "⚠ Out of Stock";
      return (
        `${i + 1}. [${p.id}] ${nameUrdu} | ${nameEn}\n` +
        `   Price: €${p.price.toFixed(2)} / ${unit}${discountPct}${badge}\n` +
        `   Category: ${catUrdu} (${p.category}) | ${stock}\n` +
        `   Details: ${p.descriptionEn || p.description}`
      );
    })
    .join("\n");
}

// ─── Build grounded system prompt ────────────────────────────────
function buildSystemPrompt(catalogText: string, totalCount: number): string {
  return `You are 'SuperBarrio AI', a warm, friendly, conversational AI shopping assistant for SuperBarrio Grocery.

PERSONALITY:
- Speak naturally and warmly, like a helpful local shopkeeper + smart assistant.
- Be empathetic. Respond warmly to greetings.
- Keep spoken responses SHORT (1–3 sentences) for TTS audio playback.

LANGUAGE RULES:
- User speaks Urdu/Roman Urdu → reply STRICTLY in natural Pakistani Urdu script (اردو رسم الخط). No Roman Urdu output.
- User speaks English → reply in fluent, warm English.

GROUNDING RULES — CRITICAL:
1. ONLY reference products that exist in the catalog below (${totalCount} items total).
2. If the item IS in the catalog: state its EXACT name, real price in €, unit, discount/badge, and stock status.
3. If the item is NOT in catalog: honestly say it is not available and suggest the closest available alternative.
4. NEVER invent products, prices, discounts, or offers not listed below.

STORE POLICIES:
- Express delivery in ~2 hours | Free delivery on orders €25+ (otherwise €3.50 fee)
- Promo code "FRESH20" → 20% off on fresh items at checkout

LIVE STORE CATALOG (Real-time, ${totalCount} products):
${catalogText}`;
}

// ─────────────────────────────────────────────────────────────────
//  POST Handler
// ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      history = [],
      language = "ur-PK",
      products: clientProducts,
    } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { ok: false, error: "Prompt is required" },
        { status: 400 },
      );
    }

    const trimmedPrompt = prompt.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // ── Use products from frontend (includes localStorage custom items),
    //    fallback to the server-side seed catalog
    const liveProducts: GroceryProduct[] =
      Array.isArray(clientProducts) && clientProducts.length > 0
        ? (clientProducts as GroceryProduct[])
        : GROCERY_PRODUCTS;

    const catalogText = buildCatalogText(liveProducts);
    const systemInstruction = buildSystemPrompt(catalogText, liveProducts.length);

    // ── 1. Try Google Gemini API ──────────────────────────────────
    if (apiKey) {
      try {
        const formattedContents: Array<{
          role: "user" | "model";
          parts: Array<{ text: string }>;
        }> = [];

        let lastRole: "user" | "model" | null = null;
        if (Array.isArray(history)) {
          for (const item of history) {
            const role: "user" | "model" =
              item.sender === "bot" ||
              item.role === "model" ||
              item.role === "assistant"
                ? "model"
                : "user";
            const text = (item.text || "").trim();
            if (!text) continue;
            if (formattedContents.length === 0 && role !== "user") continue;
            if (role === lastRole) {
              formattedContents[formattedContents.length - 1].parts[0].text +=
                `\n${text}`;
            } else {
              formattedContents.push({ role, parts: [{ text }] });
              lastRole = role;
            }
          }
        }

        if (lastRole === "user") {
          formattedContents[formattedContents.length - 1].parts[0].text +=
            `\n${trimmedPrompt}`;
        } else {
          formattedContents.push({
            role: "user",
            parts: [{ text: trimmedPrompt }],
          });
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: formattedContents,
              system_instruction: { parts: [{ text: systemInstruction }] },
              generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
            }),
          },
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const answer =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return NextResponse.json({
              ok: true,
              answer: answer.trim(),
              source: "gemini",
            });
          }
        }
      } catch (geminiErr) {
        console.warn("[Gemini API Error, using local engine]:", geminiErr);
      }
    }

    // ── 2. Local knowledge engine ─────────────────────────────────
    const answer = localEngine(trimmedPrompt, language, liveProducts);
    return NextResponse.json({ ok: true, answer, source: "local-engine" });
  } catch (error) {
    console.error("[Grocery AI API Error]:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────
//  Local Fallback Engine — grounded in REAL live product list
// ─────────────────────────────────────────────────────────────────
function localEngine(
  query: string,
  _lang: string,
  products: GroceryProduct[],
): string {
  const q = query.toLowerCase().trim();

  // ── Greetings ────────────────────────────────────────────────────
  if (/kia hal|kya hal|kia haal|kya haal|kaise ho|kese ho|kaisy ho|حال چال|کیسے ہو|کیسی ہو|کیسے ہیں|کیا حال/.test(q)) {
    return "الحمدللہ، میں بالکل ٹھیک ٹھاک ہوں! آپ بتائیں، آپ کا دن کیسا گزر رہا ہے؟ آج آپ کے کچن کے لیے کیا تازہ چیزیں نکالیں؟";
  }
  if (/\bsalam\b|سلام|hello|^hi$|^hey$/.test(q)) {
    return "وعلیکم السلام! سوپر بیریو میں بہت خوش آمدید۔ آج گروسری میں کیا تازہ چیزیں منگوائیں گے؟";
  }

  // ── Store policies ────────────────────────────────────────────────
  if (/delivery|shipping|ڈیلیوری|kitni der|کتنی دیر|کتنا چارج|charges|فری ڈیلیوری/.test(q)) {
    return "سوپر بیریو کی ایکسپریس ڈیلیوری صرف ۲ گھنٹے میں آپ کے گھر! €25 سے زیادہ کے آرڈر پر ڈیلیوری بالکل مفت ہے، اس سے کم پر صرف €3.50 چارج ہوگا۔";
  }
  if (/discount|offer|ڈسکاؤنٹ|promo|code|کوڈ|رعایت|bachat|fresh20/.test(q)) {
    return 'جی ضرور! چیک آؤٹ پر پرومو کوڈ "FRESH20" لگائیں اور تمام تازہ آئٹمز پر ۲۰ فیصد فوری رعایت پائیں۔';
  }

  // ── Full catalog listing ──────────────────────────────────────────
  if (/sub item|sab item|tamam|kitne item|kya kya|kia kia|sub kuch|sab kuch|تمام|کیا کیا|لسٹ|catalog|all item|list|show all|سب کچھ/.test(q)) {
    const inStock = products.filter((p) => p.inStock);
    const names = inStock
      .map((p) => {
        const nameEn = p.nameEn || p.name;
        const nameUrdu = URDU_NAMES[nameEn] || nameEn;
        return `${nameUrdu} €${p.price.toFixed(2)}`;
      })
      .join("، ");
    return `سوپر بیریو میں ابھی ${inStock.length} آئٹمز دستیاب ہیں: ${names}۔ کسی بھی آئٹم کے بارے میں تفصیل پوچھ سکتے ہیں!`;
  }

  // ── Category queries ──────────────────────────────────────────────
  if (/snack|namkeen|اسنیکس|نمکین|mewa|dry fruit/.test(q))
    return categoryAnswer(products, "snacks");
  if (/\bfruit\b|fruits|phal|پھل/.test(q))
    return categoryAnswer(products, "fruits-vegetables");
  if (/sabzi|vegetable|سبزی/.test(q))
    return categoryAnswer(products, "fruits-vegetables");
  if (/\bdairy\b|ڈیری|doodh dahi/.test(q))
    return categoryAnswer(products, "dairy-eggs");
  if (/\bbakery\b|بیکری/.test(q))
    return categoryAnswer(products, "bakery");
  if (/\bmeat\b|poultry|گوشت|مرغی/.test(q))
    return categoryAnswer(products, "meat-poultry");
  if (/pantry|پینٹری|راشن/.test(q))
    return categoryAnswer(products, "pantry-cooking");
  if (/\bdrink|beverage|مشروب|مشروبات/.test(q))
    return categoryAnswer(products, "beverages");

  // ── Individual product search via keyword groups ───────────────────
  for (const keywords of Object.values(KEYWORD_GROUPS)) {
    if (keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      // Find matching product from live list
      for (const kw of keywords) {
        const p = products.find((prod) => {
          const ne = (prod.nameEn || prod.name).toLowerCase();
          const ns = prod.name.toLowerCase();
          const de = (prod.descriptionEn || prod.description || "").toLowerCase();
          return ne.includes(kw) || ns.includes(kw) || de.includes(kw);
        });
        if (p) return productAnswer(p);
      }
    }
  }

  // ── Loose word match on product name ─────────────────────────────
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) {
    const loose = products.find((p) => {
      const ne = (p.nameEn || p.name).toLowerCase();
      return ne.includes(word);
    });
    if (loose) return productAnswer(loose);
  }

  // ── Not found — honest answer ─────────────────────────────────────
  const inStockCount = products.filter((p) => p.inStock).length;
  return `معذرت، یہ آئٹم ابھی ہمارے اسٹور میں دستیاب نہیں ہے۔ ہمارے پاس کل ${inStockCount} تازہ آئٹمز موجود ہیں۔ پھل، سبزیاں، دودھ، انڈے، چکن، بریڈ یا اسنیکس کے بارے میں ضرور پوچھیں!`;
}

// ── Format single product response ────────────────────────────────
function productAnswer(p: GroceryProduct): string {
  const nameEn = p.nameEn || p.name;
  const nameUrdu = URDU_NAMES[nameEn] || nameEn;
  const unit = p.unitEn || p.unit;
  const discount = p.originalPrice
    ? ` پہلے یہ €${p.originalPrice.toFixed(2)} کا تھا، اب ${(((p.originalPrice - p.price) / p.originalPrice) * 100).toFixed(0)}% رعایت کے ساتھ`
    : "";
  const stock = p.inStock ? "دستیاب ہے ✓" : "⚠ ابھی اسٹاک میں نہیں";
  return `جی بالکل! ${nameUrdu} (${nameEn}) ${stock}۔ قیمت صرف €${p.price.toFixed(2)} فی ${unit}${discount}۔ کیا میں اسے آپ کے آرڈر میں شامل کر دوں؟`;
}

// ── Format category list response ─────────────────────────────────
function categoryAnswer(products: GroceryProduct[], category?: string): string {
  const list = category
    ? products.filter((p) => p.category === category && p.inStock)
    : products.filter((p) => p.inStock);
  if (!list.length)
    return "معذرت، اس وقت اس کیٹیگری میں کوئی آئٹم دستیاب نہیں۔";
  const items = list
    .map((p) => {
      const nameEn = p.nameEn || p.name;
      const nameUrdu = URDU_NAMES[nameEn] || nameEn;
      const unit = p.unitEn || p.unit;
      return `${nameUrdu} €${p.price.toFixed(2)}/${unit}`;
    })
    .join("، ");
  return `ہمارے پاس یہ آئٹمز دستیاب ہیں: ${items}۔ کس کے بارے میں مزید جاننا چاہیں گے؟`;
}
