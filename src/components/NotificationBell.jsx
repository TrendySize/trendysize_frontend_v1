import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";

const POLL_INTERVAL_MS = 60000;

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell({
  className = "",
  iconClassName = "",
  size = 19,
}) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState(null);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const data = await getNotifications();
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.unreadCount) || 0);
      setError("");
    } catch {
      if (!quiet) setError("Could not load notifications.");
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load({ quiet: true });

    const timer = window.setInterval(() => load({ quiet: true }), POLL_INTERVAL_MS);
    const onFocus = () => load({ quiet: true });
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
    // Intentionally once on mount; the polling loop owns its own cleanup.
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    const updatePanelPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 24);
      const maxHeight = Math.min(480, window.innerHeight - 24);
      const left = Math.max(
        12,
        Math.min(rect.right - width, window.innerWidth - width - 12)
      );
      const top = Math.max(
        12,
        Math.min(rect.bottom + 8, window.innerHeight - maxHeight - 12)
      );

      setPanelPosition({ left, top, width });
    };

    updatePanelPosition();

    const onPointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  const openItem = async (notification) => {
    setOpen(false);

    if (!notification.isRead) {
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await markNotificationRead(notification.id);
      } catch {
        load({ quiet: true });
      }
    }

    navigate(notification.link || "/dashboard");
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      setError("Could not update notifications.");
      load({ quiet: true });
    }
  };

  const hasUnread = items.some((item) => !item.isRead);
  const label = unreadCount > 0
    ? `Notifications, ${unreadCount} unread`
    : "Notifications";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={className}
      >
        <Bell size={size} strokeWidth={1.7} className={iconClassName} />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#6133DA] px-1 text-xs font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && panelPosition && createPortal(
        <div
          ref={panelRef}
          style={{
            left: panelPosition.left,
            top: panelPosition.top,
            width: panelPosition.width,
          }}
          className="fixed z-[1250] flex max-h-[min(480px,calc(100dvh-24px))] flex-col overflow-hidden rounded-xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--tk-border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--tk-ink-strong)]">
                Notifications
              </p>
              <p className="mt-0.5 text-xs text-[var(--tk-ink-muted)]">
                {unreadCount > 0 ? `${unreadCount} unread` : "You are up to date"}
              </p>
            </div>

            {hasUnread && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-[var(--tk-border)] px-2 py-1 text-xs font-medium text-[var(--tk-ink-soft)] transition-colors hover:bg-[var(--tk-hover)] hover:text-[var(--tk-ink)]"
              >
                <CheckCheck size={13} strokeWidth={2} />
                Mark all read
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <p className="px-4 py-6 text-sm text-[var(--tk-ink-muted)]">
                Loading notifications...
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-[var(--tk-ink-muted)]">{error}</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-7">
                <p className="text-sm font-medium text-[var(--tk-ink)]">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--tk-ink-muted)]">
                  Customer measurement activity and account updates will appear here.
                </p>
              </div>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openItem(notification)}
                  className="block w-full border-b border-[var(--tk-border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--tk-hover)]"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        notification.isRead ? "bg-transparent" : "bg-[#6133DA]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--tk-ink-strong)]">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-xs text-[var(--tk-ink-muted)]">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-[var(--tk-ink-soft)] [overflow-wrap:anywhere]">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
