import React, { useState, useRef, useEffect } from 'react'
import Navbar from '../../../components/Navbar'
import LoadingScreen from '../../../components/LoadingScreen'
import "../style/home.scss"
import { useInterview } from '../hooks/useinterview'
import { useNavigate } from 'react-router'
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X, 
  Search, 
  ArrowRight, 
  Briefcase, 
  UserCheck, 
  Target, 
  Clock, 
  TrendingUp,
  Layers
} from 'lucide-react'

function Home() {
  const { loading, generateReport, reports, getAllReports } = useInterview()
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const resumeInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    getAllReports()
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file)
      } else {
        alert("Please upload a PDF file.")
      }
    }
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""
    }
  }

  const handlegeneratereport = async () => {
    if (!jobDescription.trim() && !selectedFile) {
      alert("Please provide a job description or upload a resume to generate a report.")
      return
    }
    setGenerating(true)
    try {
      const resumeFile = selectedFile || (resumeInputRef.current?.files?.[0])
      const data = await generateReport({ resumeFile, jobDescription, selfDescription })
      if (data && data._id) {
        navigate(`/interview/${data._id}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  const filteredReports = reports?.filter(report => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      report.title?.toLowerCase().includes(query) ||
      (report.matchScore && report.matchScore.toString().includes(query))
    )
  }) || []

  return (
    <div className="home-wrapper fade-in">
      {generating && <LoadingScreen />}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Next-Gen AI Interview Intelligence</span>
        </div>
        <h1 className="hero-title gradient-text">
          Master Your Next Tech Interview
        </h1>
        <p className="hero-subtitle">
          Upload your resume and paste the target job description. Our AI analyzes skill gaps, 
          generates custom technical & behavioral questions, and crafts a day-by-day prep roadmap.
        </p>

        <div className="hero-features">
          <div className="feature-pill">
            <Target size={14} />
            <span>Skill Gap Detection</span>
          </div>
          <div className="feature-pill">
            <FileText size={14} />
            <span>Tailored Q&A Bank</span>
          </div>
          <div className="feature-pill">
            <Clock size={14} />
            <span>7-Day Prep Roadmap</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Generator Section */}
      <main className="home-main">
        <div className="interview-input-grp">
          
          {/* Step 1: Job Description */}
          <div className="step-card left-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <div className="step-title-group">
                <h3>Target Job Description</h3>
                <p>Paste the full job posting, requirements, or tech stack details</p>
              </div>
            </div>
            
            <div className="textarea-container">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                name="job_description" 
                placeholder="Paste the job description here (e.g. Senior Full Stack Engineer requiring React, Node.js, AWS...)"
              ></textarea>
              <div className="textarea-footer">
                <span className="char-count">{jobDescription.length} characters</span>
                {jobDescription && (
                  <button 
                    type="button" 
                    className="clear-btn"
                    onClick={() => setJobDescription("")}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Steps 2 & 3 */}
          <div className="step-card-group right-step">
            
            {/* Step 2: Resume PDF Uploader */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">2</span>
                <div className="step-title-group">
                  <h3>Candidate Resume (PDF)</h3>
                  <p>Upload your latest resume for AI skill profiling</p>
                </div>
              </div>

              <input 
                ref={resumeInputRef} 
                onChange={handleFileChange}
                hidden 
                type="file" 
                name='resume' 
                id='resume' 
                accept='.pdf' 
              />

              {!selectedFile ? (
                <div 
                  className={`dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <div className="dropzone-icon-wrapper">
                    <UploadCloud size={28} />
                  </div>
                  <div className="dropzone-text">
                    <span className="primary-text">Click to upload or drag & drop</span>
                    <span className="secondary-text">PDF format supported (max 10MB)</span>
                  </div>
                </div>
              ) : (
                <div className="selected-file-card">
                  <div className="file-icon-box">
                    <FileText size={22} />
                  </div>
                  <div className="file-details">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                    </span>
                  </div>
                  <div className="file-badge">
                    <CheckCircle2 size={16} />
                    <span>Ready</span>
                  </div>
                  <button type="button" className="remove-file-btn" onClick={removeFile} title="Remove file">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Self Description */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">3</span>
                <div className="step-title-group">
                  <h3>Self Description / Highlights (Optional)</h3>
                  <p>Mention specific projects, target salary range, or areas to focus</p>
                </div>
              </div>

              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                name="selfDescription" 
                className="short-textarea"
                placeholder="e.g. 3 years experience building React apps, looking to transition into senior backend roles..."
              ></textarea>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlegeneratereport}
              disabled={generating}
              className="generate-btn"
            >
              {generating ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Analyzing Profile & Generating Report...</span>
                </>
              ) : (
                <>
                  <span>Generate Interview Analytics</span>
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Recent Preparations Section */}
        <section className="reports-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <Layers className="section-icon" size={20} />
              <h2 className="section-title">Recent Preparations</h2>
              <span className="reports-count-badge">{reports?.length || 0} Saved</span>
            </div>

            {reports?.length > 0 && (
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by title or match score..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="clear-search-btn">
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="report-grid">
            {loading ? (
              // Skeleton Loader Cards
              [1, 2, 3].map((n) => (
                <div key={n} className="report-card skeleton-card">
                  <div className="skeleton-line header-skeleton"></div>
                  <div className="skeleton-line text-skeleton"></div>
                  <div className="skeleton-line text-skeleton short"></div>
                </div>
              ))
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <div
                  key={report._id || index}
                  className="report-card"
                  onClick={() => navigate(`/interview/${report._id}`)}
                >
                  <div className="card-header">
                    <h3 className="report-title">{report.title || "Interview Preparation"}</h3>
                    <span 
                      className="score-badge" 
                      style={{
                        background: report.matchScore >= 80 ? 'rgba(16, 185, 129, 0.12)' : report.matchScore >= 70 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                        color: report.matchScore >= 80 ? '#34d399' : report.matchScore >= 70 ? '#fbbf24' : '#c084fc',
                        border: report.matchScore >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' : report.matchScore >= 70 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <TrendingUp size={12} style={{ marginRight: '4px' }} />
                      {report.matchScore}% Match
                    </span>
                  </div>

                  <p className="report-meta">
                    Includes technical questions, STAR behavioral frameworks, and day-by-day roadmap.
                  </p>

                  <div className="card-footer">
                    <span className="action-link">Open Workspace</span>
                    <ArrowRight className="arrow-icon" size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-reports">
                <div className="empty-icon-box">
                  <Briefcase size={32} />
                </div>
                <h3>{searchQuery ? "No matching reports found" : "No interview preparations yet"}</h3>
                <p>
                  {searchQuery 
                    ? `No reports match your search query "${searchQuery}". Try clearing the search filter.` 
                    : "Fill out the job description and upload your resume above to create your first report!"
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Home Footer */}
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Intervue.ai — AI-Driven Interview Preparation Engine.</p>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}

export default Home