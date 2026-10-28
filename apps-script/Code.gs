/**
 * Google Apps Script для анкеты гостя.
 *
 * 1. Создайте Google Таблицу.
 * 2. Расширения → Apps Script.
 * 3. Удалите код по умолчанию и вставьте этот файл целиком.
 * 4. Сохраните, затем «Развернуть» → «Новое развёртывание» → тип «Веб-приложение»:
 *    - Выполнять от имени: меня
 *    - У кого есть доступ: все
 * 5. Скопируйте URL, который заканчивается на /exec.
 * 6. Вставьте его в project/js/config.js → rsvp.googleAppsScriptUrl
 */

const SHEET_NAME = "RSVP";
const HEADERS = ["Дата и время", "Имя", "Присутствие", "Напитки", "Комментарий"];

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    data.submittedAt ? new Date(data.submittedAt) : new Date(),
    data.fullName || "",
    data.attendance || "",
    data.drinksText || "",
    data.comment || "",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doGet() {
  return ContentService.createTextOutput("RSVP endpoint is ready");
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}
