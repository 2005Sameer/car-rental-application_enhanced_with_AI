// Defense-in-depth text cleanup for anything a user typed that gets stored
// and echoed back (names, messages, chat input). React already escapes
// text nodes on the way out, so this isn't the only thing standing between
// user input and stored XSS — but a field that's ever rendered somewhere
// else (an admin tool, an email digest, a future mobile client) shouldn't
// have to re-derive this same rule.
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "") // strip control characters
    .trim()
    .slice(0, maxLength);
}
