const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBL4aiEHR2mBeelotnAujMH8MlMCSYxUo0");

exports.suggestCategoryWithGemini = async (description,catlist) => {
  try {
    const categories = ["TECHNICAL", "ARTS & CULTURALS", "SOCIAL OUTREACH", "LITERATURE", "HEALTH & WELLNESS"];
    const prompt = `
You are categorizing college events. Choose a **single most fitting** one-word category from the list below, or suggest your own if none fit.

Categories: ${categories.join(", ")}, ${catlist.join(",")}

Event Description: ${description}

Respond ONLY with a single word (existing or new) that best categorizes this event.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error("Gemini category generation failed:", err);
    throw new Error("Failed to suggest category");
  }
};
