"use client";
import { use, useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Zap } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";

/* ─── Typing indicator (AI is thinking) ──────────────────────────────────── */
function AITyping() {
  return (
    // Same container as Bubble — maxWidth 760, margin auto, full width, row-direction
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 10,
      flexDirection: "row",              // same as assistant bubble
      maxWidth: 760, margin: "0 auto",   // same as Bubble
      width: "100%",
    }}>
      {/* Avatar — identical to assistant bubble */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Bot size={16} color="var(--blue)" />
      </div>

      {/* Bubble */}
      <div style={{
        padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", display: "inline-block" }} />
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", display: "inline-block" }} />
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", display: "inline-block" }} />
        <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 2 }}>Gemini is thinking…</span>
      </div>
    </div>
  );
}

/* ─── Step line ───────────────────────────────────────────────────────────── */
function Step({ text, idx }: { text: string; idx: number }) {
  return (
    <div className="fade-up" style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 11, color: "var(--text-3)",
      animationDelay: `${idx * 0.1}s`,
    }}>
      <Sparkles size={10} color="var(--violet)" style={{ flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  );
}

/* ─── Single message bubble ───────────────────────────────────────────────── */
function Bubble({ msg }: { msg: any }) {
  const isUser = msg.role === "user";
  const isOptimistic = String(msg._id || msg.id || "").startsWith("optimistic-");
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="fade-up" style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      flexDirection: isUser ? "row-reverse" : "row",
      maxWidth: 760,
      margin: "0 auto",
      width: "100%",
      opacity: isOptimistic ? 0.75 : 1,
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "var(--grad)" : "rgba(59,130,246,0.15)",
        border: isUser ? "none" : "1px solid rgba(59,130,246,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isUser ? <User size={15} color="#fff" /> : <Bot size={15} color="var(--blue)" />}
      </div>

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 5, maxWidth: "78%",
      }}>
        {/* Steps (assistant only) */}
        {!isUser && msg.steps && msg.steps.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4, paddingLeft: 2 }}>
            {msg.steps.map((s: string, i: number) => <Step key={i} text={s} idx={i} />)}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: "11px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? "var(--grad)" : "var(--bg-card)",
          color: isUser ? "#fff" : "var(--text-1)",
          border: isUser ? "none" : "1px solid var(--border)",
          fontSize: 14, lineHeight: 1.7,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}>
          {msg.content}
        </div>

        {/* Time + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {time && <span style={{ fontSize: 10, color: "var(--text-3)" }}>{time}</span>}
          {isOptimistic && <span style={{ fontSize: 10, color: "var(--text-3)" }}>Sending…</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Suggested prompts (shown when conversation is empty) ────────────────── */
const SUGGESTIONS = [
  "How can I check my recent Shopify orders?",
  "What integrations are currently active?",
  "Give me a summary of my CRM records",
  "How do I update my product configuration?",
];

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ChatPage({
  params,
}: {
  params: Promise<{ slug: string; conversationId?: string[] }>;
}) {
  const { slug, conversationId: convIdArr } = use(params);
  // Guard against "/chat/undefined" — treat missing/invalid ID as no conversation
  const rawId = convIdArr?.[0];
  const conversationId = rawId && rawId !== "undefined" && rawId.length > 10 ? rawId : undefined;

  const { data: messages = [], isLoading } = useMessages(slug, conversationId ?? "");
  const sendMsg = useSendMessage(slug);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMsg.isPending]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [input]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMsg.isPending || !conversationId) return;
    const content = input.trim();
    setInput("");
    sendMsg.mutate({ conversationId, content });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    if (!conversationId) return;
    sendMsg.mutate({ conversationId, content: text });
  };

  /* ── No conversation selected ── */
  if (!conversationId) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg-base)", padding: "40px 24px", textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, marginBottom: 20,
          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bot size={30} color="var(--blue)" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Start a conversation</h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28, maxWidth: 340 }}>
          Select an existing chat from the sidebar, or click <b>New Chat</b> to begin.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 460, width: "100%" }}>
          {SUGGESTIONS.map(s => (
            <div key={s} style={{
              padding: "10px 14px", borderRadius: 10, textAlign: "left",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              fontSize: 12, color: "var(--text-2)",
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <Zap size={11} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "var(--bg-base)", overflow: "hidden",
      height: "100%",
    }}>

      {/* ── Messages scroll area ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            paddingTop: 80, textAlign: "center", gap: 10,
          }}>
            <Sparkles size={26} color="var(--violet)" />
            <p style={{ fontSize: 15, fontWeight: 600 }}>Conversation is empty</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
              Send a message below to get started
            </p>
            {/* Clickable suggestions to start */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 460, width: "100%" }}>
              {SUGGESTIONS.map(s => (
                <button key={s}
                  onClick={() => handleSuggestion(s)}
                  disabled={sendMsg.isPending}
                  style={{
                    padding: "10px 14px", borderRadius: 10, textAlign: "left",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    fontSize: 12, color: "var(--text-2)", cursor: "pointer",
                    display: "flex", alignItems: "flex-start", gap: 8,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                  }}>
                  <Zap size={11} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {(messages as any[]).map((msg: any) => {
              // handle both _id (lean) and id (toJSON transform)
              const key = msg._id ?? msg.id ?? Math.random().toString();
              return <Bubble key={String(key)} msg={msg} />;
            })}
            {/* AI typing indicator shows while waiting for Gemini response */}
            {sendMsg.isPending && <AITyping />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: "12px 24px 16px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <form onSubmit={handleSend} style={{
          display: "flex", alignItems: "center", gap: 10,
          maxWidth: 700, margin: "0 auto",
          background: "var(--bg-card)",
          border: `1px solid ${input.trim() ? "rgba(59,130,246,0.5)" : "var(--border-hi)"}`,
          borderRadius: 12, padding: "10px 10px 10px 16px",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything…"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text-1)", fontFamily: "inherit",
              fontSize: 14, lineHeight: 1.55,
              resize: "none", maxHeight: 120, minHeight: 22,
              padding: 0,
            }}
          />
          <button type="submit"
            disabled={!input.trim() || sendMsg.isPending}
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: input.trim() && !sendMsg.isPending ? "var(--grad)" : "var(--bg-hover)",
              border: "none",
              cursor: input.trim() && !sendMsg.isPending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
            }}>
            {sendMsg.isPending
              ? <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} />
              : <Send size={14} color={input.trim() ? "#fff" : "var(--text-3)"} />}
          </button>
        </form>

        {/* Hint text — below the input box, centered */}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
          {sendMsg.isError
            ? <span style={{ color: "#fca5a5" }}>⚠ {(sendMsg.error as Error)?.message ?? "Failed to send"}</span>
            : <>Enter to send &nbsp;·&nbsp; Shift+Enter for new line &nbsp;·&nbsp; Gemini 2.5 Flash</>}
        </p>
      </div>
    </div>
  );
}
