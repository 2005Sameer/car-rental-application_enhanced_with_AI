import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { AiService } from "../services/ai.js";

const GREETING = { role: "assistant", content: "Hey, I'm Riley — Ridgeline's booking assistant. Ask me about vehicles, pricing, or locations." };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await AiService.chat(next);
      setMessages(m => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I hit a snag — try asking again in a moment." }]);
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

  return (
    <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 100 }}>
      {open && (
        <div
          className="card"
          style={{
            width: 340, height: 440, display: "flex", flexDirection: "column", marginBottom: 12,
            boxShadow: "0 20px 48px rgba(0,0,0,0.45)", transformOrigin: "bottom right",
            animation: "scaleIn 0.28s var(--ease) both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--edge)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} style={{ color: "var(--accent)" }} />
              <span className="disp" style={{ fontSize: 16 }}>Riley — Ridgeline AI</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="btn-ghost"
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", borderRadius: 999, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s var(--ease), color 0.2s var(--ease)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--panel-2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "linear-gradient(135deg, var(--accent-bright), var(--accent))" : "var(--panel-2)",
                  color: m.role === "user" ? "var(--accent-ink)" : "var(--text)",
                  padding: "9px 12px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  animation: `${m.role === "user" ? "slideInRight" : "slideInLeft"} 0.25s var(--ease) both`,
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "6px 12px" }}>
                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid var(--edge)", display: "flex", gap: 8 }}>
            <div className="field-input" style={{ flex: 1 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about a car, price, or hub..."
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={send} disabled={sending} aria-label="Send message">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className={open ? "" : "chat-fab-pulse"}
        style={{
          width: 54, height: 54, borderRadius: 999, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--accent-bright), var(--accent))", color: "var(--accent-ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.35)", marginLeft: "auto",
          transition: "transform 0.25s var(--ease), box-shadow 0.25s var(--ease)",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
