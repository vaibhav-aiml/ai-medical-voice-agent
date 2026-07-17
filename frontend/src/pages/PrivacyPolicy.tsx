import BackButton from '../components/shared/BackButton';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. Learn how we handle your data.</p>
      </section>

      {/* Content Sections */}
      <div className="container policy-content">
        <section className="policy-card">
          <h2>Information We Collect</h2>
          <ul className="policy-list">
            <li><strong>Personal Information:</strong> Name, email, phone number, age, gender</li>
            <li><strong>Health Information:</strong> Symptoms, medical history, consultation records</li>
            <li><strong>Usage Data:</strong> IP address, device information, browser type</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>How We Use Your Information</h2>
          <ul className="policy-list">
            <li>Provide AI-powered medical consultations</li>
            <li>Generate medical reports</li>
            <li>Improve our AI models</li>
            <li>Send important notifications and updates</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your information.</p>
        </section>

        <section className="policy-card">
          <h2>Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="policy-list">
            <li>Healthcare providers (with your consent)</li>
            <li>Service providers who assist our operations</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Your Rights</h2>
          <ul className="policy-list">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>
      </div>

      {/* Closing CTA Contact Section */}
      <section className="contact-cta-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p>For privacy-related questions, email us at:</p>
          <a href="mailto:privacy@medivoice.ai" className="cta-email">privacy@medivoice.ai</a>
        </div>
      </section>

      <style>{`
        .privacy-policy-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          color: var(--text-primary);
          background: var(--bg-primary);
          min-height: 100vh;
        }

        .container {
          max-width: 1000px;
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

        /* Policy Cards Layout */
        .policy-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 80px;
        }

        .policy-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .policy-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .policy-card h2 {
          font-size: 26px;
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .policy-card p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin: 0;
        }

        .policy-list {
          padding-left: 20px;
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 16px;
        }

        .policy-list li {
          margin-bottom: 8px;
        }

        .policy-list li:last-child {
          margin-bottom: 0;
        }

        /* Contact CTA Section */
        .contact-cta-section {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          text-align: center;
          padding: 80px 20px;
        }

        .contact-cta-section h2 {
          font-size: 36px;
          margin-top: 0;
          margin-bottom: 16px;
        }

        .contact-cta-section p {
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 24px;
          opacity: 0.95;
        }

        .cta-email {
          display: inline-block;
          background: white;
          color: #1e3a8a;
          text-decoration: none;
          padding: 14px 36px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .cta-email:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          background: #f8fafc;
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
        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 36px;
          }

          .hero-section p {
            font-size: 18px;
          }

          .policy-card {
            padding: 24px;
          }

          .policy-card h2 {
            font-size: 22px;
          }

          .contact-cta-section h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}