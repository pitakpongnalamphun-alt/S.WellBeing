/**
 * Tiny CSV helpers for the admin export buttons. The BOM prefix makes Thai
 * text open correctly in Excel (which otherwise guesses the wrong encoding).
 */

/** U+FEFF written via charCode so no editor/encoding pass can mangle it. */
const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    let s = String(v ?? "");
    // Formula-injection guard (CWE-1236): exported cells can contain text a
    // STUDENT typed (e.g. a contact name in the audit trail). A leading
    // = + - @ or tab would make Excel evaluate the cell as a formula, so
    // neutralise it with a leading apostrophe — Excel shows it as plain text.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return BOM + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
