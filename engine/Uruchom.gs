/**
 * ============================================================
 * Studio Sygnatura — AUTOMATY (Google Apps Script)
 * 1) harmonogram: codzienna kopia zapasowa na Dysk Google
 * 2) backup: JSON wszystkich zakładek do folderu SYGNATURA-Backup
 * Uruchom raz funkcję zalozHarmonogram() (po wdrożeniu).
 * ============================================================
 */

function zalozHarmonogram() {
  ScriptApp.getProjectTriggers().forEach(t => {
    try { ScriptApp.deleteTrigger(t); } catch (e) {}
  });
  ScriptApp.newTrigger('backupDzienny').timeBased().everyDays(1).atHour(3).create();
  Logger.log('Harmonogram ustawiony: backup codziennie o 03:00 (czas Google).');
}

function backupDzienny() {
  try {
    const folder = folderBackup();
    const dane = {};
    ZAKLADKI.forEach(n => {
      const sh = arkusz(n);
      dane[n] = sh.getDataRange().getValues();
    });
    const nazwa = 'SYGNATURA-backup-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.json';
    folder.createFile(nazwa, JSON.stringify(dane), MimeType.JSON);
    // retencja: 30 dni
    const pliki = folder.getFiles();
    while (pliki.hasNext()) {
      const p = pliki.next();
      if (Date.now() - p.getLastUpdated().getTime() > 30 * 24 * 3600 * 1000) p.setTrashed(true);
    }
    Logger.log('backup OK: ' + nazwa);
  } catch (err) {
    Logger.log('backup NIEUDANY: ' + err);
    try {
      MailApp.sendEmail(MAIL_STUDIO, 'SYGNATURA — backup nieudany',
        'Nocny backup nie wykonał się.\nBłąd: ' + err.message);
    } catch (e2) {}
  }
}

function folderBackup() {
  const it = DriveApp.getFoldersByName('SYGNATURA-Backup');
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder('SYGNATURA-Backup');
}
