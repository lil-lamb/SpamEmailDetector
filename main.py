from flask import Flask, request, jsonify

app = Flask(__name__)
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
import pandas as pd

# Download the dataset
dataset_path = '/Users/kylalam/PycharmProjects/SpamEmailDetector/spam.csv'

df = pd.read_csv(dataset_path, encoding='latin-1')
df = df.drop(['Unnamed: 2','Unnamed: 3', 'Unnamed: 4'], axis=1)
df = df.rename(columns={"v1": "Category","v2": "Text"})
model = make_pipeline(CountVectorizer(), MultinomialNB())
x_train, x_test, y_train, y_test = train_test_split(df['Text'], df['Category'], test_size=0.3, random_state=100)
model.fit(x_train, y_train)

@app.route('/',methods=['POST'])
def predict_spam():
    if request.method == 'POST':
        email_text = request.json.get('email','')
        if email_text:
            prediction = model.predict([email_text])[0]
            return jsonify({'spam': prediction == 'spam'})
        else:
            return jsonify({'error': 'Missing email text'}), 400
    else:
        return jsonify({'error': 'Invalid request method'}), 405

if __name__ == '__main__':
    app.run(debug=True)
