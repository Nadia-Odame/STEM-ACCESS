import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function MentorshipThread() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");

  async function load() {
    const { messages } = await api.listMessages(requestId);
    setMessages(messages);
  }

  useEffect(() => {
    load();
  }, [requestId]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    await api.sendMessage(requestId, body);
    setBody("");
    load();
  };

  return (
    <div className="page">
      <h1>Mentorship Conversation</h1>
      <p className="muted small">FR5.3 Messaging — secure communication between mentor and mentee.</p>

      <div className="card thread">
        {messages.length === 0 ? (
          <p className="muted">No messages yet — say hello!</p>
        ) : (
          messages.map((m) => (
            <div className="message-bubble" key={m.id}>
              <p>{m.body}</p>
              <span className="muted small">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      <form className="message-form" onSubmit={send}>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
        <button className="btn-primary-sm" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
