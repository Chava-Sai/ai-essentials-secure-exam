/**
 * Secure Exam — Google Sheet backend (Google Apps Script Web App)
 *
 * SETUP (one time):
 *  1. Create a new Google Sheet. Copy its ID from the URL
 *     (https://docs.google.com/spreadsheets/d/THIS_PART/edit).
 *  2. Open https://script.new , delete the starter code, paste this whole file.
 *  3. Put the Sheet ID below in SHEET_ID.
 *  4. Click Deploy ▸ New deployment ▸ type "Web app".
 *       - Execute as:  Me
 *       - Who has access:  Anyone
 *     Click Deploy, approve permissions, and COPY the Web app URL.
 *  5. Paste that URL into index.html  ->  CONFIG.appsScriptUrl
 *
 * Each exam submission becomes one row. A second tab "Violations" logs every
 * tab-switch / fullscreen-exit event for review.
 */

var SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);

    // ----- main responses tab -----
    var sheet = ss.getSheetByName("Responses") || ss.insertSheet("Responses");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Submitted At", "Name", "Roll", "Section",
        "Score", "Total", "Percent", "Time (sec)",
        "Auto Submitted", "Violations", "Question IDs", "Exam"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
    }
    sheet.appendRow([
      data.submittedAt, data.name, data.roll, data.section,
      data.score, data.total, data.percent, data.timeTakenSec,
      data.autoSubmitted ? "YES" : "no", data.violationCount,
      (data.questionIds || []).join(","), data.examTitle
    ]);

    // ----- violations detail tab -----
    if (data.violations && data.violations.length) {
      var vs = ss.getSheetByName("Violations") || ss.insertSheet("Violations");
      if (vs.getLastRow() === 0) {
        vs.appendRow(["Time", "Name", "Roll", "Type", "On Question #"]);
        vs.getRange(1, 1, 1, 5).setFontWeight("bold");
      }
      data.violations.forEach(function (v) {
        vs.appendRow([v.time, data.name, data.roll, v.type, v.q]);
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Secure Exam endpoint is live.");
}
