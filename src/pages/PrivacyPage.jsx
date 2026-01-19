import React from "react";
import { Link } from "react-router-dom";
import { Command, ArrowLeft } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FirstIssue.dev</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-12">Last updated: January 2024</p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Welcome to FirstIssue.dev. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
              </p>
              <p className="text-gray-400 leading-relaxed">
                By using FirstIssue.dev, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p className="text-gray-400 leading-relaxed mb-4">We collect the following types of information:</p>
              
              <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                When you sign in with GitHub, we receive your GitHub username, email address, profile picture, and public profile information.
              </p>

              <h3 className="text-lg font-medium text-white mb-2">Usage Data</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                We collect information about how you use the Service, including bookmarked issues, search queries, and interaction patterns.
              </p>

              <h3 className="text-lg font-medium text-white mb-2">Technical Data</h3>
              <p className="text-gray-400 leading-relaxed">
                We automatically collect certain technical information including your IP address, browser type, device information, and access times.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-400 leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Personalize your experience and recommendations</li>
                <li>Track your progress and bookmarked issues</li>
                <li>Improve our Service and develop new features</li>
                <li>Send you important updates about the Service</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Service (e.g., Supabase for database hosting)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-gray-400 leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal data, please contact us.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@firstissue.dev.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-600">© 2024 FirstIssue.dev. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
