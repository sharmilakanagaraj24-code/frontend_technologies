from flask import Flask, request, jsonify
from flask_cors import CORS
from matching_engine import JobFitMatchingEngine

app = Flask(__name__)
CORS(app)

engine = JobFitMatchingEngine()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'ai-job-portal-ml-service',
        'engine': 'scikit-learn tfidf vectorizer',
        'version': '1.0.0'
    })

@app.route('/api/predict-fit', methods=['POST'])
def predict_fit():
    data = request.get_json()
    if not data or 'resume' not in data or 'job' not in data:
        return jsonify({'error': 'Missing required fields: resume and job'}), 400

    try:
        result = engine.predict_fit(data['resume'], data['job'])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/recommendations', methods=['POST'])
def recommend_jobs():
    data = request.get_json()
    if not data or 'profile' not in data or 'jobs' not in data:
        return jsonify({'error': 'Missing required fields: profile and jobs'}), 400

    profile = data['profile']
    jobs = data['jobs']

    recommendations = []
    for job in jobs:
        fit = engine.predict_fit(profile, job)
        recommendations.append({
            'jobId': job.get('id'),
            'score': fit['overallScore'],
            'matchedSkills': fit['matchedSkills'],
            'explanation': fit['explanation']
        })

    recommendations.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'recommendations': recommendations}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
