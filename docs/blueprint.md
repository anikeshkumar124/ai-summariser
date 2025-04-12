# **App Name**: NoteFlow Summarizer

## Core Features:

- Input Text Area: Simple text area to input or paste long notes or paragraphs.
- AI Summarization: Send the note to Gemini AI to generate a concise summary. The AI tool will use reasoning to incorporate key pieces of information in the summary.
- Summary Display: Display the original note and the generated summary side-by-side.
- Download Summary: Allow users to download the summary as a text file.

## Style Guidelines:

- Primary color: Neutral gray (#F5F5F5) for a clean background.
- Secondary color: White (#FFFFFF) for content containers.
- Accent: Teal (#008080) for buttons and interactive elements.
- Responsive layout that adapts to different screen sizes.
- Use a simple, single-column layout for easy navigation.
- Use minimalist icons for actions like 'Summarize' and 'Download'.
- Subtle fade-in animations when displaying the summary.

## Original User Request:
Create a full-stack web app called 'Smart Note Summarizer' using Firebase. The app should allow users to input a long note or paragraph, send it to Gemini AI to generate a short summary, and store both the original and summary in Firestore. Use Firebase Authentication for user login (email/password), Firestore for storing notes, and deploy the frontend with Firebase Hosting. UI should be simple and responsive using React. Include cloud functions for calling the Gemini API securely. Also ensure that each user sees only their saved notes.
  