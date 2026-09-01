# Gentle Check-In

Build a single-page hero-style mental wellness check-in website using HTML, CSS, and JavaScript. Keep it focused on one flowing page, with a calm, reassuring responsive design. Include an intro hero that says this is a private, non-diagnostic wellbeing check-in and a prominent urgent-help note (if someone may be in immediate danger, contact local emergency services or a crisis helpline). Create 7 gentle multiple-choice questions with 4 response options from Never to Nearly every day: 1) How often have you felt low, sad, or without hope? 2) How often have you had little interest or pleasure in things? 3) How often have you felt nervous, anxious, or on edge? 4) How often have you found it difficult to relax? 5) How often has poor sleep affected your day? 6) How often have you felt tired or low in energy? 7) How often have you felt isolated or without support? Show one question at a time with step count and progress bar, Back/Next controls, and require an answer before moving on. After all questions, show a compassionate completion screen and collect required full name and phone number plus a consent checkbox saying they agree to share their responses for follow-up. On submit, POST JSON to https://shakil1866.app.n8n.cloud/webhook/77b480e4-87db-4d49-8492-be50b917e738 with name, phone, answers (question text, selected response/value), submittedAt ISO timestamp. Show loading state, success confirmation, and understandable error message with retry if it fails. Do not calculate a diagnosis or label the user. Ensure accessible labels, keyboard usability, mobile layout, and no backend required.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://checkin-calmly.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4660a84a-baee-48f4-a507-115749b2d7d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
