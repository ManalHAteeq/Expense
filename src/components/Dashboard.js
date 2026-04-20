import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CgGoogleTasks } from "react-icons/cg";
import { BiSolidReport } from "react-icons/bi";
import { IoAirplane } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdWarning, MdError } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc, getDoc, updateDoc,
  collection, addDoc, deleteDoc, onSnapshot, query
} from "firebase/firestore";
import "../App.css";

const Dashboard = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingTask, setPayingTask] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [newDoneTaskText, setNewDoneTaskText] = useState("");
  const [newDoneTaskAmount, setNewDoneTaskAmount] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [salary, setSalary] = useState("");
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const uid = user?.uid;

  // ── Load salary from Firestore ──────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const fetchSalary = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists() && snap.data().salary != null) {
        setSalary(String(snap.data().salary));
      }
    };
    fetchSalary();
  }, [uid]);

  // ── Real-time listener for pending tasks ────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "pendingTasks"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // ── Real-time listener for paid expenses ────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "paidExpenses"));
    const unsub = onSnapshot(q, (snap) => {
      setDoneTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const monthlyData = doneTasks.reduce((acc, task) => {
    const parts = task.date ? task.date.split("-") : [];
    const monthNum = parts.length >= 2 ? parseInt(parts[1]) : null;
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const label = monthNum >= 1 && monthNum <= 12 ? monthNames[monthNum - 1] : "Other";
    const existing = acc.find(d => d.name === label);
    if (existing) { existing.value += task.amount; }
    else { acc.push({ name: label, value: task.amount }); }
    return acc;
  }, []);

  const totalSpent = doneTasks.reduce((sum, t) => sum + t.amount, 0);
  const salaryNum = parseFloat(salary) || 0;
  const remaining = salaryNum - totalSpent;
  const spentPercent = salaryNum > 0 ? (totalSpent / salaryNum) * 100 : 0;

  const spentBracket = Math.floor(spentPercent / 10);
  useEffect(() => { setAlertDismissed(false); }, [salary, spentBracket]);

  const getBudgetAlert = () => {
    if (!salaryNum || alertDismissed) return null;
    if (spentPercent >= 100) return { level: "danger", icon: <MdError size={20} />, message: `You've exceeded your budget by $${Math.abs(remaining).toFixed(2)}!` };
    if (spentPercent >= 80)  return { level: "warning", icon: <MdWarning size={20} />, message: `Heads up — you've spent ${spentPercent.toFixed(0)}% of your salary. Only $${remaining.toFixed(2)} left.` };
    if (spentPercent >= 60)  return { level: "notice", icon: <MdWarning size={20} />, message: `You've used ${spentPercent.toFixed(0)}% of your budget. $${remaining.toFixed(2)} remaining.` };
    return null;
  };
  const budgetAlert = getBudgetAlert();

  const todayStr = () => {
    const d = new Date();
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  };

  // ── Add pending task ────────────────────────────────────────────────────────
  const addTask = async () => {
    if (!newTaskText.trim()) { alert("Please enter a task name."); return; }
    await addDoc(collection(db, "users", uid, "pendingTasks"), {
      text: newTaskText.trim(),
      date: todayStr(),
    });
    setNewTaskText("");
    setShowModal2(false);
  };

  // ── Mark pending task as paid ───────────────────────────────────────────────
  const initiateRemoveTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setPayingTask(task);
    setPayAmount("");
    setShowPayModal(true);
  };

  const confirmPayTask = async () => {
    const value = parseFloat(payAmount);
    if (isNaN(value) || value < 0) { alert("Please enter a valid amount."); return; }
    // Add to paidExpenses
    await addDoc(collection(db, "users", uid, "paidExpenses"), {
      text: payingTask.text,
      amount: value,
      date: todayStr(),
    });
    // Remove from pendingTasks
    await deleteDoc(doc(db, "users", uid, "pendingTasks", payingTask.id));
    setShowPayModal(false);
    setPayingTask(null);
  };

  // ── Add paid expense directly ───────────────────────────────────────────────
  const addTaskDone = async () => {
    if (!newDoneTaskText.trim()) { alert("Please enter a title."); return; }
    const value = parseFloat(newDoneTaskAmount);
    if (isNaN(value) || value < 0) { alert("Enter a valid amount."); return; }
    await addDoc(collection(db, "users", uid, "paidExpenses"), {
      text: newDoneTaskText.trim(),
      amount: value,
      date: todayStr(),
    });
    setNewDoneTaskText("");
    setNewDoneTaskAmount("");
    setShowModal(false);
  };

  // ── Delete paid expense ─────────────────────────────────────────────────────
  const removeDoneTask = async (id) => {
    await deleteDoc(doc(db, "users", uid, "paidExpenses", id));
  };

  // ── Save salary to Firestore ────────────────────────────────────────────────
  const saveSalary = async () => {
    await updateDoc(doc(db, "users", uid), { salary: parseFloat(salary) || 0 });
    setShowSalaryModal(false);
  };

  const clearSalary = async () => {
    setSalary("");
    await updateDoc(doc(db, "users", uid), { salary: 0 });
    setShowSalaryModal(false);
  };

  if (loading) return <div style={{ color: "#888", padding: 40 }}>Loading your data...</div>;

  return (
    <div className="dashboard">
      {budgetAlert && (
        <div className={`budget-alert budget-alert--${budgetAlert.level}`}>
          <span className="budget-alert__icon">{budgetAlert.icon}</span>
          <span className="budget-alert__message">{budgetAlert.message}</span>
          <button className="budget-alert__dismiss" onClick={() => setAlertDismissed(true)}>✕</button>
        </div>
      )}

      {salaryNum > 0 && (
        <div className="budget-progress-wrap">
          <div className="budget-progress-track">
            <div
              className={`budget-progress-fill ${spentPercent >= 100 ? "fill--danger" : spentPercent >= 80 ? "fill--warning" : "fill--ok"}`}
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
          <span className="budget-progress-label">{spentPercent.toFixed(0)}% of budget used</span>
        </div>
      )}

      {salaryNum > 0 && (
        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-label">Monthly Salary</span>
            <span className="summary-value salary">${salaryNum.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Spent</span>
            <span className="summary-value spent">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Remaining</span>
            <span className={`summary-value ${remaining < 0 ? "negative" : "positive"}`}>${remaining.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="top-section">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3>Tasks To Pay</h3>
            <span className="add" onClick={() => setShowModal2(true)}> + New Task </span>
          </div>
          <hr />
          <ul>
            {tasks.map(task => (
              <li key={task.id}>
                <CgGoogleTasks size={25} className="task-icon" onClick={() => initiateRemoveTask(task.id)} title="Mark as paid" />
                <span className="task-text">{task.text}</span>
                {task.date && <span className="task-date">{task.date}</span>}
              </li>
            ))}
            {tasks.length === 0 && <li className="empty-state">No pending tasks 🎉</li>}
          </ul>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3>Already Paid</h3>
            <span className="done" onClick={() => setShowModal(true)}> + New </span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Subject</th><th>Date</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {doneTasks.map((e) => (
                  <tr key={e.id}>
                    <td>{e.text}</td>
                    <td className="date-cell">{e.date || "—"}</td>
                    <td>${e.amount.toFixed(2)}</td>
                    <td><FaTrash className="delete-icon" onClick={() => removeDoneTask(e.id)} title="Remove entry" /></td>
                  </tr>
                ))}
                {doneTasks.length === 0 && <tr><td colSpan={4} className="empty-state">No expenses yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card quick-access">
        <h3>Quick Access</h3>
        <hr />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setShowSalaryModal(true)}>
            <BiSolidReport /> {salaryNum > 0 ? `Salary: $${salaryNum.toFixed(0)}` : "Enter Your Salary"}
          </button>
          <button><IoAirplane /> Create Trip</button>
        </div>
      </div>

      <div className="charts">
        <div className="card">
          <h3>Expenses Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={doneTasks}>
              <XAxis dataKey="text" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#00e6d6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
              <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Paid Expense</h3>
            <input type="text" placeholder="What you paid for" value={newDoneTaskText} onChange={e => setNewDoneTaskText(e.target.value)} />
            <input type="number" placeholder="Amount ($)" min="0" value={newDoneTaskAmount} onChange={e => setNewDoneTaskAmount(e.target.value)} />
            <div className="modal-actions">
              <button onClick={addTaskDone}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showModal2 && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Pending Task</h3>
            <input type="text" placeholder="e.g. Electricity Bill, iPhone 16..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
            <div className="modal-actions">
              <button onClick={addTask}>Add</button>
              <button onClick={() => setShowModal2(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPayModal && payingTask && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Mark as Paid</h3>
            <p style={{ color: "#aaa", marginBottom: 8 }}>How much did you pay for <strong style={{ color: "white" }}>{payingTask.text}</strong>?</p>
            <input type="number" placeholder="Amount ($)" min="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmPayTask()} autoFocus />
            <div className="modal-actions">
              <button onClick={confirmPayTask}>Confirm</button>
              <button onClick={() => setShowPayModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSalaryModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Monthly Salary</h3>
            <input type="number" placeholder="Enter monthly salary ($)" min="0" value={salary} onChange={e => setSalary(e.target.value)} onKeyDown={e => e.key === "Enter" && saveSalary()} autoFocus />
            <div className="modal-actions">
              <button onClick={saveSalary}>Save</button>
              <button onClick={clearSalary}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
