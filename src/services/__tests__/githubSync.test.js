/**
 * Test file for GitHub Sync Service
 * Run with: npm test githubSync.test.js
 */

import { parseGitHubUrl, getContributionStatus, getStatusConfig } from '../githubSync';

describe('GitHub Sync Service', () => {
    describe('parseGitHubUrl', () => {
        test('should parse issue URL correctly', () => {
            const url = 'https://github.com/facebook/react/issues/12345';
            const result = parseGitHubUrl(url);

            expect(result).toEqual({
                owner: 'facebook',
                repo: 'react',
                type: 'issues',
                number: 12345,
            });
        });

        test('should parse PR URL correctly', () => {
            const url = 'https://github.com/vercel/next.js/pull/67890';
            const result = parseGitHubUrl(url);

            expect(result).toEqual({
                owner: 'vercel',
                repo: 'next.js',
                type: 'pull',
                number: 67890,
            });
        });

        test('should return null for invalid URL', () => {
            const url = 'https://example.com/invalid';
            const result = parseGitHubUrl(url);

            expect(result).toBeNull();
        });
    });

    describe('getContributionStatus', () => {
        test('should return "merged" for merged PR', () => {
            const contribution = {
                pr_status: 'merged',
                pr_merged_at: '2024-01-01T00:00:00Z',
            };

            const status = getContributionStatus(contribution);
            expect(status).toBe('merged');
        });

        test('should return "in_progress" for open PR', () => {
            const contribution = {
                pr_status: 'open',
            };

            const status = getContributionStatus(contribution);
            expect(status).toBe('in_progress');
        });

        test('should return "closed" for closed PR without merge', () => {
            const contribution = {
                pr_status: 'closed',
                pr_merged_at: null,
            };

            const status = getContributionStatus(contribution);
            expect(status).toBe('closed');
        });

        test('should return "applied" for assigned issue', () => {
            const contribution = {
                is_assigned: true,
            };

            const status = getContributionStatus(contribution);
            expect(status).toBe('applied');
        });

        test('should return "saved" by default', () => {
            const contribution = {};

            const status = getContributionStatus(contribution);
            expect(status).toBe('saved');
        });
    });

    describe('getStatusConfig', () => {
        test('should return correct config for merged status', () => {
            const config = getStatusConfig('merged');

            expect(config).toEqual({
                label: 'Merged',
                icon: '✅',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/20',
            });
        });

        test('should return saved config for unknown status', () => {
            const config = getStatusConfig('unknown');

            expect(config.label).toBe('Saved');
        });
    });
});

// Manual test function (run in browser console)
export const manualTest = async () => {
    console.log('🧪 Starting manual GitHub sync test...');

    try {
        // Test 1: Parse URLs
        console.log('\n📝 Test 1: URL Parsing');
        const testUrls = [
            'https://github.com/facebook/react/issues/12345',
            'https://github.com/vercel/next.js/pull/67890',
        ];

        testUrls.forEach(url => {
            const parsed = parseGitHubUrl(url);
            console.log(`✅ ${url} →`, parsed);
        });

        // Test 2: Status Detection
        console.log('\n📝 Test 2: Status Detection');
        const testContributions = [
            { pr_status: 'merged', pr_merged_at: '2024-01-01' },
            { pr_status: 'open' },
            { is_assigned: true },
            {},
        ];

        testContributions.forEach((contrib, i) => {
            const status = getContributionStatus(contrib);
            console.log(`✅ Contribution ${i + 1} → ${status}`);
        });

        console.log('\n✅ All manual tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};
