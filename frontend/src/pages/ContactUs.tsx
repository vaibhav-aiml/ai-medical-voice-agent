import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../components/shared/BackButton';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-us-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Contact Us</h1>
        <p>We're here to help. Reach out to us anytime.</p>
      </section>

      {/* Content Section */}
      <div className="container contact-content">
        <div className="info-column">
          <h2>Get in Touch</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <Phone size={24} color="white" />
              </div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
              <p className="subtext">+91 98765 43211 (Emergency)</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Mail size={24} color="white" />
              </div>
              <h3>Email</h3>
              <p>support@medivoice.ai</p>
              <p className="subtext">care@medivoice.ai</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <MapPin size={24} color="white" />
              </div>
              <h3>Address</h3>
              <p>DLF Cyber City, Phase 3</p>
              <p className="subtext">Gurugram, Haryana - 122002</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Clock size={24} color="white" />
              </div>
              <h3>Support Hours</h3>
              <p>Monday - Friday: 9 AM - 9 PM</p>
              <p className="subtext">Weekends: 10 AM - 6 PM</p>
            </div>
          </div>
        </div>

        <div className="form-column">
          <h2>Send us a Message</h2>
          <div className="form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea
                placeholder="Your Message *"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
              />
              <button type="submit" className="submit-button">
                <Send size={16} /> Send Message
              </button>
              {submitted && <div className="success-banner">✓ Message sent successfully!</div>}
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container map-section">
        <h2>Visit Us</h2>
        <div className="map-card">
          <p className="map-title">📍 DLF Cyber City, Gurugram, Haryana</p>
          <p className="map-subtitle">Located in the heart of India's tech hub</p>
        </div>
      </div>

      <style>{`
        .contact-us-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          color: var(--text-primary);
          background: var(--bg-primary);
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          text-align: center;
          padding: 100px 20px;
          margin-bottom: 60px;
        }

        .hero-section h1 {
          font-size: 52px;
          margin-bottom: 16px;
          animation: fadeInUp 0.8s ease;
        }

        .hero-section p {
          font-size: 20px;
          opacity: 0.95;
          animation: fadeInUp 0.8s ease 0.2s both;
        }

        /* Content Layout */
        .contact-content {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .info-column h2, .form-column h2, .map-section h2 {
          font-size: 36px;
          margin-bottom: 32px;
          color: var(--text-primary);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .info-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .info-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .info-card h3 {
          font-size: 20px;
          margin-bottom: 12px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .info-card p {
          color: var(--text-primary);
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .info-card p.subtext {
          color: var(--text-secondary);
          font-size: 13px;
          margin-top: 4px;
        }

        /* Form Card */
        .form-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .contact-form input, .contact-form textarea {
          width: 100%;
          padding: 14px 18px;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 15px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .contact-form input:focus, .contact-form textarea:focus {
          border-color: var(--button-primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .contact-form textarea {
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 28px;
          background: var(--button-primary);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          margin-top: auto;
        }

        .submit-button:hover {
          background: var(--button-primary-hover);
          transform: translateY(-2px);
        }

        .success-banner {
          padding: 14px;
          background: var(--button-success);
          color: white;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
          animation: fadeInUp 0.4s ease;
        }

        /* Map Section */
        .map-section {
          margin-bottom: 20px;
        }

        .map-card {
          padding: 60px 24px;
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border-color);
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
        }

        .map-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .map-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .map-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .contact-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 36px;
          }

          .hero-section p {
            font-size: 18px;
          }

          .info-column h2, .form-column h2, .map-section h2 {
            font-size: 28px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .form-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}