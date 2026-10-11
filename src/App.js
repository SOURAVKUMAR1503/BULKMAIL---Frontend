import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://bulkmail-backend-9r52.vercel.app";

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  // Handle message input
  function handlemsg(event) {
    setmsg(event.target.value);
  }

  // Handle Excel file upload
  function handlefile(event) {
    const file = event.target.files[0];

    if (!file) {
      setEmailList([]);
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const emails = [
          ...new Set(
            rows
              .map((row) => String(row[0] || "").trim())
              .filter((email) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              )
          ),
        ];

        setEmailList(emails);

        if (emails.length === 0) {
          alert(
            "No valid email addresses found in the first column."
          );
        }
      } catch (error) {
        console.error("Excel file error:", error);
        alert("Unable to read this Excel file.");
        setEmailList([]);
      }
    };

    reader.onerror = function () {
      alert("Unable to open the selected file.");
      setEmailList([]);
    };

    reader.readAsArrayBuffer(file);
  }

  // Send emails through the deployed backend
  async function send() {
    if (!msg.trim()) {
      alert("Please enter an email message.");
      return;
    }

    if (emailList.length === 0) {
      alert("Please upload an Excel file containing email addresses.");
      return;
    }

    setstatus(true);

    try {
      const response = await axios.post(
        `${API_URL}/sendemail`,
        {
          msg: msg.trim(),
          emailList: emailList,
        },
        {
          timeout: 120000,
        }
      );

      if (response.data?.success === true) {
        alert(response.data.message || "Emails sent successfully!");
      } else {
        alert(
          response.data?.error ||
            response.data?.message ||
            "Email sending failed."
        );
      }
    } catch (error) {
      console.error("Axios error:", error);

      if (error.response) {
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          `Backend returned status ${error.response.status}`;

        alert("Backend error: " + message);
      } else if (error.code === "ECONNABORTED") {
        alert(
          "Request timed out. Check the backend logs to see whether email sending is still running."
        );
      } else if (error.request) {
        alert(
          "Cannot connect to backend. Check the deployment URL, backend logs, and CORS settings."
        );
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setstatus(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-blue-900 text-center">
        <h1 className="text-2xl font-medium text-white px-5 py-5">
          BulkMail
        </h1>
      </header>

      <section className="bg-blue-800 text-center">
        <h2 className="text-xl font-medium text-white px-5 py-5">
          Send emails to multiple recipients
        </h2>
      </section>

      <section className="bg-blue-600 text-center">
        <h2 className="text-xl font-medium text-white px-5 py-5">
          Upload your Excel file
        </h2>
      </section>

      <main className="bg-blue-400 flex flex-col text-black items-center px-5 py-6">
        <label
          htmlFor="email-message"
          className="w-[88%] mb-2 font-medium"
        >
          Email message
        </label>

        <textarea
          id="email-message"
          value={msg}
          onChange={handlemsg}
          className="w-[88%] h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter your email message"
        />

        <div className="w-[88%] mt-5 mb-3">
          <label
            htmlFor="excel-file"
            className="block mb-2 font-medium"
          >
            Select Excel file (.xlsx or .xls)
          </label>

          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handlefile}
            className="w-full border-2 border-dashed border-black py-4 px-4 rounded-md"
          />
        </div>

        <p className="mb-4 font-medium">
          Total emails: {emailList.length}
        </p>

        <button
          type="button"
          onClick={send}
          disabled={status}
          className="bg-blue-900 py-2 px-6 text-white font-medium rounded-md disabled:opacity-50"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </main>

      <footer className="bg-blue-200 text-center py-5">
        <p className="text-sm text-gray-700">
          BulkMail - Email campaign tool
        </p>
      </footer>
    </div>
  );
}

export default App;
