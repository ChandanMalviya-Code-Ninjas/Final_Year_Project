# KeenCare Bot (HealthAI) - 26-Week Project Diary

## Project Name: KeenCare Bot (HealthAI)
**Timeline:** 26 Weeks

This document serves as the official weekly project diary, detailing the progress, meeting discussions, and the changes/suggestions implemented throughout the lifecycle of the final year project.

---

### **Phase 1: Project Initiation & Setup (Weeks 1-4)**

#### **Week 1: Problem Definition and Topic Selection**
- **Progress:** Identified the core problem statement focusing on accessible healthcare, AI-driven preliminary diagnostics, and medication adherence. Proposed the "HealthAI / KeenCare Bot" concept.
- **Meeting Details:** Initial meeting with the Project Guide to discuss the feasibility of building a unified health platform.
- **Suggestions/Changes:** Guide suggested narrowing down the scope to three primary features to ensure high quality: Disease Predictor, Medication Reminder, and Hospital Finder.
- **Next Steps:** Conduct literature review and requirement gathering.

#### **Week 2: Literature Review & Feasibility Study**
- **Progress:** Researched existing healthcare applications in the market. Analyzed limitations in current symptom checkers and medication reminder apps.
- **Meeting Details:** Presented the literature survey and comparative analysis findings.
- **Suggestions/Changes:** Ensure the ML model for the disease predictor is lightweight and accurate. Suggested decoupling the ML component into a separate Python service (Streamlit).
- **Next Steps:** Formalize the System Requirements Specification (SRS) and finalize the technology stack.

#### **Week 3: Tech Stack Finalization & SRS Drafting**
- **Progress:** Finalized the Tech Stack: React/Vite for frontend, Supabase for backend database and edge functions, Python/Streamlit for the ML model, and TailwindCSS for the UI. Drafted initial SRS.
- **Meeting Details:** Reviewed the draft SRS document.
- **Suggestions/Changes:** Ensure Supabase Edge Functions are thoroughly documented in the SRS, as they will be critical for handling serverless cron jobs (automated reminders).
- **Next Steps:** Draft architectural diagrams and initial UI wireframes.

#### **Week 4: System Architecture & Wireframing**
- **Progress:** Created System Architecture diagrams, Data Flow Diagrams (DFDs), and ER diagrams for user and medication schemas. Designed initial UI wireframes for the main dashboard.
- **Meeting Details:** First Official Review/Presentation of the planning phase to the internal panel.
- **Suggestions/Changes:** The UI needs to be highly accessible for elderly users. Advised to keep navigation extremely simple and intuitive. Approved to begin development.
- **Next Steps:** Setup local development environments and initialize remote repositories.

---

### **Phase 2: Database Design & Core Architecture (Weeks 5-8)**

#### **Week 5: Environment Setup & Version Control**
- **Progress:** Initialized the Git repository. Set up standard Vite + React (TypeScript) frontend environment. Created the core folder structure and basic routing logic.
- **Meeting Details:** Brief sync-up to check environment configuration and package manager (Bun/NPM).
- **Suggestions/Changes:** Enforce strict TypeScript linting and ESLint early in the project to prevent cascading bugs later.
- **Next Steps:** Design and configure the Supabase backend.

#### **Week 6: Database Schema Implementation**
- **Progress:** Designed Supabase tables: `users`, `medications`, `reminders`, and `health_records`. Established strict Row Level Security (RLS) policies to protect user data.
- **Meeting Details:** Reviewed the ER diagram against the actively built Supabase tables.
- **Suggestions/Changes:** Guide suggested adding an "active/inactive" flag for medications so users don't have to permanently delete history and can track past prescriptions.
- **Next Steps:** Build User Authentication flows.

#### **Week 7: Authentication & User Management**
- **Progress:** Implemented Supabase Auth (Sign-up, Log-in, Password management). Built the backend connectivity for the user profile dashboard.
- **Meeting Details:** Walkthrough of the authentication system.
- **Suggestions/Changes:** Add robust frontend error handling for weak passwords and already-registered user emails to improve user experience.
- **Next Steps:** Start building the primary dashboard UI elements.

#### **Week 8: Dashboard Layout & Navigation**
- **Progress:** Created the main navigation sidebar and highly responsive dashboard layout using Tailwind CSS and modern UI components.
- **Meeting Details:** UI/UX Review with the guide.
- **Suggestions/Changes:** The color scheme should inspire trust and medical safety (suggested shifting to medical blues and clean whites).
- **Next Steps:** Develop the Python/Streamlit Disease ML Model.

---

### **Phase 3: AI Model & Frontend Integration (Weeks 9-12)**

#### **Week 9: Disease ML Model Development (Local)**
- **Progress:** Trained a Random Forest classifier algorithm on healthcare datasets for symptom-to-disease mapping. Wrapped it in a local Streamlit app interface.
- **Meeting Details:** Demoed the raw terminal/streamlit output of the model predictions.
- **Suggestions/Changes:** The model requires a broader list of symptoms to improve predictive accuracy. Suggested mapping symptom synonyms for better user inputs.
- **Next Steps:** Improve the training dataset and finalize the model architecture.

#### **Week 10: AI Model Refinement**
- **Progress:** Cleaned training data, removed outliers, and improved accuracy. Finalized the `Disease ML Model` directory structure and prediction endpoints.
- **Meeting Details:** Status update meeting.
- **Suggestions/Changes:** None. Development is on track, move forward with connecting it to the React app.
- **Next Steps:** Integrate the Streamlit app seamlessly into the React Frontend.

#### **Week 11: Symptom Checker UI Integration**
- **Progress:** Created the frontend Symptom parsed UI. Linked the frontend to the Streamlit app using a custom `streamlit-manager.js` bridge.
- **Meeting Details:** Demoed the fully integrated symptom checker acting inside the KeenCare dashboard.
- **Suggestions/Changes:** Add a permanent UI disclaimer stating that the AI is not a substitute for professional medical advice or a real doctor.
- **Next Steps:** Begin heavy work on the complex Medication Reminder module.

#### **Week 12: Second Review / Mid-Term Evaluation**
- **Progress:** Prepared slides summarizing Phase 1 to Phase 3. Showcased the interactive Dashboard and AI predictor.
- **Meeting Details:** Mid-Term Review Presentation to the evaluation panel.
- **Suggestions/Changes:** Panel formally approved the first half of the project. They requested ensuring robust, real-time notification integration for the upcoming medication module.
- **Next Steps:** Develop database logic for user medications.

---

### **Phase 4: Medication Reminder Module (Weeks 13-16)**

#### **Week 13: Medication CRUD Operations**
- **Progress:** Built frontend React hook forms to Add, Read, Update, and Delete user medications. Connected API calls to the Supabase `medications` table.
- **Meeting Details:** Code review session for the CRUD logic.
- **Suggestions/Changes:** Implement an autocomplete feature for medication names on the frontend to prevent harmful typos by users.
- **Next Steps:** Implement search/autocomplete for drug names.

#### **Week 14: Medication Autocomplete Feature**
- **Progress:** Created a complex combobox UI component with a predefined list of common medications to serve the autocomplete functionality. Improved form validation rules.
- **Meeting Details:** Demo of Medication addition UI.
- **Suggestions/Changes:** Ensure timing inputs (daily, weekly, specific hours) are highly intuitive and visually distinct.
- **Next Steps:** Implement backend cron jobs and dispatchers logic.

#### **Week 15: Edge Functions Setup (Supabase)**
- **Progress:** Set up Deno-based Supabase Edge Functions (`medication-reminder-notification/index.ts`) for serverless execution.
- **Meeting Details:** Discussed edge server limitations and cron scheduling.
- **Suggestions/Changes:** Keep the execution time low. Consider batching database queries if the reminder volume gets large across many users.
- **Next Steps:** Integrate external notification channels.

#### **Week 16: WhatsApp & Email Integration Logic**
- **Progress:** Researched notification APIs (Twilio, Resend). Implemented mock/test dispatchers inside the edge function to confirm logic paths.
- **Meeting Details:** Reviewed the API architecture and webhook triggers.
- **Suggestions/Changes:** Store API keys strictly in `.env` and Supabase Vault. Map user preferences to their chosen channel so they aren't spammed across all platforms.
- **Next Steps:** Build the Hospital & Pharmacy locator module.

---

### **Phase 5: Hospital Finder & Geolocation (Weeks 17-20)**

#### **Week 17: Maps API & Geolocation Setup**
- **Progress:** Integrated Maps for map visualization. Implemented browser geolocation API to accurately fetch user coordinates on load.
- **Meeting Details:** UI mapping capability review.
- **Suggestions/Changes:** Handle cases where the user denies location permissions gracefully (create a fallback to a manual city/zip code search).
- **Next Steps:** Fetch nearby hospitals around the coordinates.

#### **Week 18: Hospital Search Module**
- **Progress:** Integrated place autocomplete and mapped nearby hospitals onto the dashboard using custom interactive markers.
- **Meeting Details:** Feature review.
- **Suggestions/Changes:** Display distance calculations and active operating hours inside the map tooltips if available.
- **Next Steps:** Expand search logic to include local Pharmacies.

#### **Week 19: Pharmacy Search Addition**
- **Progress:** Added a UI toggle switch to visually filter between Hospitals and Pharmacies. Updated map state dynamically based on user selection.
- **Meeting Details:** Status update on completion of the third and final core feature.
- **Suggestions/Changes:** Combine the UI routing so Hospital and Pharmacy share the exact same map space without triggering full page reloads.
- **Next Steps:** System integration and cross-module end-to-end testing.

#### **Week 20: Pre-Final Internal Review**
- **Progress:** Successfully demonstrated all three interconnected modules: ML Predictor, Medication System, and Hospital/Pharmacy Finder working together perfectly in the UI.
- **Meeting Details:** Full project walkthrough with the Primary Guide.
- **Suggestions/Changes:** The notification edge function logic needs better error handling when email delivery fails.
- **Next Steps:** Heavy bug fixing and stability updates.

---

### **Phase 6: Integration, Testing & Refinement (Weeks 21-23)**

#### **Week 21: Bug Fixing & Edge Function Refinement**
- **Progress:** Fixed state submission issues in the Medication module. Hardened the Edge Function handling and timing cron logic. Corrected time zone bugs in reminders.
- **Meeting Details:** System debugging session.
- **Suggestions/Changes:** Add a manual "Test Notification" button on the UI so evaluators can instantly see the notification system working without waiting for cron triggers.
- **Next Steps:** UX/UI Polish.

#### **Week 22: UI/UX Polish & Responsiveness**
- **Progress:** Ensured all screens are fully functional on mobile viewing. Standardized button designs, fonts, and hover states across the app.
- **Meeting Details:** Final UI review before documentation.
- **Suggestions/Changes:** Add loading skeletons or spinners during API fetches so the screen doesn't freeze or appear broken to the user.
- **Next Steps:** Conduct comprehensive testing matrices.

#### **Week 23: Comprehensive Testing (Unit & Integration)**
- **Progress:** Conducted rigorous testing on form validations, database RLS rules, symptom prediction accuracy, and geolocation map loads.
- **Meeting Details:** Reviewed initial Testing Results.
- **Suggestions/Changes:** Need to generate a formal, formatted test report document detailing expected outcomes vs actual outcomes to include in the physical project report.
- **Next Steps:** Documentation, thesis, and Report drafting.

---

### **Phase 7: Final Delivery & Documentation (Weeks 24-26)**

#### **Week 24: Project Report Drafting**
- **Progress:** Drafted chapters for the final physical report covering: Introduction, System Design, Implementation Details, Testing, and Conclusion.
- **Meeting Details:** Report draft submission.
- **Suggestions/Changes:** The guide requested specific formatting changes for the IEEE standard in the abstract and references sections. Make the architectural diagrams higher resolution.
- **Next Steps:** Finalize report and create presentation slides.

#### **Week 25: Presentation & Video Creation**
- **Progress:** Created the Final Review Presentation (PPT), formulated the Video Presentation Script, and updated all GitHub README files for the final handoff.
- **Meeting Details:** Mock presentation practice session.
- **Suggestions/Changes:** Emphasize the uniqueness of combining ML symptom checking + actual medication adherence in one accessible platform. Keep code explanations concise for non-technical panel members.
- **Next Steps:** Final Deployment.

#### **Week 26: Final Deployment & Review Prep**
- **Progress:** Built the final Vite application bundle, pushed to production (Vercel/Netlify). Deployed the final Supabase schema to the production cloud. Ensured all configurations point to live environments.
- **Meeting Details:** Final Clearance Meeting.
- **Suggestions/Changes:** Project cleared and approved for final university submission and defense.
- **Next Steps:** Final Presentation Evaluation and grading.
