const { exec } = require("child_process");
const { suggestCategoryWithGemini } = require("../utils/gemini");

const categoryOptions = [
  "TECHNICAL",
  "ARTS & CULTURALS",
  "SOCIAL OUTREACH",
  "LITERATURE",
  "HEALTH & WELLNESS"
];

const getKeywordBasedCategory = (text, categoryOptions) => {
  if (!text) return { keywords: [], category: "" };

  const stopWords = new Set([
    "the", "and", "are", "is", "with", "from", "that", "this", "was", "for",
    "have", "has", "had", "been", "also", "such", "but", "not", "you", "your",
    "about", "will", "can", "could", "should", "would", "may", "might", "into",
    "through", "among", "more", "some", "other", "their", "they", "them"
  ]);

  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const wordFreq = {};
  words.forEach((w) => {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  });

  // Sort by importance (frequency * length weight)
  const sortedKeywords = Object.entries(wordFreq)
    .map(([word, freq]) => ({
      word,
      score: freq * (word.length > 5 ? 2 : 1),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.word);

  const topKeywords = sortedKeywords.slice(0, 5); // Pick top 3–5

  let bestMatch = "";
  let highestScore = 0;

  categoryOptions.forEach((cat) => {
    const catWords = cat.toLowerCase().split(/\W+/);
    let score = 0;

    catWords.forEach((word) => {
      if (topKeywords.includes(word)) {
        score += 1;
      }
    });

    if (score > highestScore) {
      bestMatch = cat;
      highestScore = score;
    }
  });

  return {
    keywords: topKeywords,
    category: bestMatch || sortedKeywords[0] || "",
  };
};

// const predictWithLocalModel = (text) => {
//   return new Promise((resolve, reject) => {
//     const sanitized = text.replace(/"/g, '\\"'); // escape quotes
//     exec(`python3 ./ml/category_predictor.py "${sanitized}"`, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Local model error:", stderr);
//         return reject("Python prediction failed");
//       }
//       resolve(stdout.trim());
//     });
//   });
// };

exports.suggestCategory = async (req, res) => {
  const { description, categoryList } = req.body;

  console.log(description);
  console.log(categoryList);

  try {
    const [gemini] = await Promise.all([
      suggestCategoryWithGemini(description, categoryList),
    ]);

    const { keywords, category } = getKeywordBasedCategory(description, categoryList);

    console.log("Gemini:", gemini);
    console.log("Keyword Category:", category);
    console.log("Extracted Keywords:", keywords);

    res.json({
      gemini,
      keyword: category,
      keywords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate category suggestion" });
  }
};

