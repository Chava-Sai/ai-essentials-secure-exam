/**
 * Secure Exam — Google Sheet backend (Google Apps Script Web App)
 *
 * SUPER-SIMPLE SETUP (no Sheet ID needed — the script makes its own Sheet):
 *  1. Open  https://script.new   (sign in with your Google account).
 *  2. Delete the starter code and paste this WHOLE file.
 *  3. Click  Deploy ▸ New deployment ▸ (gear) Web app
 *        - Execute as:      Me
 *        - Who has access:  Anyone
 *     Click Deploy, click "Authorize access", choose your account, and on the
 *     "Google hasn't verified this app" screen click  Advanced ▸ Go to (unsafe) ▸ Allow.
 *  4. Copy the  Web app URL  and send it back.
 *
 * To find your results sheet anytime: open the Web app URL in a browser — it
 * prints a link to the auto-created "AI Essentials - Exam Responses" sheet.
 * (It is also in your Google Drive with that name.)
 */

// Returns the responses spreadsheet, creating it once and remembering it.
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* recreate below */ }
  }
  var ss = SpreadsheetApp.create('AI Essentials - Exam Responses');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet_();

    // ----- main responses tab -----
    var sheet = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submitted At', 'Name', 'Roll', 'Section',
        'Score', 'Total', 'Percent', 'Time (sec)',
        'Auto Submitted', 'Violations', 'Hints Used', 'Super Hints',
        'Question IDs', 'Exam'
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
    }
    sheet.appendRow([
      data.submittedAt, data.name, data.roll, data.section,
      data.score, data.total, data.percent, data.timeTakenSec,
      data.autoSubmitted ? 'YES' : 'no', data.violationCount,
      data.hintsUsed || 0, data.superHintsUsed || 0,
      (data.questionIds || []).join(','), data.examTitle
    ]);

    // ----- violations detail tab -----
    if (data.violations && data.violations.length) {
      var vs = ss.getSheetByName('Violations') || ss.insertSheet('Violations');
      if (vs.getLastRow() === 0) {
        vs.appendRow(['Time', 'Name', 'Roll', 'Type', 'On Question #']);
        vs.getRange(1, 1, 1, 5).setFontWeight('bold');
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

// Passcode the teacher dashboard uses to fetch results. CHANGE THIS.
var TEACHER_KEY = "aiexam2026";

// GET: dashboard data (JSONP) when action=results, else a friendly link page.
function doGet(e) {
  var p = (e && e.parameter) || {};

  if (p.action === 'results') {
    var payload;
    if (p.key !== TEACHER_KEY) {
      payload = { ok: false, error: 'Wrong passcode' };
    } else {
      var ss = getSpreadsheet_();
      var sh = ss.getSheetByName('Responses');
      payload = { ok: true, sheetUrl: ss.getUrl(), rows: sh ? sh.getDataRange().getValues() : [] };
    }
    var json = JSON.stringify(payload);
    if (p.callback) {  // JSONP — avoids cross-origin issues
      return ContentService.createTextOutput(p.callback + '(' + json + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }

  var ss2 = getSpreadsheet_();
  return HtmlService.createHtmlOutput(
    '<p>Secure Exam endpoint is live.</p>' +
    '<p>Results sheet: <a href="' + ss2.getUrl() + '" target="_blank">' + ss2.getUrl() + '</a></p>'
  );
}
