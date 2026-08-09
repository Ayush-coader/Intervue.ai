const { GoogleGenAI, Type } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const interviewReportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The job title or role summary for this interview report"
        },
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating role match percentage"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "List of technical questions with intention and recommended answer",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "List of behavioral STAR questions with intention and response framework",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of identified candidate skill gaps",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    severity: { type: Type.STRING }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "Day-by-day 7-day preparation plan",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are a world-class technical interview coach and career strategist. Your job is to generate a deeply personalised, highly actionable interview preparation report for the candidate below.

=== CANDIDATE PROFILE ===
Resume / Work History:
${resume || "N/A — use the job description and self-description to infer a plausible candidate background."}

Candidate Self-Description:
${selfDescription || "N/A"}

Target Job Description:
${jobDescription}

=== WHAT YOU MUST GENERATE ===

1. TITLE
   A concise, professional report title (e.g. "Senior Backend Engineer Interview Preparation Report").

2. MATCH SCORE (0–100)
   An honest percentage reflecting how well the candidate's current profile matches the job requirements.
   Base it on skills overlap, experience level, domain alignment, and any evident gaps.

3. TECHNICAL QUESTIONS (generate 5–8)
   For each question:
   - question: A realistic, senior-level technical question the interviewer would actually ask for THIS specific role.
   - intention: What skill, concept, or red flag the interviewer is probing (1–2 sentences, written for the candidate so they understand WHY it's asked).
   - answer: A thorough model answer the candidate should study. Include concrete examples, code concepts, trade-offs, or frameworks where relevant. Minimum 4–6 sentences.

4. BEHAVIORAL QUESTIONS (generate 4–6)
   For each question:
   - question: A real-world behavioral question tied to the responsibilities in the job description.
   - intention: The competency being assessed (e.g. "Tests your ability to manage stakeholder conflict under deadline pressure").
   - answer: A complete STAR-method answer framework tailored to the role. Include specific guidance on what Situation, Task, Action, and Result to describe. Minimum 4–6 sentences.

5. SKILL GAPS (identify 4–8)
   For each gap:
   - skill: The exact skill or competency that is missing or underdeveloped (be specific — not just "cloud" but "AWS Lambda & API Gateway for serverless workloads").
   - severity: "high" (blocker — must fix before interview), "medium" (noticeable gap, will be asked about), or "low" (minor, nice-to-have).

6. PREPARATION PLAN — 7-DAY ROADMAP
   This is the most important section. Write it as a clear, actionable day-by-day guide the candidate can follow immediately.
   Each day must have:
   - day: Day number (1–7)
   - focus: A short, motivating theme for the day (e.g. "Day 1 — System Design Foundations & Role Deep-Dive")
   - tasks: An array of 4–6 highly specific, actionable tasks. Each task string must:
     • Start with a clear ACTION verb (Study, Practice, Watch, Read, Implement, Mock, Review, Write, Build, etc.)
     • Specify EXACTLY what to do (not vague — mention specific topics, chapters, tools, or exercises)
     • Include a realistic time estimate in brackets at the end, e.g. [~45 min] or [~2 hrs]
     • Mention free resources by name where helpful (e.g. "using NeetCode 150", "via roadmap.sh", "on Firecode.io", "from MDN docs", "using ByteByteGo System Design")
     • Be written in second-person ("You should...", "Practice...", "Review your...")
   
   Day-by-day structure guidance (adapt to the role — do NOT follow this rigidly if the role demands otherwise):
   - Day 1: Role analysis + self-assessment + high-priority skill gap identification + company/team research
   - Day 2: Core technical concepts most critical to the job description (deep study)
   - Day 3: System design / architecture / scalability practice (if relevant to role)
   - Day 4: Algorithms, data structures, or domain-specific coding practice (if relevant)
   - Day 5: Behavioral question preparation + STAR story bank building + soft-skills review
   - Day 6: Full mock interview simulation (both technical + behavioral) + gap review
   - Day 7: Final revision, rest, confidence-building, logistics prep (what to bring, what to say, what to ask the interviewer)

=== QUALITY STANDARDS ===
- Every task must feel personally relevant to THIS candidate and THIS job description — not generic advice.
- The roadmap must feel like it was written by a mentor who knows the candidate and the company.
- Avoid filler phrases like "study the basics", "review general concepts", "be confident". Be specific.
- The preparation plan is the #1 thing a candidate will use daily — make it outstanding.
`

    let responseText = ""
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportResponseSchema,
            }
        })
        responseText = response.text
    } catch (err) {
        console.warn("gemini-2.5-flash failed, attempting fallback to gemini-2.0-flash...", err.message)
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportResponseSchema,
            }
        })
        responseText = response.text
    }

    const data = JSON.parse(responseText)

    // Ensure severity values match enum: low, medium, high
    if (data.skillGaps && Array.isArray(data.skillGaps)) {
        data.skillGaps = data.skillGaps.map(gap => {
            const sev = (gap.severity || "medium").toLowerCase()
            const validSeverity = ["low", "medium", "high"].includes(sev) ? sev : "medium"
            return { ...gap, severity: validSeverity }
        })
    }

    return data
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("Complete, self-contained HTML document for the resume, ready to be rendered by Puppeteer into a PDF.")
    })

    const prompt = `You are a professional resume writer and ATS (Applicant Tracking System) specialist. Generate a complete, polished, job-targeted resume in HTML that will pass ATS scanners and impress human recruiters.

=== CANDIDATE INFORMATION ===
Original Resume Text (the ONLY source of truth for all factual details — name, email, phone, work history, education, projects, skills):
${resume || "(No resume provided — build a strong resume from the self-description and job description below)"}

Candidate Self-Description / Additional Context:
${selfDescription || "(Not provided)"}

Target Job Description:
${jobDescription}

=== STEP-BY-STEP INSTRUCTIONS ===

STEP 0 — PARSE CONTACT INFO FROM RESUME TEXT:
- Extract the candidate's real full name, email, phone, city/country, LinkedIn, GitHub — exactly as they appear in the resume text.
- Place all found contact details in the header. Omit fields that are genuinely not present. Never invent contact info.

STEP 1 — KEYWORD ANALYSIS:
- Identify the top 8–12 ATS keywords from the job description (skills, tools, technologies, methodologies).
- These keywords MUST appear naturally throughout the resume — in the summary, skills section, and experience bullets.

STEP 2 — CONTENT REWRITING:
- Rewrite every experience bullet using strong action verbs + quantified outcomes:
  BEFORE: "Worked on backend APIs"
  AFTER:  "Engineered 12 RESTful microservice endpoints using Node.js and Express, reducing average response time by 35% and supporting 50K+ daily active users"
- Professional Summary: 3–4 sentences. Mention the target role by name. Highlight top 2–3 strengths. Include 2–3 ATS keywords.
- Skills section: list job-matching skills first, then supporting skills.
- Preserve ALL factual data (companies, dates, degrees) — never fabricate or omit real experience.

STEP 3 — RESUME STRUCTURE (strict ATS-safe order):
1. HEADER — candidate name + contact line
2. PROFESSIONAL SUMMARY — 3–4 punchy sentences
3. SKILLS — categorised or pipe-separated keyword list
4. PROFESSIONAL EXPERIENCE — reverse chronological, 3–5 bullets per role
5. PROJECTS — (if present) with tech stack
6. EDUCATION — degree · institution · year
7. CERTIFICATIONS — (if present)

=== ATS RULES — NON-NEGOTIABLE ===
- SINGLE-COLUMN layout only. NO multi-column CSS, NO float, NO CSS grid side-by-side, NO flexbox rows for main content.
- HTML elements allowed: html, head, body, style, div, h1, h2, h3, p, ul, li, strong, em, span. NO table, svg, canvas, img, figure, iframe.
- NO images, icons, or decorative graphics of any kind.
- Standard section labels only: "Professional Experience", "Skills", "Education", "Projects", "Certifications".
- Dates: "Month YYYY – Month YYYY" or "Month YYYY – Present".
- Bullet points: ul > li only — no custom CSS bullets, no Unicode symbols as bullets.
- Font: Arial, Helvetica Neue, or Calibri — CSS font-family only.

=== HTML & STYLING REQUIREMENTS ===
Produce a complete, self-contained HTML document (html > head > body). All CSS in a <style> tag. Use ONLY print-safe units (pt, px, mm — no vh/vw).

Apply this exact visual design:

/* Page */
@page { size: A4; margin: 16mm 20mm; }
body { font-family: 'Arial', 'Helvetica Neue', sans-serif; font-size: 10.5pt; color: #1a1a1a; background: #fff; margin: 0; padding: 0; line-height: 1.45; }

/* Header block */
.header { border-bottom: 2.5px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 14px; }
h1.candidate-name { font-size: 22pt; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; margin: 0 0 4px 0; }
.contact-line { font-size: 9pt; color: #4a5568; letter-spacing: 0.3px; }
.contact-line span { margin-right: 12px; }
.contact-line a { color: #1e3a5f; text-decoration: none; }

/* Section headings */
h2.section-title { font-size: 8.5pt; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #1e3a5f; border-bottom: 1px solid #c8d8ea; padding-bottom: 4px; margin: 16px 0 8px 0; }

/* Experience entries */
.exp-entry { margin-bottom: 12px; page-break-inside: avoid; }
.exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
.job-title { font-size: 10.5pt; font-weight: 700; color: #1a1a1a; }
.company-name { font-size: 10pt; color: #4a5568; font-style: italic; }
.date-range { font-size: 9pt; color: #718096; white-space: nowrap; }
ul.bullets { margin: 4px 0 0 16px; padding: 0; }
ul.bullets li { font-size: 10pt; margin-bottom: 3px; line-height: 1.45; color: #2d3748; }

/* Skills */
.skills-list { font-size: 10pt; line-height: 1.7; color: #2d3748; }
.skill-category { font-weight: 700; color: #1a1a1a; }

/* Education */
.edu-entry { margin-bottom: 8px; }
.degree { font-weight: 700; font-size: 10.5pt; }
.institution { color: #4a5568; font-size: 10pt; }
.grad-year { color: #718096; font-size: 9pt; }

/* Projects */
.project-entry { margin-bottom: 10px; page-break-inside: avoid; }
.project-name { font-weight: 700; color: #1e3a5f; font-size: 10.5pt; }
.tech-stack { font-size: 9pt; color: #718096; font-style: italic; }

Apply these CSS classes to the corresponding HTML elements. Generate the full resume using semantic HTML with these classes.

=== WRITING STANDARDS ===
- Tone: Confident, professional, human. Must not read as AI-generated.
- Every bullet answers: "What did I do?" + "What was the impact?"
- Forbidden phrases: "responsible for", "worked on", "helped with", "assisted", "involved in", "tasked with".

Return ONLY the JSON object with the "html" field — the complete Puppeteer-renderable HTML document.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)


    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }