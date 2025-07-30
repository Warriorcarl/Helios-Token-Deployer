import React from "react";

export default function EmptyState({ message, type = "default" }) {
  return (
    <div className={`cron-empty-msg ${type === "error" ? "cron-err-msg" : ""}`}>
      {message}
    </div>
  );
}