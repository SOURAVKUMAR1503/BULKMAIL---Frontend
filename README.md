# 📧 BulkMail — Bulk Email Sending Application

BulkMail is a web application that allows users to send emails to multiple recipients from a single interface. Users can manually enter email addresses or upload an Excel/CSV file containing recipient addresses.

## 🚀 Live Demo

- **Frontend:** [BulkMail Frontend](https://bulkmail-frontend-mvlb-3w77675b7-sourav-43a2.vercel.app/)
- **Backend:** [BulkMail Backend](https://bulkmail-backend-9r52-jh2zobs5x-sourav-43a2.vercel.app/)

## ✨ Features

- Send emails to multiple recipients.
- Upload recipient email addresses from Excel and CSV files.
- Manually enter email addresses.
- Automatically detect and validate email addresses.
- Remove duplicate email addresses.
- Send email messages using Nodemailer and Gmail.
- Store email account credentials in MongoDB.
- Display success and error messages.
- Deploy frontend and backend using Vercel.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Axios
- XLSX
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- Nodemailer
- Mongoose

**Database**
- MongoDB Atlas

**Deployment**
- Vercel


## 🌐 Deployment

### Frontend Deployment

1. Push the frontend code to GitHub.
2. Import the repository into Vercel.
3. Configure the project build settings.
4. Deploy the application.

### Backend Deployment

1. Push the backend code to GitHub.
2. Import the backend repository into Vercel.
3. Configure the project root directory and function routing.
4. Add `MONGODB_URI` under **Settings → Environment Variables**.
5. Redeploy after changing environment variables.

## 🔐 Security Notes

- Never upload database passwords, Gmail passwords, or API secrets to GitHub.
- Keep `MONGODB_URI` in environment variables.
- Use a Gmail App Password when required.
- Restrict MongoDB Atlas network access whenever possible.
- Send emails only to appropriate recipients and respect consent and unsubscribe requirements.
- Follow your email provider's sending limits and anti-spam policies.

## 🔮 Future Enhancements

- Email subject customization.
- HTML email templates.
- Email delivery reports.
- Scheduled email campaigns.
- Recipient groups and contact management.
- Improved error reporting and retry handling.

## 👨‍💻 Author

**Sourav Kumar**

Built with React, Node.js, Express.js, MongoDB Atlas, and Nodemailer.

---

⭐ If you find this project useful, consider giving the repository a star!
