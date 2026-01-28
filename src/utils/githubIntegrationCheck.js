/**
 * GitHub Integration Health Check
 * Use this to verify the integration is working correctly
 */

import { supabase } from "../lib/supabase";

/**
 * Check if GitHub OAuth is properly configured
 */
export const checkGitHubOAuth = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {
                status: 'error',
                message: 'No active session. User needs to login.',
            };
        }

        if (!session.provider_token) {
            return {
                status: 'error',
                message: 'No GitHub token found. User needs to login with GitHub.',
            };
        }

        return {
            status: 'success',
            message: 'GitHub OAuth is configured correctly.',
            token: session.provider_token ? '✅ Present' : '❌ Missing',
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Error checking OAuth: ${error.message}`,
        };
    }
};

/**
 * Check if contributions table exists and is accessible
 */
export const checkContributionsTable = async () => {
    try {
        const { data, error } = await supabase
            .from('contributions')
            .select('id')
            .limit(1);

        if (error) {
            return {
                status: 'error',
                message: `Table error: ${error.message}`,
            };
        }

        return {
            status: 'success',
            message: 'Contributions table is accessible.',
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Error checking table: ${error.message}`,
        };
    }
};

/**
 * Check GitHub API connectivity
 */
export const checkGitHubAPI = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.provider_token) {
            return {
                status: 'error',
                message: 'No GitHub token available.',
            };
        }

        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${session.provider_token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            return {
                status: 'error',
                message: `GitHub API error: ${response.status} ${response.statusText}`,
            };
        }

        const user = await response.json();

        return {
            status: 'success',
            message: 'GitHub API is accessible.',
            username: user.login,
            rateLimit: response.headers.get('X-RateLimit-Remaining'),
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Error checking GitHub API: ${error.message}`,
        };
    }
};

/**
 * Run all health checks
 */
export const runHealthCheck = async () => {
    console.log('🏥 Running GitHub Integration Health Check...\n');

    const checks = {
        oauth: await checkGitHubOAuth(),
        table: await checkContributionsTable(),
        api: await checkGitHubAPI(),
    };

    console.log('1️⃣ GitHub OAuth:', checks.oauth.status === 'success' ? '✅' : '❌');
    console.log('   ', checks.oauth.message);
    if (checks.oauth.token) console.log('    Token:', checks.oauth.token);

    console.log('\n2️⃣ Contributions Table:', checks.table.status === 'success' ? '✅' : '❌');
    console.log('   ', checks.table.message);

    console.log('\n3️⃣ GitHub API:', checks.api.status === 'success' ? '✅' : '❌');
    console.log('   ', checks.api.message);
    if (checks.api.username) console.log('    Username:', checks.api.username);
    if (checks.api.rateLimit) console.log('    Rate Limit Remaining:', checks.api.rateLimit);

    const allPassed = Object.values(checks).every(check => check.status === 'success');

    console.log('\n' + '='.repeat(50));
    console.log(allPassed ? '✅ All checks passed!' : '❌ Some checks failed!');
    console.log('='.repeat(50));

    return {
        allPassed,
        checks,
    };
};

/**
 * Get system status summary
 */
export const getSystemStatus = async () => {
    const { checks } = await runHealthCheck();

    return {
        oauth: checks.oauth.status === 'success',
        database: checks.table.status === 'success',
        api: checks.api.status === 'success',
        ready: Object.values(checks).every(check => check.status === 'success'),
    };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.githubHealthCheck = runHealthCheck;
    window.githubStatus = getSystemStatus;
}
