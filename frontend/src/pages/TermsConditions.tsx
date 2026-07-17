import BackButton from '../components/shared/BackButton';

export default function TermsConditions() {
  return (
    <div className="terms-conditions-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Terms & Conditions</h1>
        <p>Please read these terms carefully before using our platform.</p>
      </section>

      {/* Content Sections */}
      <div className="container terms-content">
        <section className="terms-card">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using MediVoice AI, you agree to be bound by these Terms & Conditions. If you disagree with any part, please do not use our services.</p>
        </section>

        <section className="terms-card">
          <h2>2. Description of Service</h2>
          <p>MediVoice AI provides AI-powered medical consultation services. Our AI analyzes symptoms and provides general medical information. This is not a substitute for professional medical advice.</p>
        </section>

        <section className="terms-card">
          <h2>3. User Responsibilities</h2>
          <ul className="terms-list">
            <li>Provide accurate and truthful information about your symptoms</li>
            <li>Not misuse the platform for any unlawful purposes</li>
            <li>Consult a qualified doctor for serious medical conditions</li>
            <li>Keep your account credentials secure</li>
          </ul>
        </section>

        <section className="terms-card highlight-card">
          <h2>4. Medical Disclaimer</h2>
          <p>⚠️ <strong>Important:</strong> MediVoice AI is an informational tool only. It does not provide medical diagnosis or treatment recommendations. Always consult a qualified healthcare provider for medical advice.</p>
        </section>

        <section className="terms-card">
          <h2>5. Limitation of Liability</h2>
          <p>MediVoice AI shall not be liable for any damages arising from the use of our services. You use the platform at your own risk.</p>
        </section>

        <section className="terms-card">
          <h2>6. Governing Law</h2>
          <p>These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.</p>
        </section>

        <section className="terms-card">
          <h2>7. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the modified terms.</p>
        </section>
      </div>

      {/* Closing CTA Contact Section */}
      <section className="contact-cta-section">
        <div className="container">
          <h2>8. Contact Us</h2>
          <p>For questions about these Terms, contact us at:</p>
          <a href="mailto:legal@medivoice.ai" className="cta-email">legal@medivoice.ai</a>
        </div>
      </section>

      <style>{`
        .terms-conditions-container {
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

        /* Terms Cards Layout */
        .terms-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 80px;
        }

        .terms-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .terms-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .highlight-card {
          border-left: 5px solid #ca8a04;
        }

        .terms-card h2 {
          font-size: 26px;
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .terms-card p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin: 0;
        }

        .terms-list {
          padding-left: 20px;
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 16px;
        }

        .terms-list li {
          margin-bottom: 8px;
        }

        .terms-list li:last-child {
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

          .terms-card {
            padding: 24px;
          }

          .terms-card h2 {
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