```jsx
import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL =
  "https://bulkmail-backend-9r52-jh2zobs5x-sourav-43a2.vercel.app";

function App() {
  const [msg, setMsg] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const emails = rows
          .flat()
          .map((value) => String(value).trim())
          .filter((value) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          );

        const uniqueEmails = [...new Set(emails)];

        setEmailList(uniqueEmails);
        setEmailText(uniqueEmails.join("\n"));
        setStatus(
          uniqueEmails.length > 0
            ? `${uniqueEmails.length} email addresses loaded.`
            : "No valid email addresses found in the file."
        );
      } catch (error) {
        console.error("Excel file error:", error);
        setStatus("Unable to read the Excel file.");
      }
    };

    reader.onerror = () => {
      setStatus("Unable to open the selected file.");
    };

    reader.readAsArrayBuffer(file);
  };

  // Manually entered email addresses
  const handleEmailTextChange = (event) => {
    const value = event.target.value;
    setEmailText(value);

    const emails = value
      .split(/[\s,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    setEmailList([...new Set(emails)]);
    setStatus("");
  };

  // Send emails through backend
  const handleSendEmail = async (event) => {
    event.preventDefault();

    const cleanEmails = [
      ...new Set(
        emailText
          .split(/[\s,;]+/)
          .map((email) => email.trim())
          .filter(Boolean)
      ),
    ];

    const invalidEmails = cleanEmails.filter(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (!msg.trim()) {
      setStatus("Please enter an email message.");
      return;
    }

    if (cleanEmails.length === 0) {
      setStatus("Please enter or upload email addresses.");
      return;
    }

    if (invalidEmails.length > 0) {
      setStatus(`Invalid email address: ${invalidEmails[0]}`);
      return;
    }

    if (cleanEmails.length > 100) {
      setStatus("Maximum 100 email addresses are allowed per request.");
      return;
    }

    const confirmed = window.confirm(
      `Send this email to ${cleanEmails.length} recipient(s)?`
    );

    if (!confirmed) return;

    setLoading(true);
    setStatus("Sending emails... Please wait.");

    try {
      const response = await axios.post(
        `${API_URL}/sendemail`,
        {
          msg: msg.trim(),
          emailList: cleanEmails,
        },
        {
          timeout: 120000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success === true) {
        setStatus(
          response.data.message ||
            `Email request completed. Sent: ${response.data.sent ?? "unknown"}, failed: ${response.data.failed ?? "unknown"}.`
        );
      } else {
        setStatus(
          response.data?.message || "The backend could not send the emails."
        );
      }
    } catch (error) {
      console.error("Email sending error:", error);

      if (error.response) {
        setStatus(
          `Backend error (${error.response.status}): ${
            error.response.data?.message || "Request failed."
          }`
        );
      } else if (error.code === "ECONNABORTED") {
        setStatus("Request timed out. Check your backend logs before retrying.");
      } else {
        setStatus(
          "Unable to connect to the backend. Check the API URL and backend deployment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-blue-700">
          BulkMail
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Send emails to your recipient list
        </p>

        <form onSubmit={handleSendEmail} className="space-y-6">
          <div>
            <label
              htmlFor="emailFile"
              className="mb-2 block font-semibold text-gray-700"
            >
              Upload Excel file
            </label>

            <input
              id="emailFile"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full rounded-lg border border-gray-300 p-3"
            />

            <p className="mt-2 text-sm text-gray-500">
              Upload an Excel or CSV file containing email addresses.
            </p>
          </div>

          <div>
            <label
              htmlFor="emailList"
              className="mb-2 block font-semibold text-gray-700"
            >
              Recipient email addresses
            </label>

            <textarea
              id="emailList"
              value={emailText}
              onChange={handleEmailTextChange}
              placeholder={"example1@gmail.com\nexample2@gmail.com"}
              rows={6}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-sm text-gray-500">
              {emailList.length} email address(es) detected. Maximum 100 per
              request.
            </p>
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block font-semibold text-gray-700"
            >
              Email message
            </label>

            <textarea
              id="message"
              value={msg}
              onChange={(event) => setMsg(event.target.value)}
              placeholder="Type your email message here..."
              rows={8}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {status && (
            <div
              role="status"
              aria-live="polite"
              className="break-words rounded-lg bg-blue-50 p-4 text-sm text-blue-800"
            >
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg px-6 py-3 font-semibold text-white transition ${
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending..." : "Send Emails"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
```
