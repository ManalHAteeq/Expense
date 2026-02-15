import React from "react";
import { FaEnvelope, FaPhoneAlt, FaClock } from "react-icons/fa";
import "./Support.css"

const Support = () => {
  return (
    <div className="dashboard">
      <h2>Support Center</h2>

      <div className="card support-card">
        <h3>Contact Information</h3>

        <div className="support-item">
          <FaEnvelope className="support-icon" />
          <span>manal.ateeq6@gmail.com</span>
        </div>

        <div className="support-item">
          <FaPhoneAlt className="support-icon" />
          <span>+970 599 123 456</span>
        </div>

        <div className="support-item">
          <FaClock className="support-icon" />
          <span>Sunday - Thursday | 9:00 AM - 5:00 PM</span>
        </div>

        <hr />

        <p className="support-note">
          For urgent issues, please include your account email and a short
          description of the problem.
        </p>
      </div>
    </div>
  );
};

export default Support;
