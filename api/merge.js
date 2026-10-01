const SYSTEM_PROMPT = `You are a shopping list assistant. You will be given the ingredient lists of several recipes. Merge them into one shopping list and return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. Just the raw JSON.

Rules:
- Combine quantities of the same ingredient across recipes (e.g. "3 cloves garlic" + "2 cloves garlic" = "5 cloves garlic").
- Convert units sensibly before combining where appropriate (e.g. 200ml + 2 tbsp ≈ 230ml). Prefer the unit a shopper would buy in.
- Keep ingredients separate when they are meaningfully different, even if similar: "vegetable oil" and "sesame oil" stay separate; "fresh ginger" and "ground ginger" stay separate.
- If an ingredient has no quantity, use an empty string for amount.
- Put the unit into "amount" (e.g. "5 cloves", "400ml", "2"), and keep "name" as the ingredient only.
- Put every ingredient into exactly one of these categories: "produce", "meat & fish", "dairy & eggs", "pantry", "spices & condiments", "other". Omit categories with no items.

The JSON object must have exactly this shape:
{
  "groups": [
    {
      "category": "produce",
      "items": [
        { "amount": "5 cloves", "name": "garlic" },
        { "amount": "4", "name": "pandan leaves" }
      ]
    }
  ]
}

Return only the raw JSON object with no surrounding text.`;

function formatIngredient(ing) {
  if (typeof ing === "string") return ing;
  return [ing?.amount, ing?.unit, ing?.name].filter(Boolean).join(" ");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { recipes } = req.body || {};
  if (!Array.isArray(recipes) || recipes.length === 0) {
    return res.status(400).json({ error: "Missing recipes" });
  }

  const recipeText = recipes
    .map((r) => {
      const ingredients = Array.isArray(r.recipe_ingredient) ? r.recipe_ingredient : [];
      const lines = ingredients.map(formatIngredient).filter(Boolean).map((line) => `- ${line}`);
      return `## ${r.name || "Untitled recipe"}\n${lines.length ? lines.join("\n") : "(no ingredients listed)"}`;
    })
    .join("\n\n");

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
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Merge the ingredients from these recipes into one shopping list.\n\n${recipeText}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (data.stop_reason === "max_tokens") throw new Error("The shopping list was too long to generate. Try fewer recipes.");

    const raw = data.content?.map((b) => b.text || "").join("") || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");

    const merged = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(merged.groups)) throw new Error("Unexpected response format");
    res.status(200).json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
