import React from "react";

export default function TabsWrapper({ tabs, activeTab, onTabChange, children }) {
  return (
    <div>
      <ul className="nav nav-tabs mb-3">
        {tabs.map(tab => (
          <li key={tab.value} className="nav-item">
            <button
              onClick={() => onTabChange(tab.value)}
              className={`nav-link ${activeTab === tab.value ? 'active' : ''}`}
              type="button"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">{children}</div>
    </div>
  );
}