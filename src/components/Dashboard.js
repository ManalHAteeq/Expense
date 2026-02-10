import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CgGoogleTasks } from "react-icons/cg";
import { BiSolidReport } from "react-icons/bi";
import { IoAirplane } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import "../App.css";

const Dashboard = () => {
  const spendingData = [
    { name: "PC3", value: 70 },
    { name: "S3", value: 60 },
    { name: "MB", value: 80 },
    { name: "ES", value: 40 },
  ];

  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [newDoneTaskText, setNewDoneTaskText] = useState("");
  const [newDoneTaskAmount, setNewDoneTaskAmount] = useState("");
  const [newTaskText, setNewTaskText] = useState("");

  const [tasks, setTasks] = useState([
    {id: 1, text: "Mortgage", date: "1-9-2025" },
    {id: 2, text: "University Fees", date: "3-9-2025"}
  ]);

  const [doneTasks, setDoneTasks] = useState([
    {id: 1, text: "Ahmad's School", amount: 150.0 },
    {id: 2, text: "Car Insurance", amount: 1500.0}
  ]);

  const addTask = () => { 
    // const newTaskText = prompt("Enter new Task:"); 
    // if (newTaskText) { 
        setTasks(prev => [
            ...prev,
            {id: prev.length  + 1 , text: newTaskText }
        ]);
    // }
    setNewTaskText("");
    setShowModal2(false);

  };

  const removeTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const money =prompt("How much you paid?");
    const value = parseFloat(money);
    setTasks(prev => prev.filter(t => t.id !== id));
    setDoneTasks(prev => [...prev, { ...task, amount: value }]);
  };

  const addTaskDone = () => {
    if (!/^[A-Za-z\s]+$/.test(newDoneTaskText)) {
      alert("Enter a proper title");
      return;
    }

    if (!/^[0-9]+(\.[0-9]+)?$/.test(newDoneTaskAmount)) {
      alert("Enter a valid number please");
      return; 
    }

    setDoneTasks(prev => [
      ...prev,
      { id: prev.length + 1, text: newDoneTaskText, amount: parseFloat(newDoneTaskAmount) }
    ]);

    // reset form + close modal
    setNewDoneTaskText("");
    setNewDoneTaskAmount("");
    setShowModal(false);
  };

  const monthsExpensesData = [
    { name: "September", value: 300 },
    { name: "Octobor", value: 200 },
    { name: "Services", value: 1000 },
    { name: "Food", value: 600 },
    { name: "Fuel", value: 400 },
  ];

  return (
    <div className="dashboard">
      {/* To be paid part */}
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
                    <CgGoogleTasks size= {25} className="task-icon" onClick ={() => removeTask(task.id)}/> {task.text}
                    </li> 
                ))}
            </ul>
        </div>

        {/* Paid part */}
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
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {doneTasks.map((e, i) => (
                <tr key={i}>
                  <td>{e.text}</td>
                  <td>${e.amount.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="card quick-access">
        <h3>Quick Access </h3>
        <hr />
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <button><BiSolidReport /> Create report</button>
        <button><IoAirplane /> Create trip</button>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="card">
          <h3>Day-to-Day Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={doneTasks}>
              <XAxis dataKey="text" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="amount" fill="#00e6d6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Months Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthsExpensesData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Paid Task</h3>
            <input
              type="text"
              placeholder="What you paid for"
              value={newDoneTaskText}
              onChange={e => setNewDoneTaskText(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newDoneTaskAmount}
              onChange={e => setNewDoneTaskAmount(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={addTaskDone}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal 2 */}
      {showModal2 && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Paid Task</h3>
            <input
              type="text"
              placeholder="Enter new expense"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={addTask}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
