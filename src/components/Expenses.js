import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./Expenses.css";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("-").map(Number);
  if (!d || !m || !y) return null;
  return { day: d, month: m, year: y };
};

const Expenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "paidExpenses"));
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Group expenses by "YYYY-MM" key
  const grouped = expenses.reduce((acc, exp) => {
    const parsed = parseDate(exp.date);
    if (!parsed) return acc;
    const key = `${parsed.year}-${String(parsed.month).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = { year: parsed.year, month: parsed.month, items: [] };
    acc[key].items.push(exp);
    return acc;
  }, {});

  // Sort months descending (newest first)
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Auto-select first month
  useEffect(() => {
    if (sortedKeys.length > 0 && !selectedMonth) {
      setSelectedMonth(sortedKeys[0]);
    }
  }, [sortedKeys, selectedMonth]);

  // Build sparkline data for a month (day → cumulative spend)
  const getSparkData = (items) => {
    const byDay = {};
    items.forEach(e => {
      const parsed = parseDate(e.date);
      if (parsed) byDay[parsed.day] = (byDay[parsed.day] || 0) + e.amount;
    });
    let cum = 0;
    return Object.keys(byDay).sort((a,b) => a-b).map(d => {
      cum += byDay[d];
      return { day: `${d}`, total: parseFloat(cum.toFixed(2)) };
    });
  };

  // Build monthly trend (all months, total per month)
  const trendData = sortedKeys.slice().reverse().map(key => ({
    name: MONTH_NAMES[grouped[key].month - 1].slice(0, 3),
    total: grouped[key].items.reduce((s, e) => s + e.amount, 0),
  }));

  const activeGroup = selectedMonth ? grouped[selectedMonth] : null;
  const activeTotal = activeGroup ? activeGroup.items.reduce((s, e) => s + e.amount, 0) : 0;
  const activeSparkData = activeGroup ? getSparkData(activeGroup.items) : [];

  const allTimeTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const avgMonthly = sortedKeys.length > 0 ? allTimeTotal / sortedKeys.length : 0;

  if (loading) return <div className="expenses-loading">Loading expenses…</div>;

  return (
    <div className="expenses-page">

      {/* Header */}
      <div className="expenses-header">
        <div>
          <h1 className="expenses-title">Expenses</h1>
          <p className="expenses-subtitle">{expenses.length} transactions across {sortedKeys.length} month{sortedKeys.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="expenses-stats">
          <div className="stat-pill">
            <span className="stat-label">All Time</span>
            <span className="stat-value">${allTimeTotal.toFixed(2)}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Avg / Month</span>
            <span className="stat-value">${avgMonthly.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="expenses-empty">
          <span className="expenses-empty-icon">💸</span>
          <p>No expenses recorded yet.</p>
          <p className="expenses-empty-sub">Head to the dashboard and log your first expense.</p>
        </div>
      ) : (
        <div className="expenses-body">

          {/* Trend chart */}
          {trendData.length > 1 && (
            <div className="trend-card">
              <h3 className="trend-title">Spending Trend</h3>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`$${v.toFixed(2)}`, "Spent"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={2} fill="url(#trendGrad)" dot={{ r: 3, fill: "#a855f7" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="expenses-layout">

            {/* Month list */}
            <div className="month-list">
              {sortedKeys.map(key => {
                const g = grouped[key];
                const total = g.items.reduce((s, e) => s + e.amount, 0);
                const isActive = key === selectedMonth;
                return (
                  <button
                    key={key}
                    className={`month-btn ${isActive ? "month-btn--active" : ""}`}
                    onClick={() => setSelectedMonth(key)}
                  >
                    <div className="month-btn-name">{MONTH_NAMES[g.month - 1]}</div>
                    <div className="month-btn-meta">
                      <span className="month-btn-year">{g.year}</span>
                      <span className="month-btn-count">{g.items.length} items</span>
                    </div>
                    <div className="month-btn-total">${total.toFixed(2)}</div>
                  </button>
                );
              })}
            </div>

            {/* Month detail */}
            {activeGroup && (
              <div className="month-detail">

                <div className="month-detail-header">
                  <div>
                    <h2 className="month-detail-title">
                      {MONTH_NAMES[activeGroup.month - 1]} <span className="month-detail-year">{activeGroup.year}</span>
                    </h2>
                    <p className="month-detail-sub">{activeGroup.items.length} expenses</p>
                  </div>
                  <div className="month-detail-total">
                    <span className="month-detail-total-label">Total</span>
                    <span className="month-detail-total-value">${activeTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Mini sparkline for selected month */}
                {activeSparkData.length > 1 && (
                  <div className="sparkline-wrap">
                    <ResponsiveContainer width="100%" height={70}>
                      <AreaChart data={activeSparkData}>
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e6d6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00e6d6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#444" tick={{ fontSize: 10 }} label={{ value: "Day", position: "insideRight", offset: -4, fontSize: 10, fill: "#555" }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
                          formatter={(v) => [`$${v.toFixed(2)}`, "Cumulative"]}
                        />
                        <Area type="monotone" dataKey="total" stroke="#00e6d6" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Expense rows */}
                <div className="expense-list">
                  {activeGroup.items
                    .slice()
                    .sort((a, b) => {
                      const pa = parseDate(a.date), pb = parseDate(b.date);
                      return (pb?.day || 0) - (pa?.day || 0);
                    })
                    .map((exp, i) => (
                      <div key={exp.id} className="expense-row" style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="expense-row-dot" />
                        <div className="expense-row-info">
                          <span className="expense-row-name">{exp.text}</span>
                          <span className="expense-row-date">{exp.date}</span>
                        </div>
                        <span className="expense-row-amount">${exp.amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
