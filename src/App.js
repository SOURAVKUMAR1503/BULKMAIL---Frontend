
import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://bulkmail-backend-oszrstwwi-sourav-43a2.vercel.app/"

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  // Handle message input
  function handlemsg(evt) {
    setmsg(evt.target.value);
  }

  // Handle Excel file upload
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

        const workbook = XLSX.read(data, {
          type: "array"
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ""
        });

        // Read email addresses from the first column
        const totalemail = rows
          .map(function (row) {
            return String(row[0] || "").trim();
          })
          .filter(function (email) {
            return email !== "" && email.includes("@");
          });

        setEmailList(totalemail);

        console.log("Email list:", totalemail);
      } catch (error) {
        console.error("Excel file error:", error);
        alert("Unable to read this Excel file.");
        setEmailList([]);
      }
    };

    reader.onerror = function () {
      alert("Unable to open the selected file.");
    };

    reader.readAsArrayBuffer(file);
  }

  // Send emails through backend
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
        ""https://your-bulkmail-backend.vercel.app/sendemail"",
        {
          msg: msg,
          emailList: emailList
        }
      );

      if (response.data === true) {
        alert("Emails sent successfully!");
      } else {
        alert("Failed to send emails.");
      }
    } catch (error) {
      console.error("Axios error:", error.message);

      if (error.response) {
        const errorMessage =
          error.response.data?.details ||
          error.response.data?.error ||
          "Request failed";

        alert("Backend error: " + errorMessage);
      } else if (error.request) {
        alert(
          "Cannot connect to backend. Make sure your backend is running on port 5000."
        );
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setstatus(false);
    }
  }

  return (
    <div>
      <div className="bg-blue-900 text-center justify-center">
        <h1 className="text-2xl font-medium text-white px-5 py-5">
          BulkMail
        </h1>
      </div>

      <div className="bg-blue-800 text-center justify-center">
        <h1 className="text-xl font-medium text-white px-5 py-5">
          We can help your business by sending multiple emails at once
        </h1>
      </div>

      <div className="bg-blue-600 text-center justify-center">
        <h1 className="text-xl font-medium text-white px-5 py-5">
          Drag and Drop the files
        </h1>
      </div>

      <div className="bg-blue-400 flex flex-col text-black items-center px-5 py-3">
        <textarea
          value={msg}
          onChange={handlemsg}
          className="w-[88%] h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter the email text"
        />

        <div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handlefile}
            className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
          />
        </div>

        <p>Total Emails in the file: {emailList.length}</p>

        <button
          onClick={send}
          disabled={status}
          className="bg-blue-900 py-2 px-4 text-white font-medium rounded-md w-fit disabled:opacity-50"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="bg-blue-300 text-center justify-center">
        <h1 className="text-xl font-medium text-white px-5 py-5"></h1>
      </div>

      <div className="bg-blue-200 text-center justify-center">
        <h1 className="text-xl font-medium text-white px-5 py-5"></h1>
      </div>
    </div>
  );
}

export default App;
