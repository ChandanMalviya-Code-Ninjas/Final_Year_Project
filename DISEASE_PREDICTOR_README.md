# Disease Predictor Streamlit App

This folder contains a standalone Streamlit application that predicts diabetes,
heart disease and Parkinson's disease using pre-trained ML models. The main
script is `app.py` and dependencies are listed in `requirements.txt`.

## Step-by-step deployment guide

Follow these instructions to run or deploy the app.

### 1. Prepare the repository

1. Open a terminal and navigate to the app directory:
   ```powershell
   cd "Disease ML Model\multiple-disease-prediction-streamlit-app"
   ```
2. Ensure the following items are committed to GitHub:
   - `app.py`
   - `requirements.txt`
   - `saved_models/` directory containing `.sav` files

### 2. Local testing

1. (Optional) create a virtual environment and activate it:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Launch the app:
   ```powershell
   streamlit run app.py
   ```
4. Browse to `http://localhost:8501` and verify the three prediction pages work.

### 3. Deploy to Streamlit Cloud

1. Push your repository branch to GitHub (create a new repo if needed).
2. Go to <https://streamlit.io/cloud> and log in with GitHub.
3. Click **New app** and select the repository and branch.
4. In the "Main file" box enter `app.py` and set the folder to
   `Disease ML Model/multiple-disease-prediction-streamlit-app` if necessary.
5. Click **Deploy**. The service will install requirements and start the app.
6. Copy the generated public URL to share or test.

### 4. Updating the app

- Make changes locally, commit and push to GitHub.
- Streamlit Cloud will auto‑rebuild on new commits. Alternatively, use the
  dashboard "Deploy" button to trigger a rebuild.

### 5. Alternative hosts

The app can also be hosted on other providers using a `Procfile`:
```
web: streamlit run app.py --server.port=$PORT
```
Deploy using Heroku, Railway, etc., following their Python deployment guides.

---

Feel free to adjust these steps or ask for help with any of them!