import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useInterview } from '../hooks/useinterview'
import Navbar from '../../../components/Navbar'
import "../style/interview.scss"
import { 
  Code2, 
  MessageSquare, 
  Map, 
  Download, 
  ChevronDown, 
  Check, 
  Copy, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  FileText,
  X
} from 'lucide-react'

function Interview() {
  const { _id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { report, setReport, loading, getreportbyId, setLoading, getResumePdf } = useInterview()

  const [activeTab, setActiveTab] = useState("technical") // 'technical', 'behavioral', 'roadmap'
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [questionSearch, setQuestionSearch] = useState("")
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // Interactive checklist state for the roadmap tasks
  const [checkedTasks, setCheckedTasks] = useState(() => {
    const saved = localStorage.getItem(`roadmap_checked_${_id || 'default'}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  useEffect(() => {
    const fetchReport = async () => {
      try {
        await getreportbyId(_id)
      } catch (err) {
        console.warn("Failed to fetch report from server", err)
      }
    }

    if (_id && _id !== "test-report-id" && _id !== "test") {
      fetchReport()
    } else {
      setReport(null)
      setLoading(false)
    }
  }, [_id])

  const toggleTask = (dayNum, taskIndex) => {
    const taskKey = `${dayNum}_${taskIndex}`
    const newChecked = new Set(checkedTasks)
    if (newChecked.has(taskKey)) {
      newChecked.delete(taskKey)
    } else {
      newChecked.add(taskKey)
    }
    setCheckedTasks(newChecked)
    localStorage.setItem(`roadmap_checked_${_id || 'default'}`, JSON.stringify([...newChecked]))
  }

  const toggleQuestion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleCopyQuestion = (e, qText, answerText, idx) => {
    e.stopPropagation()
    const content = `Question: ${qText}\n\nKey Points / Answer: ${answerText}`
    navigator.clipboard.writeText(content)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      await getResumePdf(_id)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Calculate roadmap progress
  const totalRoadmapTasks = report?.preparationPlan?.reduce((acc, plan) => acc + (plan.task?.length || 0), 0) || 0
  const completedRoadmapTasks = checkedTasks.size
  const roadmapProgressPercent = totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100) : 0

  if (loading || !report) {
    return (
      <div className="report-container fade-in">
        <Navbar showBackBtn={true} />
        <main className="report-main loading-center">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Enhancing your resume 📃...</p>
          </div>
        </main>
      </div>
    )
  }

  // Filter questions based on search input
  const filterQuestions = (questions) => {
    if (!questionSearch.trim()) return questions || []
    const query = questionSearch.toLowerCase()
    return (questions || []).filter(
      q => q.question?.toLowerCase().includes(query) || q.answer?.toLowerCase().includes(query)
    )
  }

  const technicalList = filterQuestions(report.technicalQuestions)
  const behavioralList = filterQuestions(report.behavioralQuestions)

  return (
    <div className="report-container fade-in">
      <Navbar showBackBtn={true} />

      {/* Main dashboard content dividing into 3 columns */}
      <main className="report-main">
        <div className="dashboard-grid">

          {/* Left Column: Navigation Sidebar & Match Score */}
          <aside className="column-left">
            <div className="sidebar-group">
              <h4 className="sidebar-title">Preparation Views</h4>
              <nav className="nav-menu">
                <button
                  className={`nav-menu-item ${activeTab === 'technical' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('technical'); setExpandedIndex(null); }}
                >
                  <Code2 size={18} className="menu-icon" />
                  <span>Technical Questions</span>
                  {report.technicalQuestions?.length > 0 && (
                    <span className="count-tag">{report.technicalQuestions.length}</span>
                  )}
                </button>

                <button
                  className={`nav-menu-item ${activeTab === 'behavioral' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('behavioral'); setExpandedIndex(null); }}
                >
                  <MessageSquare size={18} className="menu-icon" />
                  <span>Behavioral Questions</span>
                  {report.behavioralQuestions?.length > 0 && (
                    <span className="count-tag">{report.behavioralQuestions.length}</span>
                  )}
                </button>

                <button
                  className={`nav-menu-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('roadmap'); setExpandedIndex(null); }}
                >
                  <Map size={18} className="menu-icon" />
                  <span>Road Map</span>
                  <span className="count-tag">{roadmapProgressPercent}%</span>
                </button>
              </nav>
            </div>

            {/* Radial Match Score Widget */}
            <div className="match-score-card">
              <div className="score-widget-top">
                <div className="radial-progress-wrapper">
                  <svg className="radial-svg" viewBox="0 0 100 100">
                    <circle 
                      className="radial-bg" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                    />
                    <circle 
                      className="radial-fill" 
                      cx="50" 
                      cy="50" 
                      r="40"
                      style={{
                        strokeDasharray: 251.2,
                        strokeDashoffset: 251.2 - (251.2 * report.matchScore) / 100,
                        stroke: report.matchScore >= 80 ? '#10b981' : report.matchScore >= 70 ? '#f59e0b' : '#8b5cf6'
                      }} 
                    />
                  </svg>
                  <div className="radial-text">
                    <span className="score-val">{report.matchScore}%</span>
                  </div>
                </div>

                <div className="score-info">
                  <span className="score-label">Role Alignment</span>
                  <span className="score-desc" style={{
                    color: report.matchScore >= 80 ? '#34d399' : report.matchScore >= 70 ? '#fbbf24' : '#c084fc'
                  }}>
                    {report.matchScore >= 80 ? "Strong Fit" : report.matchScore >= 70 ? "Good Alignment" : "Moderate Alignment"}
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="download-pdf-btn" 
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Preparing Resume PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Resume PDF</span>
                </>
              )}
            </button>
          </aside>

          {/* Middle Column: Active Tab Content Area */}
          <section className="column-middle">
            <div className="tab-content">

              {/* 1. Technical Questions Tab Content */}
              {activeTab === 'technical' && (
                <div className="content-view fade-in">
                  <div className="content-view-header">
                    <div>
                      <h2>Technical Questions Bank</h2>
                      <p>Tailored based on job requirements and candidate skill gap analysis.</p>
                    </div>

                    <div className="search-filter-box">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search technical questions..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                      />
                      {questionSearch && (
                        <button onClick={() => setQuestionSearch("")} className="clear-search">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="questions-list">
                    {technicalList.length > 0 ? (
                      technicalList.map((q, idx) => (
                        <div
                          key={idx}
                          className={`question-accordion-card ${expandedIndex === idx ? 'expanded' : ''}`}
                          onClick={() => toggleQuestion(idx)}
                        >
                          <div className="question-card-header">
                            <span className="question-index">Q{idx + 1}</span>
                            <p className="question-text">{q.question}</p>
                            <div className="card-header-actions">
                              <button 
                                className={`copy-btn ${copiedIndex === idx ? 'copied' : ''}`}
                                onClick={(e) => handleCopyQuestion(e, q.question, q.answer, idx)}
                                title="Copy question & answer"
                              >
                                {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                              </button>
                              <ChevronDown className="caret-icon" size={18} />
                            </div>
                          </div>

                          {expandedIndex === idx && (
                            <div className="question-card-body" onClick={(e) => e.stopPropagation()}>
                              {q.intension && (
                                <div className="info-block intent-block">
                                  <h5>Interviewer Intent</h5>
                                  <p>{q.intension}</p>
                                </div>
                              )}
                              <div className="info-block answer-block">
                                <h5>Recommended Technical Response Points</h5>
                                <p>{q.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-search-state">
                        <p>No technical questions match "{questionSearch}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Behavioral Questions Tab Content */}
              {activeTab === 'behavioral' && (
                <div className="content-view fade-in">
                  <div className="content-view-header">
                    <div>
                      <h2>Behavioral & Situational Questions</h2>
                      <p>Scenarios evaluated against soft skills, teamwork, and problem-solving framework.</p>
                    </div>

                    <div className="search-filter-box">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search behavioral questions..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                      />
                      {questionSearch && (
                        <button onClick={() => setQuestionSearch("")} className="clear-search">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="questions-list">
                    {behavioralList.length > 0 ? (
                      behavioralList.map((q, idx) => (
                        <div
                          key={idx}
                          className={`question-accordion-card ${expandedIndex === idx ? 'expanded' : ''}`}
                          onClick={() => toggleQuestion(idx)}
                        >
                          <div className="question-card-header">
                            <span className="question-index">Q{idx + 1}</span>
                            <p className="question-text">{q.question}</p>
                            <div className="card-header-actions">
                              <button 
                                className={`copy-btn ${copiedIndex === idx ? 'copied' : ''}`}
                                onClick={(e) => handleCopyQuestion(e, q.question, q.answer, idx)}
                                title="Copy question & answer"
                              >
                                {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                              </button>
                              <ChevronDown className="caret-icon" size={18} />
                            </div>
                          </div>

                          {expandedIndex === idx && (
                            <div className="question-card-body" onClick={(e) => e.stopPropagation()}>
                              {q.intension && (
                                <div className="info-block intent-block">
                                  <h5>Interviewer Intent</h5>
                                  <p>{q.intension}</p>
                                </div>
                              )}
                              <div className="info-block answer-block">
                                <h5>Suggested Response (STAR Method)</h5>
                                <p>{q.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-search-state">
                        <p>No behavioral questions match "{questionSearch}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Road Map (7-Day Sprint) Content */}
              {activeTab === 'roadmap' && (
                <div className="content-view fade-in">
                  <div className="content-view-header">
                    <div>
                      <h2>7-Day Preparation Road Map</h2>
                      <p>Structured daily plan to cover identified skill gaps and interview fundamentals.</p>
                    </div>

                    <div className="roadmap-progress-badge">
                      <CheckCircle2 size={16} />
                      <span>{completedRoadmapTasks} of {totalRoadmapTasks} Tasks Done</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="roadmap-progress-bar-bg">
                    <div 
                      className="roadmap-progress-bar-fill" 
                      style={{ width: `${roadmapProgressPercent}%` }}
                    ></div>
                  </div>

                  <div className="roadmap-timeline">
                    {report.preparationPlan?.map((plan, dayIdx) => (
                      <div key={dayIdx} className="roadmap-day-card">
                        <div className="day-card-header">
                          <span className="day-badge">Day {plan.day}</span>
                          <h4 className="day-focus">{plan.focus}</h4>
                        </div>

                        <ul className="day-tasks-list">
                          {plan.task?.map((t, taskIdx) => {
                            const taskKey = `${plan.day}_${taskIdx}`
                            const isChecked = checkedTasks.has(taskKey)
                            return (
                              <li
                                key={taskIdx}
                                className={`task-item ${isChecked ? 'completed' : ''}`}
                                onClick={() => toggleTask(plan.day, taskIdx)}
                              >
                                <div className={`task-checkbox ${isChecked ? 'checked' : ''}`}>
                                  {isChecked && <Check size={12} strokeWidth={3} />}
                                </div>
                                <span className="task-text">{t}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Right Column: Skill Gaps Panel */}
          <aside className="column-right">
            <div className="skill-gaps-panel">
              <div className="gaps-header">
                <AlertCircle size={16} className="gaps-icon" />
                <h4 className="skills-title">Identified Skill Gaps</h4>
              </div>
              <p className="gaps-subtext">Topics to review prioritized by severity impact</p>

              <div className="skills-tags-container">
                {report.skillGaps?.map((gap, idx) => (
                  <div
                    key={idx}
                    className={`skill-tag-pill severity-${gap.severity?.toLowerCase() || 'medium'}`}
                  >
                    <div className="pill-top">
                      <span className="tag-name">{gap.skill}</span>
                      <span className="tag-pulse"></span>
                    </div>
                    <span className="tag-badge">{gap.severity} Priority</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

export default Interview
