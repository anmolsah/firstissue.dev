# Edge Function Deployment Guide

## Deploy via Supabase Dashboard

### Step 1: Access Edge Functions

1. Go to your Supabase Dashboard: <https://supabase.com/dashboard>
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar

### Step 2: Create New Function

1. Click **"Create a new function"** button
2. Function name: `sync-github`
3. Click **"Create function"**

### Step 3: Copy Function Code

1. Open the file: `supabase/functions/sync-github/index.ts`
2. Copy the entire content
3. In the Supabase dashboard, paste the code into the editor
4. Click **"Deploy"** button

### Step 4: Verify Deployment

1. After deployment, you'll see the function listed
2. Note the function URL (format: `https://<project-ref>.supabase.co/functions/v1/sync-github`)
3. Status should show as "Active"

### Step 5: Test the Function

1. In your app, login with GitHub
2. Navigate to your profile or bookmarks page
3. Click the sync button
4. Check the browser console for success/error messages

## Environment Variables (Already Configured)

The edge function automatically has access to:

- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not used in this function)

No additional environment variables needed!

## Benefits of Edge Function

✅ **Faster**: Runs closer to GitHub API servers
✅ **Secure**: GitHub token never exposed to client
✅ **Efficient**: Reduces client bandwidth usage
✅ **Reliable**: Better error handling and rate limit management
✅ **Scalable**: Handles concurrent requests efficiently

## Troubleshooting

### Function not found error

- Ensure function name is exactly `sync-github`
- Check that deployment was successful
- Verify function is "Active" in dashboard

### Authentication errors

- User must be logged in with GitHub OAuth
- Check that GitHub provider is enabled in Authentication settings
- Verify provider_token is being stored (check Auth settings)

### Rate limit errors

- GitHub API has rate limits (5000 requests/hour for authenticated users)
- Edge function automatically handles rate limits
- Consider implementing caching on frontend

## Monitoring

1. Go to **Edge Functions** → **sync-github**
2. Click **"Logs"** tab to see:
   - Function invocations
   - Errors and stack traces
   - Console.log outputs
   - Execution time

## Alternative: Deploy via CLI (Optional)

If you prefer using the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Deploy function
supabase functions deploy sync-github
```
