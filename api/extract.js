export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, mimeType } = req.body;

  if (!image || !mimeType) {
    return res.status(400).json({ error: "Missing image or mimeType" });
  }

  const systemPrompt = `You are a recipe extraction assistant. Extract the recipe from the provided image and return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. Just the raw JSON.

The JSON object must have exactly these fields (use null for any field not present in the image):
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
  "source_attribution": "string or null — original source if visible e.g. book title, website"
}

Ensure recipe_ingredient amounts and units are separated (e.g. amount: "2", unit: "cups", not amount: "2 cups").
Ensure recipe_instructions are numbered from 1 in order.
Return only the raw JSON object with no surrounding text.`;

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
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType, data: image },
              },
              {
                type: "text",
                text: "Extract the recipe from this image and return the JSON object.",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content?.map((b) => b.text || "").join("") || "";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");

    const recipe = JSON.parse(jsonMatch[0]);
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
