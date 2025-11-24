import React, { useState } from "react";
import "../styles/ContactUs.css"; // updated CSS
import logo from "../assets/CClogo.png"; // import your logo

function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, message });
    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="contact-container">
      {/* Logo at the top */}
      <div className="contact-logo-container">
        <img src={logo} alt="Ctrl + Cook Logo" className="contact-logo" />
      </div>

      <h2>Contact Us</h2>
      <p>
        Have questions or feedback? Reach out to us using the form below or via
        email at <strong>support@ctrlcook.com</strong>.
      </p>

      {success && <p className="success">Message sent successfully!</p>}

      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactUs;
