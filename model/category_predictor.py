import sys
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer

model_path = os.path.join(os.path.dirname(__file__), "category_model.pkl")
with open(model_path, "rb") as f:
    model_data = pickle.load(f)

vectorizer = model_data['vectorizer']
classifier = model_data['model']


input_text = sys.argv[1]

X = vectorizer.transform([input_text])
pred = classifier.predict(X)[0]

print(pred)
