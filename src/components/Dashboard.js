import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CgGoogleTasks } from "react-icons/cg";
import { BiSolidReport } from "react-icons/bi";
import { IoAirplane } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import React, { useState } from "react";
import "../App.css";

let taskIdCounter = 10;

const Dashboard = () => {
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

  const [tasks, setTasks] = useState([
    { id: 1, text: "Mortgage", date: "1-9-2025" },
    { id: 2, text: "University Fees", date: "3-9-2025" },
  ]);

  const [doneTasks, setDoneTasks] = useState([
    { id: 3, text: "Ahmad's School", amount: 150.0, date: "2-9-2025" },
    { id: 4, text: "Car Insurance", amount: 1500.0, date: "2-9-2025" },
  ]);

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

  const addTask = () => {
    if (!newTaskText.trim()) { alert("Please enter a task name."); return; }
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setTasks(prev => [...prev, { id: ++taskIdCounter, text: newTaskText.trim(), date: dateStr }]);
    setNewTaskText("");
    setShowModal2(false);
  };

  const initiateRemoveTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setPayingTask(task);
    setPayAmount("");
    setShowPayModal(true);
  };

  const confirmPayTask = () => {
    const value = parseFloat(payAmount);
    if (isNaN(value) || value < 0) { alert("Please enter a valid amount."); return; }
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setTasks(prev => prev.filter(t => t.id !== payingTask.id));
    setDoneTasks(prev => [...prev, { ...payingTask, amount: value, date: dateStr }]);
    setShowPayModal(false);
    setPayingTask(null);
  };

  const addTaskDone = () => {
    if (!newDoneTaskText.trim()) { alert("Please enter a title."); return; }
    const value = parseFloat(newDoneTaskAmount);
    if (isNaN(value) || value < 0) { alert("Enter a valid amount."); return; }
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setDoneTasks(prev => [...prev, { id: ++taskIdCounter, text: newDoneTaskText.trim(), amount: value, date: dateStr }]);
    setNewDoneTaskText("");
    setNewDoneTaskAmount("");
    setShowModal(false);
  };

  const removeDoneTask = (id) => setDoneTasks(prev => prev.filter(t => t.id !== id));

  return (
    <div className="dashboard">
      {/* Summary Bar */}
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
            <span className={`summary-value ${remaining < 0 ? "negative" : "positive"}`}>
              ${remaining.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="top-section">
        <div className="card">
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <h3>Already Paid</h3>
            <span className="done" onClick={() => setShowModal(true)}> + New </span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doneTasks.map((e) => (
                  <tr key={e.id}>
                    <td>{e.text}</td>
                    <td className="date-cell">{e.date || "—"}</td>
                    <td>${e.amount.toFixed(2)}</td>
                    <td>
                      <FaTrash className="delete-icon" onClick={() => removeDoneTask(e.id)} title="Remove entry" />
                    </td>
                  </tr>
                ))}
                {doneTasks.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">No expenses yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card quick-access">
        <h3>Quick Access</h3>
        <hr />
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
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
            <input type="number" placeholder="Enter monthly salary ($)" min="0" value={salary} onChange={e => setSalary(e.target.value)} onKeyDown={e => e.key === "Enter" && setShowSalaryModal(false)} autoFocus />
            <div className="modal-actions">
              <button onClick={() => setShowSalaryModal(false)}>Save</button>
              <button onClick={() => { setSalary(""); setShowSalaryModal(false); }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
