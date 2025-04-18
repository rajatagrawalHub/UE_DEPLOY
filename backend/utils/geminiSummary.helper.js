const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBL4aiEHR2mBeelotnAujMH8MlMCSYxUo0");

exports.generateFeedbackSummary = async (feedbacks) => {
  try {
    const prompt = `Here is feedback collected from an event:\n\n${feedbacks
      .map(
        (fb, i) =>
          `Feedback ${i + 1}:\n` +
          fb.answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n") +
          "\n"
      )
      .join("\n")}

Based on this feedback, write:
1. A summary paragraph describing participants’ experience.
2. A second paragraph suggesting possible improvements or actions the organizers can take. The output should not contain any conversatory sentenc like regular sentenec e and no * for bold and all, also jsut two paragraphs`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini summary generation failed:", err);
    throw new Error("Failed to generate summary");
  }
};
