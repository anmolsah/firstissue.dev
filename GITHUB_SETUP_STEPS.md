# GitHub Integration Setup - Quick Steps

## Step 1: Create the Contributions Table in Supabase

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the entire content from: `supabase/migrations/create_contributions_table.sql`
5. Click "Run" to execute the SQL

**Verify**: Go to "Table Editor" and check if `contributions` table exists

## Step 2: Configure GitHub OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Find "GitHub" and enable it
3. You should already have GitHub OAuth configured (since login works)
4. Make sure these settings are correct:
   - **Enabled**: Yes
   - **Client ID**: Your GitHub OAuth App Client ID
   - **Client Secret**: Your GitHub OAuth App Client Secret

## Step 3: Test the Integration

1. Clear your browser cache and localStorage:

   ```javascript
   // Run in browser console
   localStorage.clear();
   ```

2. Logout and login again with GitHub

3. Navigate to `/status` page

4. You should see:
   - "Sync with GitHub" button
   - "Last synced" timestamp
   - Your GitHub contributions (if any)

## Step 4: Verify GitHub Token

After logging in, run this in browser console:

```javascript
// Check if GitHub token is available
const { data: { session } } = await supabase.auth.getSession();
console.log('GitHub Token:', session?.provider_token ? 'Present ✅' : 'Missing ❌');
console.log('User:', session?.user?.user_metadata);
```

If token is missing, you need to:

1. Logout
2. Clear localStorage
3. Login with GitHub again

## Step 5: Manual Sync Test

On the Status page, click "Sync Now" button and check browser console for:

- Any errors
- API calls to GitHub
- Data being stored in Supabase

## Troubleshooting

### Issue: "No GitHub token found"

**Solution**:

- Logout and login again with GitHub
- Make sure GitHub OAuth is properly configured in Supabase
- Check that `provider_token` is being stored

### Issue: Contributions table doesn't exist

**Solution**:

- Run the SQL migration from Step 1
- Check Supabase logs for any errors

### Issue: No contributions showing

**Solution**:

- Make sure you have actual GitHub contributions (assigned issues or PRs)
- Check browser console for errors
- Run health check: `await window.githubHealthCheck()`

### Issue: Still showing old Status page

**Solution**:

- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that App.jsx imports StatusPageNew

## Quick Health Check

Run this in browser console after logging in:

```javascript
// Import the health check
import { runHealthCheck } from './src/utils/githubIntegrationCheck.js';

// Run it
await runHealthCheck();
```

Or manually check:

```javascript
// 1. Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? '✅' : '❌');
console.log('Provider Token:', session?.provider_token ? '✅' : '❌');

// 2. Check contributions table
const { data, error } = await supabase.from('contributions').select('id').limit(1);
console.log('Contributions Table:', error ? '❌ ' + error.message : '✅');

// 3. Test GitHub API
if (session?.provider_token) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  console.log('GitHub API:', response.ok ? '✅' : '❌');
  const user = await response.json();
  console.log('GitHub Username:', user.login);
}
```

## Expected Result

After setup, you should see:

1. ✅ Status page with GitHub sync button
2. ✅ Your GitHub contributions automatically loaded
3. ✅ PR status badges (merged, open, closed)
4. ✅ Success rate calculation
5. ✅ No loading delays when navigating between pages (caching works)

---

**Need Help?** Check the browser console for errors and Supabase logs for any issues.
