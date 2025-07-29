import React from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';

export default function PlaceholderPage({ title, connectButton, theme, onToggleTheme }) {
  return (
    <DefaultLayout
      title={title}
      left={
        <div className="token-card" style={{ minHeight: 300, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <h2 style={{ color: "#2997ff" }}>{title}</h2>
          <div style={{ marginTop: "2rem", color: "#8ca7d1" }}>
            <span>This page is <b>under development</b>.<br />Coming soon!</span>
          </div>
        </div>
      }
      right={null}
      connectButton={connectButton}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  );
}