import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { BookingsService } from "../services/bookings.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MessageThread({ bookingId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  function load() {
    BookingsService.get(bookingId)
      .then(res => setMessages(res.booking.messages || []))
      .catch(err => setError(err.message));
  }

  useEffect(load, [bookingId]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await BookingsService.addMessage(bookingId, text);
      setMessages(res.booking.messages);
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (messages === null) return <div className="state-block" style={{ padding: 20 }}>{error || "Loading conversation..."}</div>;

  return (
    <div style={{ border: "1px solid var(--edge)", borderRadius: 8, background: "var(--panel-2)", display: "flex", flexDirection: "column", height: 280 }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: "var(--muted-2)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            No messages yet — say hello.
          </div>
        )}
        {messages.map(m => {
          const mine = m.senderId === user.id;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: mine ? "var(--accent)" : "var(--panel)",
                color: mine ? "var(--accent-ink)" : "var(--text)",
                padding: "8px 11px",
                borderRadius: 10,
                fontSize: 13.5,
              }}
            >
              {!mine && <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 2 }}>{m.senderName}</div>}
              {m.text}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid var(--edge)" }}>
        <div className="field-input" style={{ flex: 1, background: "var(--panel)" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Message..." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={send} disabled={sending} aria-label="Send message">
          <Send size={14} />
        </button>
      </div>
      {error && <div className="alert alert-error" style={{ margin: 10 }}>{error}</div>}
    </div>
  );
}
