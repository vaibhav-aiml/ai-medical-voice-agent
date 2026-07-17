import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import BackButton from '../components/shared/BackButton';

const AboutUs: React.FC = () => {
  // Team members data - Updated with your team
  const teamMembers = [
    {
      name: 'Vaibhav Badaya',
      role: 'Team Leader / Full Stack Developer',
      bio: 'Complete architecture & system design. Frontend: React.js, TypeScript, Tailwind CSS. Backend: Node.js, Express.js, REST APIs. Database: PostgreSQL with Drizzle ORM. AI integration: Groq (Llama 3.3). Clerk auth, email, PDF, deployment.',
      image: 'https://via.placeholder.com/150',
      social: {
        github: 'https://github.com/vaibhavbadaya',
        linkedin: 'https://linkedin.com/in/vaibhavbadaya',
      }
    },
    {
      name: 'Shahnawaz Khan',
      role: 'Frontend & UI Assistant',
      bio: 'React component development. Tailwind CSS styling & responsive design. Dark/light mode toggle implementation. UI animations with Frame Motion. Cross-browser compatibility testing.',
      image: 'https://via.placeholder.com/150',
      social: {
        github: 'https://github.com/shahnawazkhan',
        linkedin: 'https://linkedin.com/in/shahnawazkhan',
      }
    },
    {
      name: 'Jai Krishna Dadheech',
      role: 'Documentation & Testing',
      bio: 'Project synopsis & reports. Manual testing & bug reporting. Minor frontend adjustments. User documentation & guides.',
      image: 'https://via.placeholder.com/150',
      social: {
        github: 'https://github.com/jaiKrishna',
        linkedin: 'https://linkedin.com/in/jaiKrishna',
      }
    }
  ];

  // Core values data - Professional version
  const coreValues = [
    {
      title: 'Technical Excellence',
      description: 'We deliver high-quality, scalable, and maintainable code following industry best practices and design patterns.',
      icon: '⚡'
    },
    {
      title: 'Patient-Centric Innovation',
      description: 'Leveraging cutting-edge AI technology to create solutions that prioritize patient care, accessibility, and medical accuracy.',
      icon: '🏥'
    },
    {
      title: 'Data Security & Compliance',
      description: 'We are committed to HIPAA compliance, data encryption, and maintaining the highest standards of patient privacy.',
      icon: '🔒'
    },
    {
      title: 'Collaborative Development',
      description: 'Working seamlessly with healthcare professionals to ensure our technology meets real-world medical needs.',
      icon: '🤝'
    }
  ];

  return (
    <div className="about-us-container">
      {/* Back Button */}
      <BackButton />

      {/* Hero Section */}
      <section className="hero-section">
        <h1>About Us</h1>
        <p>Transforming Healthcare with AI-Powered Voice Technology</p>
      </section>

      {/* Company Story */}
      <section className="story-section">
        <div className="container">
          <h2>Our Story</h2>
          <p>
            MediVoice AI was founded with a singular mission: to revolutionize healthcare delivery through intelligent voice technology. We recognized that medical professionals spend countless hours on documentation, taking time away from patient care. Our solution bridges this gap by providing seamless, AI-powered voice assistance that streamlines clinical workflows.
          </p>
          <p>
            With expertise spanning full-stack development, AI integration, and healthcare compliance, our team is dedicated to building solutions that are not just technologically advanced but also clinically relevant and secure.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-card">
            <h3>Our Mission</h3>
            <p>To empower healthcare providers with intelligent voice AI that reduces administrative burden and enhances patient care.</p>
          </div>
          <div className="vision-card">
            <h3>Our Vision</h3>
            <p>To become the leading AI voice assistant platform for healthcare, trusted by medical professionals worldwide.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-icon">{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="social-links">
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <FaGithub size={20} />
                  </a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Professional */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <p className="values-subtitle">The principles that guide everything we do</p>
          <div className="values-grid">
            {coreValues.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <div className="container">
          <h2>Ready to Transform Healthcare?</h2>
          <p>Join us in revolutionizing medical documentation with AI voice technology</p>
          <button className="cta-button">Get In Touch</button>
        </div>
      </section>

      <style>{`
        .about-us-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          color: var(--text-primary);
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

        /* Story Section */
        .story-section {
          padding: 80px 20px;
          background: var(--bg-primary);
        }

        .story-section h2 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 40px;
          color: var(--text-primary);
        }

        .story-section p {
          font-size: 18px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 24px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Mission Section */
        .mission-section {
          padding: 80px 20px;
          background: var(--bg-secondary);
        }

        .mission-section .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .mission-card, .vision-card {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 48px 32px;
          border-radius: 20px;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: var(--card-shadow);
        }

        .mission-card:hover, .vision-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--card-shadow-hover);
        }

        .mission-card h3, .vision-card h3 {
          font-size: 28px;
          margin-bottom: 20px;
        }

        .mission-card p, .vision-card p {
          font-size: 16px;
          line-height: 1.6;
          opacity: 0.95;
        }

        /* Team Section */
        .team-section {
          padding: 80px 20px;
          background: var(--bg-primary);
        }

        .team-section h2 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 50px;
          color: var(--text-primary);
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
        }

        .team-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .team-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .team-icon {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          font-size: 40px;
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .team-card h3 {
          font-size: 22px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .team-role {
          color: var(--button-primary);
          font-weight: 600;
          margin-bottom: 16px;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .team-bio {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 24px;
          text-align: left;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .social-links a {
          color: var(--text-muted);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .social-links a:hover {
          color: var(--button-primary);
          transform: translateY(-2px);
        }

        /* Values Section - Professional */
        .values-section {
          padding: 80px 20px;
          background: var(--bg-secondary);
        }

        .values-section h2 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .values-subtitle {
          text-align: center;
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 60px;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 32px;
        }

        .value-card {
          text-align: center;
          padding: 40px 24px;
          background: var(--bg-card);
          border-radius: 20px;
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--button-primary);
        }

        .value-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .value-card h4 {
          font-size: 20px;
          margin-bottom: 16px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .value-card p {
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 15px;
        }

        /* Contact CTA */
        .contact-cta {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          text-align: center;
          padding: 80px 20px;
        }

        .contact-cta h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }

        .contact-cta p {
          font-size: 18px;
          margin-bottom: 32px;
          opacity: 0.95;
        }

        .cta-button {
          background: white;
          color: #1e3a8a;
          border: none;
          padding: 14px 36px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          background: #f8fafc;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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

          .story-section h2,
          .team-section h2,
          .values-section h2,
          .contact-cta h2 {
            font-size: 28px;
          }

          .mission-section .container {
            grid-template-columns: 1fr;
          }

          .team-grid {
            grid-template-columns: 1fr;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;