import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Linkedin, Mail, Heart, ExternalLink, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Explore Issues', href: '/explore' },
      { name: 'Track Progress', href: '/status' },
      { name: 'AI Helper', href: '/ai-helper' },
      { name: 'Bookmarks', href: '/bookmarks' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Support', href: '/support' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' }
    ],
    resources: [
      { name: 'GitHub Guide', href: 'https://docs.github.com/en/get-started', external: true },
      { name: 'Open Source Guide', href: 'https://opensource.guide/', external: true },
      { name: 'First Contributions', href: 'https://firstcontributions.github.io/', external: true },
      { name: 'Good First Issues', href: 'https://goodfirstissues.com/', external: true }
    ]
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/yourusername',
      icon: Github,
      color: 'hover:text-gray-900 hover:bg-gray-100'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/yourprofile',
      icon: Linkedin,
      color: 'hover:text-blue-600 hover:bg-blue-50'
    },
    {
      name: 'Email',
      href: 'mailto:your-email@example.com',
      icon: Mail,
      color: 'hover:text-indigo-600 hover:bg-indigo-50'
    }
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4">
                <Code2 className="h-8 w-8" />
                <span className="text-xl font-bold">Open Source Buddy</span>
              </Link>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Your gateway to open source contributions. Discover beginner-friendly GitHub issues, 
                track your progress, and start your contribution journey with confidence.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl text-gray-600 transition-all duration-200 transform hover:scale-110 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-indigo-600 transition-colors text-sm flex items-center gap-1"
                      >
                        {link.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stay updated with open source trends
              </h3>
              <p className="text-gray-600 text-sm">
                Get the latest tips and resources for contributing to open source projects.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm min-w-64"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {currentYear} Open Source Buddy. Made with{' '}
                <Heart className="inline h-4 w-4 text-red-500 mx-1" />
                for the open source community.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                <ArrowUp className="h-4 w-4" />
                Back to top
              </button>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="py-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Built with React, Tailwind CSS, and Supabase. 
              <span className="mx-2">•</span>
              Deployed on Netlify.
              <span className="mx-2">•</span>
              <a 
                href="https://github.com/yourusername/open-source-buddy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View source code
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;