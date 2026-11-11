import React from 'react';

const ComparisonSection = () => {
  const platforms = [
    {
      name: 'FirstIssue.dev',
      highlighted: true,
      function: 'Discovery & PR Verification',
      features: {
        languageFiltering: true,
        difficultyLabels: true,
        statusTracking: true,
        personalStats: true,
        educationalRoadmaps: true,
      },
    },
    {
      name: 'GoodFirstIssue.dev',
      function: 'Issue Aggregation',
      features: {
        languageFiltering: true,
        difficultyLabels: true,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false,
      },
    },
    {
      name: 'Up-for-Grabs.net',
      function: 'Project Directory',
      features: {
        languageFiltering: true,
        difficultyLabels: false,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false,
      },
    },
    {
      name: 'CodeTriage',
      function: 'Email Digests',
      features: {
        languageFiltering: true,
        difficultyLabels: false,
        statusTracking: false,
        personalStats: false,
        educationalRoadmaps: false,
      },
    },
  ];

  const featureLabels = [
    { key: 'function', label: 'Primary Role' },
    { key: 'languageFiltering', label: 'Language Filtering' },
    { key: 'difficultyLabels', label: 'Starter & Difficulty Tags' },
    { key: 'statusTracking', label: 'Live PR Status Tracking' },
    { key: 'personalStats', label: 'Verified Proof of Work' },
    { key: 'educationalRoadmaps', label: 'Repo Setup Kits & Docs' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#22242A] bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F4F0] mb-2 text-balance">
            How FirstIssue.dev compares to standard directories
          </h2>
          <p className="text-[#A8ADB6] text-xs sm:text-sm leading-relaxed text-pretty">
            Standard issue aggregators stop at links. FirstIssue.dev pairs active tickets with Contribution Kits and verified merge credentials.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-[#141518] border border-[#2B2E36] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B2E36] bg-[#17181B]">
                  <th className="p-4 text-xs font-mono font-semibold uppercase tracking-wider text-[#A8ADB6] min-w-[220px]">
                    Capability
                  </th>
                  {platforms.map((platform) => (
                    <th
                      key={platform.name}
                      className={`p-4 text-center border-l border-[#22242A] min-w-[180px] ${
                        platform.highlighted ? 'bg-[#1C1E23]' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold ${
                            platform.highlighted ? 'text-[#F4F4F0]' : 'text-[#A8ADB6]'
                          }`}
                        >
                          {platform.name}
                        </span>
                        {platform.highlighted && (
                          <span className="text-xs font-mono text-[#0F0F0F] font-semibold px-2 py-0.5 bg-[#DAFA9C] rounded-[4px]">
                            COMPLETE WORKFLOW
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
                    key={feature.key}
                    className={`${
                      idx !== featureLabels.length - 1
                        ? 'border-b border-[#22242A]'
                        : ''
                    } hover:bg-[#17181B] transition-colors`}
                  >
                    <td className="p-4 text-xs font-medium text-[#F4F4F0]">
                      {feature.label}
                    </td>
                    {platforms.map((platform) => (
                      <td
                        key={`${platform.name}-${feature.key}`}
                        className={`p-4 text-center border-l border-[#22242A] ${
                          platform.highlighted ? 'bg-[#1C1E23]/60' : ''
                        }`}
                      >
                        {feature.key === 'function' ? (
                          <span
                            className={`text-xs font-mono ${
                              platform.highlighted
                                ? 'text-[#DAFA9C] font-semibold'
                                : 'text-[#8C929C]'
                            }`}
                          >
                            {platform.function}
                          </span>
                        ) : platform.features[feature.key] ? (
                          <span className="text-[#34D399] font-semibold text-sm" aria-label="Included">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[#8C929C] font-mono text-sm" aria-label="Not included">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`rounded-[4px] border p-5 ${
                platform.highlighted
                  ? 'bg-[#17181B] border-[#DAFA9C]/60'
                  : 'bg-[#141518] border-[#22242A]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#22242A]">
                <h3 className="text-base font-semibold text-[#F4F4F0]">
                  {platform.name}
                </h3>
                {platform.highlighted && (
                  <span className="text-xs font-mono text-[#0F0F0F] font-semibold px-2 py-0.5 bg-[#DAFA9C] rounded-[4px]">
                    COMPLETE WORKFLOW
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {featureLabels.map((feature, fIdx) => (
                  <div
                    key={feature.key}
                    className={`flex items-center justify-between py-1.5 ${
                      fIdx !== featureLabels.length - 1
                        ? 'border-b border-[#22242A]'
                        : ''
                    }`}
                  >
                    <span className="text-xs text-[#A8ADB6]">
                      {feature.label}
                    </span>
                    {feature.key === 'function' ? (
                      <span className="text-xs font-mono font-medium text-[#F4F4F0]">
                        {platform.function}
                      </span>
                    ) : platform.features[feature.key] ? (
                      <span className="text-[#34D399] font-semibold text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[#8C929C] text-xs">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
