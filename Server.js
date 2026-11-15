const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Save Report Fraud form data
app.post("/api/report", (req, res) => {
    try {
        const { name, email, fraud_type, description } = req.body;

        if (!name || !email || !fraud_type || !description) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

           const statement = db.prepare(`
            INSERT INTO fraud_reports
            (name, email, fraud_type, description)
            VALUES (?, ?, ?, ?)
        `);

        statement.run(name, email, fraud_type, description);
console.log("NEW REPORT SAVED:", { name, email, fraud_type, description });
        res.json({
            message: "Report saved successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not save report."
        });
    }
});

app.use(
  session({
    secret: "cyber-fraud-portal-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);

// Show Html.html when the main address is opened
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Html.html"));
});

// Serve existing frontend files
app.use(express.static(__dirname));

// Test the backend
app.get("/api/status", (req, res) => {
  res.json({
    message: "Cyber Fraud Awareness Portal backend is running!"
  });
});
app.get("/api/reports", (req, res) => {
    try {
        const reports = db.prepare(
            "SELECT * FROM fraud_reports ORDER BY id DESC"
        ).all();

        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load reports."
        });
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
