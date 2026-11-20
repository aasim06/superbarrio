import { NextRequest, NextResponse } from "next/server";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import type { GroceryProduct } from "@/types/grocery";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// Keyword map for local fallback engine
// Keys = concept, values = search tokens (Strict product matching, no generic words)
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_GROUPS: Record<string, string[]> = {
  tomato: ["tomate", "tomates", "tamatar", "tomat", "tomato", "tomatoes"],
  banana: ["platano", "plátano", "platanos", "plátanos", "banana", "bananas", "kela", "canarias", "platano macho"],
  apple: ["manzana", "manzanas", "apple", "apples", "seb", "gala", "fuji", "reineta", "golden", "marlene", "pink lady"],
  broccoli: ["brocoli", "brócoli", "broccoli"],
  carrot: ["zanahoria", "zanahorias", "carrot", "carrots", "gajar"],
  lemon: ["limon", "limón", "limones", "lemon", "lemons", "murcia"],
  orange: ["naranja", "naranjas", "mandarina", "mandarinas", "clemenules", "valencia"],
  pear: ["pera", "peras", "conferencia", "ercolini", "williams"],
  pepper: ["pimiento", "pimientos", "morron", "morrón", "guindilla", "padron", "padrón"],
  potato: ["patata", "patatas", "papa", "papas", "potato", "boniato", "batata"],
  lettuce: ["lechuga", "lechugas", "iceberg", "cogollos", "tudela", "espinaca", "espinacas"],
  onion: ["cebolla", "cebollas", "fuentes", "dulce"],
  strawberry: ["fresa", "fresas", "freson", "fresón", "arandanos", "arándanos", "frutos rojos"],
  melon: ["melon", "melón", "sandia", "sandía", "piel de sapo"],
  exotic: ["mango", "aguacate", "pina", "piña", "pitahaya", "dragon fruit", "chirimoya", "granada"],
  oil: ["aceite", "oliva", "virgen extra", "olive oil"],
  jamon: ["jamon", "jamón", "serrano", "iberico", "ibérico", "navidul"],
  chorizo: ["chorizo", "palacios", "embutido"],
  broth: ["caldo", "pescado", "marisco", "stock", "paella"],
  wine: ["vino", "blanco", "tinto", "verdejo", "ribera", "crianza", "sidra", "wine"],
  turron: ["turron", "turrón", "lobo", "almendro", "matcha", "dubai", "nougat"],
  coffee: ["cafe", "café", "grano", "descafeinado", "coffee"],
  dairy: ["leche", "huevos", "camperos", "avena", "yosoy", "milk", "eggs"],
};

const CATEGORY_NAMES_ES: Record<string, string> = {
  "fruits-vegetables": "Frutas y Verduras de Huerta",
  "dairy-eggs": "Lácteos y Huevos Camperos",
  bakery: "Panadería y Bollería Artesanal",
  "meat-poultry": "Carnicería y Aves",
  "pantry-cooking": "Despensa y Alimentación",
  beverages: "Bebidas y Zumos Naturales",
  snacks: "Aperitivos y Frutos Secos",
};

// ─── Build catalog text for LLM grounding ─────────────────────────────────
function buildCatalogText(products: GroceryProduct[]): string {
  return products
    .map((p, i) => {
      const name = p.name;
      const nameEn = p.nameEn || p.name;
      const unit = p.unit || p.unitEn || "ud";
      const cat = CATEGORY_NAMES_ES[p.category] || p.category;
      const discountPct = p.originalPrice
        ? ` → ${(((p.originalPrice - p.price) / p.originalPrice) * 100).toFixed(0)}% OFF (antes €${p.originalPrice.toFixed(2)})`
        : "";
      const badge = p.badge ? ` [${p.badge}]` : "";
      const stock = p.inStock ? "Disponible ✓" : "⚠️ Agotado";
      return (
        `${i + 1}. [${p.id}] ${name} | ${nameEn}\n` +
        `   Precio: €${p.price.toFixed(2)} / ${unit}${discountPct}${badge}\n` +
        `   Categoría: ${cat} | ${stock}\n` +
        `   Detalles: ${p.description || p.descriptionEn || ""}`
      );
    })
    .join("\n");
}

// ─── Build grounded system prompt ─────────────────────────────────────────
function buildSystemPrompt(catalogText: string, totalCount: number): string {
  return `You are 'SuperBarrio AI', a warm, friendly, conversational AI shopping assistant for SuperBarrio, a premium supermarket in Madrid, Spain.

PERSONALITY:
- Speak naturally, warmly and professionally, like a friendly local Spanish shopkeeper and smart grocery expert.
- Respond warmly to greetings and customer inquiries.
- Keep spoken responses CONCISE (1–3 short sentences) so they sound natural and engaging when spoken aloud via Text-to-Speech (TTS).

LANGUAGE RULES:
- If user speaks Spanish or language is "es-ES" → reply STRICTLY in natural European Spanish (Castellano de España). Use natural grocery terms (e.g. "frutas de la huerta", "aceite de oliva virgen extra", "reparto a domicilio", "cesta de la compra", "¿te gustaría añadirlo?").
- If user speaks English or language is "en-US" → reply in fluent, warm English.
- If user speaks Urdu → reply in natural Urdu script.

GROUNDING RULES — CRITICAL:
1. ONLY reference products that exist in the catalog below (${totalCount} items total).
2. If the item IS in the catalog: state its EXACT name, real price in €, unit, and stock status.
3. If the item is NOT in catalog: honestly say it is not currently available and suggest the closest available alternative.
4. NEVER invent products, prices, discounts, or offers not listed below.

STORE POLICIES:
- Express delivery in 25 mins to 2 hours | Free delivery on orders €25+ (otherwise €2.50 fee).
- Promo code "FRESH20" → 20% off on fresh produce and grocery items at checkout.
- Store hours: Monday to Saturday 09:00 - 21:30, Sunday 10:00 - 15:00.
- Payment methods: Credit/Debit Cards (Visa, Mastercard), Bizum, Apple Pay, Google Pay, and Cash on Delivery.
- Location: Madrid, Spain.

LIVE STORE CATALOG (Real-time, ${totalCount} products):
${catalogText}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      history = [],
      language = "es-ES",
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

    const liveProducts: GroceryProduct[] =
      Array.isArray(clientProducts) && clientProducts.length > 0
        ? (clientProducts as GroceryProduct[])
        : GROCERY_PRODUCTS;

    const catalogText = buildCatalogText(liveProducts);
    const systemInstruction = buildSystemPrompt(catalogText, liveProducts.length);

    // ── 1. Try Google Gemini API if key is available ───────────────────────
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

        // Modern fast Gemini models (gemini-3-flash-preview is ultra-fast & high capacity)
        const candidateModels = [
          "gemini-3-flash-preview",
          "gemini-3.5-flash-lite",
          "gemini-3.5-flash",
        ];
        let answer: string | undefined;

        for (const model of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(6000),
                body: JSON.stringify({
                  contents: formattedContents,
                  system_instruction: { parts: [{ text: systemInstruction }] },
                  generationConfig: {
                  thinkingConfig: { thinkingBudget: 0 },
                  temperature: 0.7,
                  maxOutputTokens: 300,
                },
                }),
              },
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (answer) break;
            }
          } catch {
            // try next model or fallback
          }
        }

        if (answer) {
          return NextResponse.json({
            ok: true,
            answer: answer.trim(),
            source: "gemini",
          });
        }
      } catch (geminiErr) {
        console.warn("[Gemini API Error, using local engine]:", geminiErr);
      }
    }

    // ── 2. Local knowledge engine (100% Free & Fast Fallback) ─────────────
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

// ─────────────────────────────────────────────────────────────────────────────
//  Local Knowledge Engine — Multilingual (Spanish / English / Urdu)
// ─────────────────────────────────────────────────────────────────────────────
function localEngine(
  query: string,
  lang: string,
  products: GroceryProduct[],
): string {
  const q = query.toLowerCase().trim();
  const isSpanish = lang === "es-ES" || /hola|buenos|tardes|noches|precio|cu[aá]nto|env[ií]o|reparto|entrega|descuento|oferta|horario|aceite|leche|pan|huevo|fruta|verdura/.test(q);
  const isUrdu = lang === "ur-PK" || /[\u0600-\u06FF]/.test(q);

  // ── Greetings ─────────────────────────────────────────────────────────
  if (/hola|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|c[oó]mo est[aá]s/.test(q)) {
    return "¡Hola! Muy buenas. Te damos la bienvenida a SuperBarrio. ¿En qué producto fresco u oferta te puedo ayudar hoy?";
  }
  if (/\b(hello|hi|hey)\b/.test(q) && !isSpanish) {
    return "Hello! Welcome to SuperBarrio. How can I help you with your fresh groceries and orders today?";
  }
  if (/\bsalam\b|سلام/.test(q) || isUrdu) {
    return "وعلیکم السلام! سپر بیریو میں خوش آمدید۔ آج آپ کے لیے کون سے تازہ آئٹمز دیکھیں؟";
  }

  // ── Payments & Methods ────────────────────────────────────────────────
  if (/tarjeta|pago|pagar|efectivo|bizum|forma de pago|payment|pay|card/.test(q)) {
    if (isSpanish) {
      return "Aceptamos pago seguro con tarjeta (Visa, Mastercard), Bizum, Apple Pay, Google Pay y pago en efectivo contra reembolso en el momento de la entrega.";
    }
    return "We accept secure credit/debit card payments, Bizum, Apple Pay, Google Pay, and Cash on Delivery.";
  }

  // ── Store Address / Location ──────────────────────────────────────────
  if (/d[oó]nde est[aá]|direcci[oó]n|tienda f[ií]sica|ubicaci[oó]n|calle|madrid|location|address/.test(q)) {
    if (isSpanish) {
      return "Nuestro centro principal de supermercado y reparto exprés se encuentra en Madrid, España. Realizamos entregas directas a domicilio en 25 minutos.";
    }
    return "Our main supermarket and express delivery hub is located in Madrid, Spain, delivering fresh orders within 25 minutes.";
  }

  // ── Deliveries & Shipping ─────────────────────────────────────────────
  if (/env[ií]o|entrega|reparto|domicilio|cu[aá]nto tarda|tiempo|portes|plazos|delivery|shipping/.test(q)) {
    if (isSpanish) {
      return "Realizamos reparto exprés en 25 minutos a 2 horas en toda la zona. ¡El envío es totalmente gratuito en pedidos a partir de 25€! Para pedidos menores, el coste de envío es de solo 2,50€.";
    }
    return "We deliver fast in 25 minutes to 2 hours! Delivery is 100% free on orders over €25 (or €2.50 for smaller orders).";
  }

  // ── Discounts, Promos & Coupons ───────────────────────────────────────
  if (/descuento|oferta|rebaja|cup[oó]n|promo|c[oó]digo|fresh20|discount|coupon/.test(q)) {
    if (isSpanish) {
      return '¡Aprovecha hoy! Introduce el cupón "FRESH20" en la pantalla de pago y consigue un 20% de descuento directo en todos los productos frescos.';
    }
    return 'Use promo code "FRESH20" at checkout to get an instant 20% discount on fresh grocery items!';
  }

  // ── Store Schedule / Hours ────────────────────────────────────────────
  if (/horario|abierto|cerrado|abren|cierran|domingo|s[aá]bado|schedule|hours/.test(q)) {
    if (isSpanish) {
      return "Nuestro horario es de lunes a sábado de 09:00 a 21:30 horas ininterrumpidamente, y domingos de 10:00 a 15:00 horas.";
    }
    return "Our opening hours are Monday to Saturday from 09:00 to 21:30 non-stop, and Sundays from 10:00 to 15:00.";
  }

  // ── Contact / Phone / WhatsApp ────────────────────────────────────────
  if (/tel[eé]fono|contacto|llamar|whatsapp|email|correo|phone|contact/.test(q)) {
    return "Puedes escribirnos o llamarnos directamente por WhatsApp al +34 632 250 561 o escribir a pedidos@superbarrio.es.";
  }

  // ── Meat query check ──────────────────────────────────────────────────
  if (/carne|embutido|jamon|jamón|chorizo|meat/.test(q)) {
    return isSpanish
      ? "En nuestra sección de carnicería y embutidos disponemos de Jamón Curado Gran Selección Navidul (4,85 €) y Chorizo Extra Tradicional de La Rioja Palacios (5,65 €), así como Chorizo Ibérico de Bellota. ¿Te gustaría añadir alguno?"
      : "In our cured meats section we have NAVIDUL Cured Spanish Ham (€4.85) and PALACIOS Traditional Rioja Chorizo (€5.65). Would you like to add any?";
  }

  // ── Full catalog listing ──────────────────────────────────────────────
  if (/cat[aá]logo|qu[eé] tienen|qu[eé] vend[eé]is|todos los productos|lista|catalog|all products|show all/.test(q)) {
    const inStock = products.filter((p) => p.inStock);
    const names = inStock
      .slice(0, 8)
      .map((p) => `${p.name} (€${p.price.toFixed(2)})`)
      .join(", ");
    if (isSpanish) {
      return `Disponemos de más de ${inStock.length} artículos frescos en stock: ${names}... ¿Deseas consultar algún producto en particular?`;
    }
    return `We have ${inStock.length} fresh products in stock: ${names}... Would you like to check any specific item?`;
  }

  // ── Category queries ──────────────────────────────────────────────────
  if (/^secci[oó]n|^categor[ií]a|qu[eé] frutas|qu[eé] verduras/i.test(q)) {
    return categoryAnswer(products, "fruits-vegetables", isSpanish);
  }

  // ── Individual product search via keyword groups (Match NAME only, NOT description) ──
  for (const keywords of Object.values(KEYWORD_GROUPS)) {
    if (keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      for (const kw of keywords) {
        const p = products.find((prod) => {
          const name = prod.name.toLowerCase();
          const nameEn = (prod.nameEn || "").toLowerCase();
          return name.includes(kw) || nameEn.includes(kw);
        });
        if (p) return productAnswer(p, isSpanish);
      }
    }
  }

  // ── Word match on product name ────────────────────────────────────────
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) {
    const loose = products.find((p) => {
      const name = p.name.toLowerCase();
      const nameEn = (p.nameEn || "").toLowerCase();
      return name.includes(word) || nameEn.includes(word);
    });
    if (loose) return productAnswer(loose, isSpanish);
  }

  // ── Broader Category queries fallback ─────────────────────────────────
  if (/fruta|verdura|huerta|fruit|vegetable/.test(q)) {
    return categoryAnswer(products, "fruits-vegetables", isSpanish);
  }

  // ── Not found fallback ────────────────────────────────────────────────
  const inStockCount = products.filter((p) => p.inStock).length;
  if (isSpanish) {
    return `En SuperBarrio disponemos de más de ${inStockCount} artículos frescos de huerta como plátanos de Canarias, manzanas, zanahorias y mandarinas. ¿Te gustaría consultar el precio de alguna fruta o verdura en particular?`;
  }
  return `At SuperBarrio we stock over ${inStockCount} fresh grocery items including Canary bananas, apples, carrots, and Valencia oranges. Feel free to ask about any item!`;
}

// ─── Format single product response ───────────────────────────────────────
function productAnswer(p: GroceryProduct, isSpanish: boolean): string {
  const name = p.name;
  const unit = p.unit || p.unitEn || "unidad";
  const stock = p.inStock
    ? isSpanish ? "disponible en tienda ✓" : "in stock ✓"
    : isSpanish ? "agotado temporalmente" : "currently out of stock";

  if (isSpanish) {
    return `Sí, tenemos ${name} (${stock}). Su precio actual es de solo €${p.price.toFixed(2)} por ${unit}. ¿Te gustaría añadirlo a tu cesta?`;
  }
  return `Yes, ${p.nameEn || name} is ${stock}. Current price is €${p.price.toFixed(2)} per ${unit}. Would you like to add it to your cart?`;
}

// ─── Format category list response ────────────────────────────────────────
function categoryAnswer(
  products: GroceryProduct[],
  category: string,
  isSpanish: boolean,
): string {
  const list = products.filter((p) => p.category === category && p.inStock);
  const catTitle = CATEGORY_NAMES_ES[category] || category;

  if (!list.length) {
    return isSpanish
      ? "En este momento no quedan unidades disponibles en esa categoría."
      : "Currently no items available in this category.";
  }

  const items = list
    .slice(0, 5)
    .map((p) => `${p.name} (€${p.price.toFixed(2)})`)
    .join(", ");

  if (isSpanish) {
    return `En ${catTitle} disponemos de: ${items}. ¿Deseas consultar algún producto en particular?`;
  }
  return `In this category we have: ${items}. Would you like to check any of them?`;
}
