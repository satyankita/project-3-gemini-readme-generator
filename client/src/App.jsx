import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

const initialForm = {
  name: "",
  description: "",
  techStack: "React, Node.js, MongoDB",
  features: "",
  installation: "npm install",
  runCommand: "npm run dev",
  github: "",
  author: "",
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [readme, setReadme] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const generateReadme = async (event) => {
    event.preventDefault();
    setError("");
    setCopied(false);

    if (!form.name.trim()) {
      setError("Please enter your project name.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5002/api/generate-readme",
        form
      );

      if (!response.data.readme) {
        throw new Error("The AI returned an empty README.");
      }

      setReadme(response.data.readme);
      setActiveTab("preview");
    } catch (err) {
      console.error("README generation failed:", err);

      setError(
        err.response?.data?.message ||
          "Could not connect to the backend. Make sure your server is running on port 5002."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyReadme = async () => {
    if (!readme) return;

    try {
      await navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please select and copy the Markdown manually.");
    }
  };

  const downloadReadme = () => {
    if (!readme) return;

    const blob = new Blob([readme], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-icon">R</span>
          <span>
            Readme<span className="brand-light">AI</span>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <button className="nav-item active" type="button">
          <span>▤</span> README Generator
        </button>

        <div className="sidebar-tip">
          <span className="tip-icon">✦</span>
          <h3>Documentation made easy</h3>
          <p>Turn your project details into a clear, professional README.</p>
        </div>

        <div className="sidebar-bottom">
          <span className="avatar">S</span>
          <div>
            <strong>My Workspace</strong>
            <small>Developer tools</small>
          </div>
        </div>
      </aside>

      <main className="main-area" id="home">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace <span>/</span> README Generator
            </div>
            <h1>README Generator</h1>
            <p className="page-subtitle">
              Create beautiful project documentation in minutes.
            </p>
          </div>
          <span className="status-pill">
            <span /> {loading ? "Generating with AI..." : "AI-powered"}
          </span>
        </header>

        <div className="workspace-grid">
          <section className="form-card">
            <div className="card-heading">
              <div className="heading-icon">✎</div>
              <div>
                <h2>Project details</h2>
                <p>Tell us a little about your project.</p>
              </div>
            </div>

            <form onSubmit={generateReadme}>
              <label htmlFor="name">
                Project name <span>*</span>
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="e.g. CampusVoice"
                required
              />

              <label htmlFor="description">Description <span>*</span></label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="What does your project do?"
                rows="3"
                required
              />

              <label htmlFor="techStack">Tech stack <span>*</span></label>
              <input
                id="techStack"
                name="techStack"
                value={form.techStack}
                onChange={updateField}
                placeholder="React, Express, MongoDB"
                required
              />
              <p className="field-hint">Separate technologies with commas.</p>

              <label htmlFor="features">Key features</label>
              <textarea
                id="features"
                name="features"
                value={form.features}
                onChange={updateField}
                placeholder={"User authentication\nMarkdown preview\nResponsive design"}
                rows="4"
              />
              <p className="field-hint">Enter one feature per line.</p>

              <div className="two-columns">
                <div>
                  <label htmlFor="installation">Install command</label>
                  <input
                    id="installation"
                    name="installation"
                    value={form.installation}
                    onChange={updateField}
                  />
                </div>
                <div>
                  <label htmlFor="runCommand">Run command</label>
                  <input
                    id="runCommand"
                    name="runCommand"
                    value={form.runCommand}
                    onChange={updateField}
                  />
                </div>
              </div>

              <label htmlFor="github">GitHub repository URL</label>
              <input
                id="github"
                name="github"
                type="url"
                value={form.github}
                onChange={updateField}
                placeholder="https://github.com/username/project"
              />

              <label htmlFor="author">Author</label>
              <input
                id="author"
                name="author"
                value={form.author}
                onChange={updateField}
                placeholder="Your name (optional)"
              />

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <button
                className="generate-button"
                type="submit"
                disabled={loading}
              >
                <span>✦</span>
                {loading ? "Generating README..." : "Generate README"}
                <span>{loading ? "…" : "→"}</span>
              </button>

              <p className="privacy-note">
                Your API key stays on the backend server.
              </p>
            </form>
          </section>

          <section className="preview-card">
            <div className="preview-header">
              <div className="preview-title">
                <div className="file-icon">M↓</div>
                <div>
                  <h2>README.md</h2>
                  <p>
                    {readme
                      ? "Generated document"
                      : "Your preview will appear here"}
                  </p>
                </div>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  onClick={copyReadme}
                  disabled={!readme}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button
                  className="download-button"
                  type="button"
                  onClick={downloadReadme}
                  disabled={!readme}
                >
                  ↓ Download
                </button>
              </div>
            </div>

            <div className="preview-tabs">
              <button
                type="button"
                className={activeTab === "preview" ? "selected" : ""}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
              <button
                type="button"
                className={activeTab === "markdown" ? "selected" : ""}
                onClick={() => setActiveTab("markdown")}
              >
                Markdown
              </button>
            </div>

            <div className="document-area">
              {!readme ? (
                <div className="empty-state">
                  <div className="empty-icon">✧</div>
                  <h3>{loading ? "Creating your README..." : "Your README starts here"}</h3>
                  <p>
                    {loading
                      ? "Gemini AI is preparing your project documentation."
                      : "Fill in your project details and click Generate README to see the result."}
                  </p>
                  <div className="empty-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : activeTab === "preview" ? (
                <article className="markdown-preview">
                  <ReactMarkdown>{readme}</ReactMarkdown>
                </article>
              ) : (
                <pre className="markdown-source">{readme}</pre>
              )}
            </div>

            <div className="preview-footer">
              <span>
                <span className="footer-dot" /> Markdown supported
              </span>
              <span>
                {readme ? `${readme.length} characters` : "Waiting for content"}
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
