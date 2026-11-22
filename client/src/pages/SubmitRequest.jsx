import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/submit-request.css";

const printOptions = [
  ["paper_size", "Paper size", ["A4", "Letter", "Legal"]],
  ["color_mode", "Color mode", ["Black and White", "Colored"]],
  ["print_type", "Print type", ["Single-sided", "Double-sided"]],
  ["orientation", "Orientation", ["Portrait", "Landscape"]]
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP"
});

export default function SubmitRequest() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState({
    copies: 1, pages: 1, paper_size: "A4",
    color_mode: "Black and White",
    print_type: "Single-sided",
    orientation: "Portrait"
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [busy, setBusy] = useState(false);

  const change = e => setForm(current => ({
    ...current, [e.target.name]: e.target.value
  }));
  const cost = Number(form.pages) * Number(form.copies) *
    (form.color_mode === "Colored" ? 5 : 1);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;
    if (selected && selected.size > 10 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Choose a file that is 10 MB or smaller.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setMessage("");
    setFile(selected);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("document", file);
      Object.entries(form).forEach(([k,v]) => body.append(k,v));
      const { data } = await api.post("/printing", body);
      setMessageType("success");
      setMessage(`Request submitted. Your queue number is #${data.queue_number}.`);
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setMessageType("error");
      setMessage(err.response?.data?.error || "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="submit-page">
      <section className="submit-card" aria-labelledby="submit-title">
        <Link className="submit-back" to="/dashboard">
          <span aria-hidden="true">←</span> Back to Dashboard
        </Link>

        <header className="submit-heading">
          <span className="submit-eyebrow">ADNU PRINTS · NEW REQUEST</span>
          <h1 id="submit-title">Submit a print request</h1>
          <p>Upload your document, choose your print settings, and review the estimate.</p>
        </header>

        <form className="submit-form" onSubmit={submit}>
          <label className="submit-field submit-file-field">
            <span className="submit-label">Document</span>
            <input
              ref={fileInput}
              className="submit-file-input"
              type="file"
              required
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              aria-describedby="file-help"
              onChange={selectFile}
            />
            <span id="file-help" className="submit-hint">
              PDF, DOC, DOCX, JPG, or PNG · Maximum 10 MB
            </span>
          </label>

          <div className="submit-fields-grid">
            <label className="submit-field">
              <span className="submit-label">Number of pages</span>
              <input
                className="submit-control"
                type="number"
                name="pages"
                required
                min="1"
                max="1000"
                value={form.pages}
                onChange={change}
              />
            </label>

            <label className="submit-field">
              <span className="submit-label">Copies</span>
              <input
                className="submit-control"
                type="number"
                name="copies"
                required
                min="1"
                max="100"
                value={form.copies}
                onChange={change}
              />
            </label>

            {printOptions.map(([name, label, options]) => (
              <label className="submit-field" key={name}>
                <span className="submit-label">{label}</span>
                <select
                  className="submit-control submit-select"
                  name={name}
                  value={form[name]}
                  onChange={change}
                >
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="submit-summary">
            <div>
              <span>Estimated total</span>
              <strong>{currency.format(cost)}</strong>
            </div>
            <p>Final cost may be confirmed by the printing staff.</p>
          </div>

          {message && (
            <p className={`submit-message ${messageType}`} role={messageType === "error" ? "alert" : "status"}>
              {message}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={busy || !file}>
            {busy ? "Submitting request…" : "Submit print request"}
          </button>
        </form>
      </section>
    </main>
  );
}
