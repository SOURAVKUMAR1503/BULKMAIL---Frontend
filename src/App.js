import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handlemsg(evt) {
    setmsg(evt.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];

    if (!file) {
      setEmailList([]);
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: "A",
          defval: "",
        });

        const emails = rows
          .map((item) => String(item.A || "").trim())
          .filter((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          );

        setEmailList(emails);

        if (emails.length === 0) {
          alert("No valid email addresses found in the first column.");
        }
      } catch (error) {
        console.error("Excel file error:", error);
        alert("Unable to read this file. Please upload a valid Excel file.");
        setEmailList([]);
      }
    };

    reader.onerror = function () {
      alert("Unable to read the selected file.");
      setEmailList([]);
    };

    reader.readAsArrayBuffer(file);
  }

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
        "https://bulkmail-backend-one-omega.vercel.app/sendemail",
        {
          msg: msg,
          emailList: emailList,
        }
      );

      if (response.data === "success") {
        alert("Email sent successfully!");
      } else {
        alert("The server did not confirm that the email was sent.");
      }
    } catch (error) {
      console.error("Email sending error:", error);

      if (error.response) {
        alert("Server error: " + error.response.status);
      } else {
        alert("Unable to connect to the backend. Please try again.");
      }
    } finally {
      setstatus(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-4">
          BulkMail
        </h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="font-medium px-5 py-4">
          We can help your business by sending multiple emails at once
        </h1>
      </div>

      <div className="bg-blue-600 text-white text-center">
        <h1 className="font-medium px-5 py-4">
          Upload your email list and compose your message
        </h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-8">
        <textarea
          onChange={handlemsg}
          value={msg}
          className="w-[90%] max-w-3xl h-40 py-3 px-3 outline-none border border-black rounded-md"
          placeholder="Enter your email message..."
        />

        <div className="mt-5 mb-5">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handlefile}
            className="border-2 border-dashed border-blue-950 bg-white py-4 px-4 rounded-md max-w-full"
          />
        </div>

        <p className="font-medium mb-4">
          Total valid emails in file: {emailList.length}
        </p>

        <button
          onClick={send}
          disabled={status}
          className="bg-blue-950 hover:bg-blue-900 disabled:opacity-60 py-3 px-8 text-white font-medium rounded-md"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="bg-blue-300 text-center p-6 text-blue-950">
        <p>Simple. Fast. BulkMail.</p>
      </div>
    </div>
  );
}

export default App;
