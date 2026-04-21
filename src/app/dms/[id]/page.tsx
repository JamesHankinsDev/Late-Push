"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  getConversation,
  listMessages,
  reportMessage,
  sendMessage,
} from "@/lib/sources/conversations";
import { block } from "@/lib/sources/blocks";
import { getFriendship } from "@/lib/sources/friendships";
import { computeTrustLevel } from "@/lib/social/friendship";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import {
  Conversation,
  DmMessage,
  MessageFlag,
  TrustLevel,
} from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const TRUST_LABEL: Record<TrustLevel, string> = {
  stranger: "STRANGER",
  friend: "FRIEND",
  trusted: "TRUSTED FRIEND",
};
const TRUST_TONE: Record<TrustLevel, "outline" | "yellow" | "mint"> = {
  stranger: "outline",
  friend: "yellow",
  trusted: "mint",
};

const FLAG_LABEL: Record<MessageFlag, string> = {
  safe: "",
  pii_ask: "ASKED FOR PERSONAL INFO",
  platform_move: "TRIED TO MOVE OFF LATE PUSH",
  pressure: "PRESSURE TACTIC",
  harassment: "HARASSMENT",
  hate_speech: "HATE SPEECH",
  explicit: "EXPLICIT",
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const { profile } = useAuthContext();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [trust, setTrust] = useState<TrustLevel>("stranger");
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [softWarning, setSoftWarning] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const c = await getConversation(params.id);
      setConv(c);
      if (c) {
        const msgs = await listMessages(params.id);
        setMessages(msgs);
        const f = await getFriendship(c.userA, c.userB);
        const synthetic = f
          ? { ...f, messageCount: c.messageCount }
          : null;
        setTrust(computeTrustLevel(synthetic));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load thread.");
    } finally {
      setLoading(false);
    }
  }, [profile, params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Scroll to bottom when messages change
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function doSend(override: boolean) {
    if (!profile || !conv || sending) return;
    setError("");
    setSending(true);
    try {
      const result = await sendMessage({
        conversation: conv,
        sender: {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        },
        senderSpotNames: profile.homeSpotName ? [profile.homeSpotName] : [],
        body,
        override,
      });
      if (result.decision.action === "block") {
        setError(result.decision.reason);
        setSoftWarning(null);
        return;
      }
      if (result.decision.action === "warn") {
        setSoftWarning(result.decision.reason);
        return;
      }
      setSoftWarning(null);
      setBody("");
      if (result.message) {
        setMessages((prev) => [...prev, result.message as DmMessage]);
      }
      // Pull fresh conv to update lastMessage + messageCount
      const fresh = await getConversation(params.id);
      if (fresh) setConv(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send.");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doSend(false);
  }

  async function handleReport(m: DmMessage) {
    if (!profile) return;
    if (!confirm("Report this message? Our team will review it.")) return;
    try {
      await reportMessage({
        reporterUid: profile.uid,
        message: m,
      });
      alert("Thanks — reported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't report.");
    }
  }

  async function handleBlock() {
    if (!profile || !conv) return;
    const otherUid =
      conv.userA === profile.uid ? conv.userB : conv.userA;
    if (
      !confirm(
        "Block this user? They'll be hidden from your Nearby, can't DM you, and their messages will disappear from your view."
      )
    )
      return;
    try {
      await block(profile.uid, otherUid);
      window.location.href = "/dms";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't block.");
    }
  }

  if (loading && !conv) {
    return <div className="card-dark animate-pulse" style={{ height: 260 }} />;
  }
  if (!conv) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NO CONVERSATION</Eyebrow>
        <p className="dim" style={{ marginTop: 10 }}>
          This conversation doesn&apos;t exist or you don&apos;t have access.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/dms">
            <Button variant="ghost">← Inbox</Button>
          </Link>
        </div>
      </div>
    );
  }

  const me = profile!.uid;
  const otherAlias = conv.userA === me ? conv.aliasB : conv.aliasA;
  const otherColor = conv.userA === me ? conv.aliasColorB : conv.aliasColorA;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div
        className="card-dark"
        style={{
          padding: 14,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: otherColor ?? aliasColor(otherAlias.toLowerCase()),
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--hammer)",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {aliasInitials(otherAlias)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 17,
              letterSpacing: "0.04em",
            }}
          >
            @{otherAlias}
          </div>
          <Tag tone={TRUST_TONE[trust]}>{TRUST_LABEL[trust]}</Tag>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBlock}>
          Block
        </Button>
      </div>

      {/* Safety reminder for strangers */}
      {trust === "stranger" && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 14,
            borderColor: "var(--hazard)",
            background: "rgba(245,212,0,0.04)",
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--hazard)",
              marginBottom: 4,
            }}
          >
            YOU&apos;RE TALKING TO A STRANGER
          </div>
          <p className="dim" style={{ fontSize: 12, margin: 0 }}>
            Never share your real name, age, school, or contact info. Meet at
            public skate spots — Late Push is alias-only for a reason.
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          display: "grid",
          gap: 8,
          marginBottom: 18,
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "2px 2px 2px 0",
        }}
      >
        {messages.length === 0 ? (
          <p
            className="dim"
            style={{
              fontSize: 13,
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            Say hi — introduce yourself and what you skate.
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              mine={m.authorUid === me}
              onReport={() => handleReport(m)}
            />
          ))
        )}
        <div ref={listEndRef} />
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 10,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {softWarning && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 10,
            borderColor: "var(--hazard)",
            background: "rgba(245,212,0,0.05)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 13,
              color: "var(--paper-2)",
            }}
          >
            {softWarning}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              size="sm"
              variant="coral"
              onClick={() => doSend(true)}
              disabled={sending}
            >
              {sending ? "Sending…" : "Send anyway"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSoftWarning(null)}
            >
              Edit message
            </Button>
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Coordinate a session, share a tip, be cool."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          style={{
            flex: 1,
            background: "var(--ink)",
            border: "1px solid var(--ink-3)",
            borderRadius: "var(--r-s)",
            padding: "10px 12px",
            color: "var(--paper)",
            fontFamily: "var(--body)",
            fontSize: 14,
            outline: "none",
            resize: "vertical",
            minHeight: 56,
          }}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={sending || body.trim().length === 0}
        >
          {sending ? "…" : "Send"}
        </Button>
      </form>

      <div style={{ marginTop: 20 }}>
        <Link href="/dms">
          <Button variant="ghost">← Inbox</Button>
        </Link>
      </div>
    </div>
  );
}

function MessageBubble({
  m,
  mine,
  onReport,
}: {
  m: DmMessage;
  mine: boolean;
  onReport: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: mine ? "flex-end" : "flex-start",
      }}
    >
      {m.flag && m.flag !== "safe" && !mine && (
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--coral)",
            marginBottom: 4,
          }}
        >
          ⚠ FLAGGED · {FLAG_LABEL[m.flag]}
        </div>
      )}
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: 14,
          borderTopRightRadius: mine ? 4 : 14,
          borderTopLeftRadius: mine ? 14 : 4,
          background: mine ? "var(--hazard)" : "var(--ink-2)",
          color: mine ? "var(--ink)" : "var(--paper)",
          border: mine ? "2px solid var(--ink)" : "1px solid var(--ink-3)",
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {m.body}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 4,
        }}
      >
        <span className="label" style={{ fontSize: 9 }}>
          {formatTime(m.sentAt)}
        </span>
        {!mine && (
          <button
            onClick={onReport}
            className="mono"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--paper-dim)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            REPORT
          </button>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}
