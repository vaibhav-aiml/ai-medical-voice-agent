import BackButton from '../components/shared/BackButton';

export default function CookiePolicy() {
  return (
    <div className="cookie-policy-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Cookie Policy</h1>
        <p>How We Use Cookies to Enhance Your Experience</p>
      </section>

      {/* Content Sections */}
      <div className="container cookie-content">
        <section className="cookie-card">
          <h2>What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.</p>
        </section>

        <section className="cookie-card">
          <h2>Types of Cookies We Use</h2>
          <ul className="cookie-list">
            <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site</li>
            <li><strong>Security Cookies:</strong> Protect your account and data</li>
          </ul>
        </section>

        <section className="cookie-card">
          <h2>Third-Party Cookies</h2>
          <p>We use trusted third-party services that may set cookies on our behalf:</p>
          <ul className="cookie-list">
            <li>Google Analytics - for website analytics</li>
            <li>Clerk - for authentication and security</li>
            <li>Groq/OpenAI - for AI consultation services</li>
          </ul>
        </section>

        <section className="cookie-card">
          <h2>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
          <ul className="cookie-list">
            <li>View all cookies stored on your device</li>
            <li>Delete existing cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Set preferences for future cookie storage</li>
          </ul>
        </section>
      </div>

      {/* Closing CTA Contact Section */}
      <section className="contact-cta-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p>If you have questions about our cookie usage, please contact us at:</p>
          <a href="mailto:privacy@medivoice.ai" className="cta-email">privacy@medivoice.ai</a>
        </div>
      </section>

      <style>{`
        .cookie-policy-container {
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

        /* Cookie Cards Layout */
        .cookie-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 80px;
        }

        .cookie-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 40px;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .cookie-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .cookie-card h2 {
          font-size: 26px;
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .cookie-card p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin: 0;
        }

        .cookie-list {
          padding-left: 20px;
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 16px;
        }

        .cookie-list li {
          margin-bottom: 8px;
        }

        .cookie-list li:last-child {
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

          .cookie-card {
            padding: 24px;
          }

          .cookie-card h2 {
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