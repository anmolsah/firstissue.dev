import React from "react";
import { Link } from "react-router-dom";
import { Command, ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";

const TermsPage = () => {
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-12">Last updated: January 2024</p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                By accessing or using FirstIssue.dev ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the Service following any changes constitutes acceptance of those changes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                FirstIssue.dev is a platform that helps developers find beginner-friendly open source issues to contribute to. We aggregate and organize issues from public GitHub repositories to make it easier for new contributors to get started with open source.
              </p>
              <p className="text-gray-400 leading-relaxed">
                The Service is provided "as is" and we make no warranties regarding the availability, accuracy, or quality of the issues displayed.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                To access certain features, you must create an account using GitHub OAuth authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
              </p>
              <p className="text-gray-400 leading-relaxed">
                You agree to provide accurate information and to update it as necessary. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">4. User Conduct</h2>
              <p className="text-gray-400 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to interfere with the proper functioning of the Service</li>
                <li>Scrape or collect data from the Service without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any activity that could harm other users</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                The Service and its original content, features, and functionality are owned by FirstIssue.dev and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Third-Party Links</h2>
              <p className="text-gray-400 leading-relaxed">
                The Service contains links to third-party websites (primarily GitHub). We are not responsible for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                In no event shall FirstIssue.dev be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Contact</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions about these Terms, please contact us at annifind010@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsPage;
