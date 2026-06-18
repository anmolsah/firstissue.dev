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
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Feature Comparison Matrix
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            To choose the right tool, evaluate how they handle your workflow from discovery to completion.
          </p>
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden lg:block bg-transparent border border-zinc-800/60 rounded-xl overflow-hidden mb-12 max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.01] min-w-[200px]">
                    Feature / Platform
                  </th>
                  {platforms.map((platform, idx) => (
                    <th
                      key={idx}
                      className="p-4 text-center border-l border-zinc-800/60 min-w-[180px] bg-white/[0.01]"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-sm font-extrabold ${platform.highlighted ? "text-white" : "text-zinc-400"}`}>
                          {platform.name}
                        </span>
                        {platform.highlighted && (
                          <span className="text-[9px] text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureLabels.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`${idx !== featureLabels.length - 1 ? 'border-b border-zinc-800/60' : ''} hover:bg-white/[0.01] transition-colors`}
                  >
                    <td className="p-4 text-xs font-semibold text-zinc-300">
                      {feature.label}
                    </td>
                    {platforms.map((platform, pIdx) => (
                      <td key={pIdx} className="p-4 text-center border-l border-zinc-800/60 text-zinc-300">
                        {feature.key === 'function' ? (
                          <span className={platform.highlighted ? 'text-white font-bold text-xs' : 'text-zinc-500 text-xs'}>
                            {platform.function}
                          </span>
                        ) : (
                          <div className="flex items-center justify-center">
                            {platform.features[feature.key] ? (
                              <span className="text-emerald-400 font-bold text-sm">✓</span>
                            ) : (
                              <span className="text-zinc-600 font-bold text-sm">—</span>
                            )}
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
        <div className="lg:hidden space-y-4 mb-12 max-w-xl mx-auto">
          {platforms.map((platform, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-5 ${
                platform.highlighted
                  ? 'bg-white/[0.02] border-zinc-700/80 shadow-lg'
                  : 'bg-transparent border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">{platform.name}</h3>
                  {platform.highlighted && (
                    <span className="inline-block mt-1 text-[9px] text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      RECOMMENDED
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {featureLabels.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className={`flex items-center justify-between py-1.5 ${
                      fIdx !== featureLabels.length - 1 ? 'border-b border-zinc-900/60' : ''
                    }`}
                  >
                    <span className="text-xs text-zinc-400">
                      {feature.label}
                    </span>
                    {feature.key === 'function' ? (
                      <span className="text-xs font-semibold text-white">
                        {platform.function}
                      </span>
                    ) : (
                      <div className="flex items-center">
                        {platform.features[feature.key] ? (
                          <span className="text-emerald-400 font-bold text-xs">✓</span>
                        ) : (
                          <span className="text-zinc-600 font-bold text-xs">—</span>
                        )}
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
          <p className="text-xs text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">
            FirstIssue.dev combines discovery, tracking, and personal growth in one place.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded transition-all duration-200"
          >
            Start Your Journey
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
