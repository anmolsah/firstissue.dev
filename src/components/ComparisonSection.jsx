import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

const ComparisonSection = () => {
  const platforms = [
    {
      name: 'FirstIssue.dev',
      highlighted: true,
      function: 'Discovery & Tracking',
      features: {
        languageFiltering: true,
        difficultyLabels: true,
        statusTracking: true,
        personalStats: true,
        educationalRoadmaps: true
      }
    },
    {
      name: 'GoodFirstIssue.dev',
      function: 'Issue Aggregation',
      features: {
        languageFiltering: true,
        difficultyLabels: true,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false
      }
    },
    {
      name: 'Up-for-Grabs.net',
      function: 'Project Curation',
      features: {
        languageFiltering: true,
        difficultyLabels: false,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false
      }
    },
    {
      name: 'CodeTriage',
      function: 'Email Subscriptions',
      features: {
        languageFiltering: true,
        difficultyLabels: false,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false
      }
    }
  ];

  const featureLabels = [
    { key: 'function', label: 'Primary Function' },
    { key: 'languageFiltering', label: 'Language Filtering' },
    { key: 'difficultyLabels', label: 'Difficulty Labels' },
    { key: 'statusTracking', label: 'Status Tracking' },
    { key: 'personalStats', label: 'Personal Stats Profile' },
    { key: 'educationalRoadmaps', label: 'Educational Roadmaps' }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Feature Comparison Matrix
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            To choose the right tool, evaluate how they handle your workflow from discovery to completion.
          </p>
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden lg:block bg-[#15161E] rounded-2xl border border-white/10 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-6 text-white font-bold text-lg bg-[#0B0C10] min-w-[200px]">
                    Feature / Platform
                  </th>
                  {platforms.map((platform, idx) => (
                    <th
                      key={idx}
                      className={`p-6 text-center border-l border-white/10 min-w-[180px] ${
                        platform.highlighted
                          ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20'
                          : ''
                      }`}
                    >
                      {platform.highlighted ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-bold text-lg">{platform.name}</span>
                          <span className="text-xs text-blue-400 font-semibold px-2 py-1 bg-blue-500/20 rounded-full">
                            RECOMMENDED
                          </span>
                        </div>
                      ) : (
                        <span className="text-white font-semibold">{platform.name}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureLabels.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`${idx !== featureLabels.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
                  >
                    <td className="p-6 text-white font-medium bg-[#0B0C10]">
                      {feature.label}
                    </td>
                    {platforms.map((platform, pIdx) => (
                      <td key={pIdx} className="p-6 text-center border-l border-white/10">
                        {feature.key === 'function' ? (
                          <span className={platform.highlighted ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                            {platform.function}
                          </span>
                        ) : (
                          <div className={`w-6 h-6 rounded-full ${platform.features[feature.key] ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center mx-auto`}>
                            <span className="text-white text-sm">{platform.features[feature.key] ? '✓' : '✗'}</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View - Visible only on Mobile/Tablet */}
        <div className="lg:hidden space-y-4 sm:space-y-6 mb-12">
          {platforms.map((platform, idx) => (
            <div
              key={idx}
              className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${
                platform.highlighted
                  ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/50 border-2'
                  : 'bg-[#15161E] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  {platform.highlighted && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{platform.name}</h3>
                    {platform.highlighted && (
                      <span className="inline-block mt-1 text-xs text-blue-400 font-semibold px-2 py-1 bg-blue-500/20 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {featureLabels.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className={`flex items-center justify-between py-2 ${
                      fIdx !== featureLabels.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <span className={`text-sm ${platform.highlighted ? 'text-gray-200' : 'text-gray-400'}`}>
                      {feature.label}
                    </span>
                    {feature.key === 'function' ? (
                      <span className={`text-sm font-medium ${platform.highlighted ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {platform.function}
                      </span>
                    ) : (
                      <div className={`w-6 h-6 rounded-full ${platform.features[feature.key] ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs">{platform.features[feature.key] ? '✓' : '✗'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">
            FirstIssue.dev is the only platform that combines discovery, tracking, and personal growth in one place.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
          >
            Start Your Journey
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
