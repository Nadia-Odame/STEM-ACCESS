import { useEffect, useState } from "react";
import { api } from "../api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { notifications } = await api.listNotifications();
    setNotifications(notifications);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    load();
  };

  return (
    <div className="page">
      <div className="section-header">
        <h1>Notifications</h1>
        <button className="btn-secondary-sm" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>
      <p className="muted">FR8: Deadline reminders and system notifications (mentorship updates, new opportunities, announcements).</p>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id} className={n.isRead ? "read" : "unread"}>
              <span className={`badge badge-${n.type}`}>{n.type}</span> {n.message}
              <span className="muted small"> · {new Date(n.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
