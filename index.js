require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
const app = express();
const port = 3000;
const cacheFilePath = path.join(__dirname, "spreadsheetCache.json");

app.use(express.static("public"));

function readCache() {
  try {
    const data = fs.readFileSync(cacheFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading cache:", err);
    return null;
  }
}

function writeCache(data) {
  const cacheData = {
    timestamp: Date.now(),
    data: data,
  };
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing cache:", err);
  }
}

async function accessSpreadsheet(spreadsheetId, ignoreCache = false) {
  const cache = readCache();
  const cacheDuration = 1000 * 60 * 60; // 1 hour in milliseconds

  // Check if cache exists and is not outdated, and ignoreCache flag is not set
  if (cache && Date.now() - cache.timestamp < cacheDuration && !ignoreCache) {
    console.log("Using cached data");
    return cache.data;
  }

  const client = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth: client });
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  let data = {};

  for (const month of months) {
    console.log(`Processing data for ${month}...`);
    const range = `${month}!A3:M`;

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (rows && rows.length) {
        data[month] = rows
          .map((row) => {
            if (row.length === 0 || row[0] === "") {
              return null;
            }
            return {
              who: row[0],
              income: row[1],
              spent: parseFloat(row[2]) || 0,
              currency: row[3],
              concept: row[4],
              accountName: row[5],
              accountBalance: row[6],
              date: row[7],
              notes: row[8],
              valeSavings: row[9],
              exchangeRate: row[10],
              joseTotalSavings: row[11],
              joseMonthSavings: row[12],
            };
          })
          .filter((row) => row !== null);
      } else {
        console.log(`No data found for ${month}.`);
      }
    } catch (error) {
      console.log(`Error fetching data for ${month}:`, error.response.data);
    }
  }

  // After successfully fetching data, write it to cache
  writeCache(data);

  return data;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/data", async (req, res) => {
  const spreadsheetId = req.query.sheetId;
  const ignoreCache = req.query.ignoreCache === "true"; // Convert query parameter to boolean

  if (!spreadsheetId) {
    return res.status(400).send("sheetId query parameter is required");
  }

  try {
    console.log("Fetching data for spreadsheet", spreadsheetId, "...");
    const data = await accessSpreadsheet(spreadsheetId, ignoreCache);
    console.log(
      "Processed data for spreadsheet",
      spreadsheetId,
      ", returning response to client"
    );
    res.json(data);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Client app listening at http://localhost:${port}`);
});
