import { encryptText, decryptText } from "./crypto.js";

export function encryptMessageText(text) {
  return encryptText(text);
}

// Every controller that returns a booking (or a list of bookings) with its
// `messages` array should route the response through one of these instead
// of sending the stored record directly — otherwise ciphertext leaks out
// over the API instead of the plaintext message.
export function withDecryptedBooking(booking) {
  if (!booking) return booking;
  return {
    ...booking,
    messages: (booking.messages || []).map(m => ({ ...m, text: decryptText(m.text) })),
  };
}

export function withDecryptedBookings(bookings) {
  return (bookings || []).map(withDecryptedBooking);
}
