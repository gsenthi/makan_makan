const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract the recipe from the provided webpage text and return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. Just the raw JSON.

The JSON object must have exactly these fields (use null for any field not present):
{
  "name": "string — recipe name",
  "description": "string — brief description of the dish",
  "prep_time": integer or null — preparation time in minutes,
  "cook_time": integer or null — cooking/baking time in minutes,
  "recipe_yield": "string or null — e.g. '4 servings', '12 cookies'",
  "recipe_category": "string or null — course: starter, main, dessert, side, snack, drink, breakfast, or similar",
  "recipe_cuisine": "string or null — e.g. 'Italian', 'Malaysian', 'Japanese'",
  "cooking_method": "string or null — e.g. 'Baking', 'Stir-frying', 'Grilling'",
  "keywords": ["array", "of", "relevant", "tag", "strings"],
  "suitable_for_diet": ["array — only include applicable: vegetarian, vegan, gluten-free, dairy-free, nut-free, halal, kosher"],
  "recipe_ingredient": [{ "amount": "string", "unit": "string", "name": "string", "group": "optional section name" }],
  "recipe_instructions": [{ "position": 1, "text": "step text", "section": "optional section name" }],
  "source_attribution": "string or null — original source, e.g. website name or URL"
}

Ensure recipe_ingredient amounts and units are separated (e.g. amount: "2", unit: "cups", not amount: "2 cups").
Ensure recipe_instructions are numbered from 1 in order.
Return only the raw JSON object with no surrounding text.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url" });

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Only HTTP/HTTPS URLs are supported" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let html;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MakanMakan/1.0; recipe-scraper)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (err) {
    return res.status(400).json({ error: `Could not fetch URL: ${err.message}` });
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 20000);

  if (text.length < 100) {
    return res.status(400).json({ error: "Could not extract text from this URL" });
  }

  // Detect paywalls via schema.org JSON-LD
  const jsonLdMatches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const schema = JSON.parse(match[1]);
      const entries = Array.isArray(schema) ? schema : [schema];
      for (const entry of entries) {
        const free = entry.isAccessibleForFree;
        if (free === false || (typeof free === "string" && free.toLowerCase() === "false")) {
          return res.status(402).json({ error: "This recipe is behind a paywall. Try a different source." });
        }
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }

  // Detect paywalls via common text signals
  const paywallPhrases = [
    /subscribe to (read|continue|access|view|unlock)/i,
    /sign in to (read|continue|access|view|unlock)/i,
    /log in to (read|continue|access|view|unlock)/i,
    /this (article|content|recipe) is for (subscribers|members|premium)/i,
    /members.only content/i,
    /create a free account to continue/i,
    /you.ve reached your (free article|monthly) limit/i,
  ];
  if (paywallPhrases.some((re) => re.test(text))) {
    return res.status(402).json({ error: "This recipe is behind a paywall. Try a different source." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Extract the recipe from this webpage text. The source URL is ${parsedUrl.toString()}\n\n${text}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const raw = data.content?.map((b) => b.text || "").join("") || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");

    const recipe = JSON.parse(jsonMatch[0]);
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
