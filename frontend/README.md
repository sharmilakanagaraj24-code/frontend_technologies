# AI-Powered Job Portal with Intelligent Resume Builder

Next-generation recruitment platform that combines intelligent job searching, transparent AI/ML job-fit prediction, TF-IDF skill-gap analysis, and an ATS-friendly live resume builder in a single unified architecture.

---

## 1. System Architecture

The project is built on a modular four-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                  React + TypeScript Frontend                │
│    (Port 3000: Responsive UI, Live ATS Preview, PDF Export) │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Spring Boot 3.x Backend    │ │  Python Scikit-Learn ML    │
│    (Port 8080: REST APIs,    │ │ (Port 5000: TF-IDF Engine, │
│     Security, Validation)    │ │   Cosine Similarity, Gaps) │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│       MySQL 8.0 Database     │
│   (Port 3306: job_portal_db  │
│    18 relational tables)     │
└──────────────────────────────┘
```

---

## 2. Machine Learning & Job-Fit Scoring Engine

Job-fit scoring uses a deterministic, explainable mathematical model combining NLP text similarity with skills ontology matching:

$$\text{Overall Fit Score} = 0.40 \cdot S_{\text{skills}} + 0.30 \cdot S_{\text{TF-IDF}} + 0.15 \cdot S_{\text{experience}} + 0.15 \cdot S_{\text{role}}$$

### Component Weights:
1. **Technical Skills Match (40% weight)**:
   - Mandatory required skills carry $2\times$ weight; preferred skills carry $1\times$ weight.
   - Exact ontology match = $100\%$ credit.
   - Mention in projects/experience = $60\%$ partial credit.
2. **TF-IDF Vector Cosine Similarity (30% weight)**:
   - Tokenization with technical compound preservation (`c++`, `node.js`, `spring boot`, etc.).
   - Standard NLTK stop-words removal and unigram + bigram extraction.
   - Cosine similarity: $\cos(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$.
3. **Experience Level Match (15% weight)**:
   - Evaluates candidate years of experience against minimum required years. Entry-level/fresher jobs award full credit to new graduates.
4. **Role & Academic Alignment (15% weight)**:
   - Compares candidate target headline, degree major, and past titles to job requirements.

---

## 3. Key Modules

### A. Job Search & Filtering
- Search by title, keyword, company, or technical skill (e.g. `Java`, `React`, `Python`).
- Multi-filters: Location Modality (Remote, Hybrid, On-site), Experience Level (Entry-level, Mid-level, Senior), and Employment Type (Full-time, Internship, Contract).
- Live match score badge computed dynamically on every job card.
- Duplicate application prevention.

### B. Intelligent Resume Builder
- **4 Professional ATS Templates**: Modern Tech, Classic ATS (pure monochrome), Executive Navy, and Minimal Clean.
- **Section Editors**: Personal Details, Professional Summary, Technical Skills (with category tags), Work Experience, Projects, Education, and Certifications.
- **Job Tailoring**: Target any portal job to run live ATS compatibility checks.
- **AI Enhancement Suggestions**: Suggests quantified project bullet points and missing keywords with **Accept**, **Reject**, and **Inline Edit** controls.
- **PDF Export**: Print-ready, vector-sharp PDF export formatted for standard letter/A4 paper without layout clipping.

### C. Application Pipeline Dashboard
- Real-time funnel metrics: Available Jobs, Recommended Jobs, Total Applications, and Saved Bookmarks.
- Pipeline status breakdown: Applied $\rightarrow$ Under Review $\rightarrow$ Shortlisted $\rightarrow$ Interviewing.
- Resume ATS readiness gauge and history logs.

---

## 4. Quick Start & Docker Deployment

### Prerequisites:
- Docker & Docker Compose installed.

### Start the Entire Stack:
```bash
docker-compose up --build
```

### Services Access:
- **Web Application**: `http://localhost:3000`
- **Spring Boot API**: `http://localhost:8080/api/jobs`
- **Python ML Microservice**: `http://localhost:5000/health`
- **MySQL Database**: `localhost:3306` (Database: `job_portal_db`)

---

## 5. Local Development (Without Docker)

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed_data.sql
```

### 2. Python ML Microservice
```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. Java Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```

### 4. React Frontend
```bash
npm install
npm run dev
```

---

## 6. Pre-Configured Test Accounts

| Persona | Name | Email | Focus Area |
| :--- | :--- | :--- | :--- |
| **Fresh Graduate** | Alex Rivera | `alex.rivera@example.com` | CS Grad 2026, Java, React, SQL, Spring Boot |
| **Experienced Engineer** | Priya Sharma | `priya.sharma@example.com` | 3.5+ Yrs, Microservices, Docker, AWS, React |

*You can switch between these demo accounts with 1 click in the top navigation bar, or register your own custom account!*
