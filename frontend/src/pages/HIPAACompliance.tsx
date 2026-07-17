import BackButton from '../components/shared/BackButton';

export default function HIPAACompliance() {
  return (
    <div className="hipaa-compliance-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>HIPAA Compliance</h1>
        <p>Your Health Information Privacy is Our Priority</p>
      </section>

      {/* Content Sections */}
      <div className="container hipaa-content">
        <section className="hipaa-card">
          <h2>What is HIPAA?</h2>
          <p>The Health Insurance Portability and Accountability Act (HIPAA) is a US federal law that protects sensitive patient health information from being disclosed without the patient's consent or knowledge.</p>
        </section>

        <section className="hipaa-card">
          <h2>Our Commitment to Compliance</h2>
          <p>At MediVoice AI, we are committed to protecting your health information with the highest security standards. While we operate globally, we adhere to HIPAA principles to ensure your data is handled with care.</p>
        </section>

        <section className="hipaa-card">
          <h2>Data Protection Measures</h2>
          <ul className="hipaa-list">
            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
            <li><strong>Access Controls:</strong> Strict authentication and authorization protocols</li>
            <li><strong>Audit Logs:</strong> Complete tracking of all data access</li>
            <li><strong>Secure Storage:</strong> Data stored in ISO 27001 certified facilities</li>
          </ul>
        </section>

        <section className="hipaa-card">
          <h2>Your Rights Under HIPAA</h2>
          <ul className="hipaa-list">
            <li>Right to access your medical information</li>
            <li>Right to request corrections to your records</li>
            <li>Right to know who has accessed your information</li>
            <li>Right to request restrictions on data sharing</li>
            <li>Right to file a complaint about privacy violations</li>
          </ul>
        </section>
      </div>

      {/* Closing CTA Contact Section */}
      <section className="contact-cta-section">
        <div className="container">
          <h2>Contact Our Privacy Officer</h2>
          <p>For privacy-related concerns, contact our HIPAA Privacy Officer:</p>
          <div className="cta-contacts">
            <p><strong>Email:</strong> privacy@medivoice.ai</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
          </div>
        </div>
      </section>

      <style>{`
        .hipaa-compliance-container {
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

        /* HIPAA Cards Layout */
        .hipaa-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 80px;
        }

        .hipaa-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .hipaa-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .hipaa-card h2 {
          font-size: 26px;
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .hipaa-card p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin: 0;
        }

        .hipaa-list {
          padding-left: 20px;
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 16px;
        }

        .hipaa-list li {
          margin-bottom: 8px;
        }

        .hipaa-list li:last-child {
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

        .cta-contacts {
          display: inline-block;
          background: white;
          color: #1e3a8a;
          padding: 24px 40px;
          font-size: 16px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          text-align: left;
        }

        .cta-contacts p {
          margin: 6px 0;
          color: #1e3a8a;
        }

        .cta-contacts strong {
          color: #1e293b;
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

          .hipaa-card {
            padding: 24px;
          }

          .hipaa-card h2 {
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