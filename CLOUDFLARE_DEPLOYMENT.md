# Cloudflare Pages Deployment Guide

This guide explains how to deploy your portfolio site with the secure Gemini AI integration to Cloudflare Pages.

## Why Cloudflare Pages?

Your API key was previously exposed in the client-side code. Cloudflare Pages Functions allow you to:
- Keep the API key server-side (secure)
- Proxy requests to Gemini API
- Maintain all existing functionality (streaming, history, markdown)
- Use the free tier (100,000 requests/day)

## Prerequisites

- GitHub account with your repository
- Google AI Studio account with Gemini API key
- Cloudflare account (free signup)

## Step 1: Get a New API Key

⚠️ **IMPORTANT**: Your old API key `` is exposed in your public repository and must be revoked.

1. Go to https://aistudio.google.com/app/apikey
2. **Revoke the old key** (click the trash icon)
3. Click "Create API key"
4. Select "Create API key in new project" (or choose existing project)
5. Copy the new key (starts with `AIzaSy...`)
6. Save it somewhere safe (you'll need it in Step 4)

## Step 2: Sign Up for Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Click "Sign up" if you don't have an account
3. Complete the registration process
4. Verify your email address

## Step 3: Connect Your GitHub Repository

1. Click "Create a project"
2. Click "Connect to Git"
3. Select "GitHub" as your provider
4. Authorize Cloudflare to access your GitHub account
5. Select the repository: `uttamdeb/uttamdeb.github.io`
6. Click "Begin setup"

## Step 4: Configure Build Settings

In the build configuration screen:

- **Project name**: `uttamdeb-portfolio` (or any name you prefer)
- **Production branch**: `main` (or `master` if that's your default)
- **Framework preset**: None
- **Build command**: (leave empty)
- **Build output directory**: `/` (root directory)

Click "Save and Deploy"

## Step 5: Add Environment Variable

⚠️ **This is the critical step for security!**

1. Wait for the initial deployment to complete
2. Go to your project dashboard
3. Click "Settings" tab
4. Click "Environment variables" in the left sidebar
5. Click "Add variable"
6. Enter:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: Paste your new API key from Step 1
   - **Environment**: Select "Production" (and "Preview" if you want)
7. Click "Save"

## Step 6: Redeploy

After adding the environment variable:

1. Go to "Deployments" tab
2. Click the "..." menu on the latest deployment
3. Click "Retry deployment"
4. Wait for the deployment to complete (usually 1-2 minutes)

## Step 7: Test Your Site

1. Copy the Cloudflare Pages URL (e.g., `https://uttamdeb-portfolio.pages.dev`)
2. Open it in your browser
3. Click the chat button (tenten icon)
4. Send a test message
5. Verify you get a streaming response

### What to Check:

- ✅ Chat opens without errors
- ✅ Messages stream in real-time
- ✅ Console shows "Using secure proxy at: /api/gemini"
- ✅ Console shows "Sending via proxy..."
- ✅ Markdown, code blocks, and math equations render correctly
- ✅ Multi-turn conversations work (history maintained)

## Step 8: Update DNS (Optional)

If you want to use your custom domain (uttamdeb.github.io):

### Option A: Keep GitHub Pages for Now

You can keep your site on GitHub Pages and test the Cloudflare version separately using the `.pages.dev` domain.

### Option B: Move to Cloudflare Completely

1. In Cloudflare Pages, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter `uttamdeb.github.io`
4. Follow the DNS configuration instructions
5. Update your domain's nameservers to Cloudflare's

⚠️ **Note**: If you move to Cloudflare, you'll need to update the CORS origin in `/functions/api/gemini.js`:

```javascript
'Access-Control-Allow-Origin': 'https://your-custom-domain.com',
```

## Step 9: Update CORS (If Using Custom Domain)

If you're using a custom domain, update the proxy function:

1. Edit `/functions/api/gemini.js`
2. Change line 7:
   ```javascript
   'Access-Control-Allow-Origin': 'https://your-custom-domain.com',
   ```
3. Commit and push to GitHub
4. Cloudflare will automatically redeploy

## Step 10: Clean Up Git History (Optional but Recommended)

Your old API key is still in your repository's history. To remove it:

### Using BFG Repo-Cleaner (Recommended)

```bash
# Download BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror https://github.com/uttamdeb/uttamdeb.github.io.git

# Remove the API key
cd uttamdeb.github.io.git
bfg --replace-text <(echo 'AIzaSyAIMk_ghkY5AnmkijKnBEPrkMLRQIp-UVs==>REMOVED')

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

### Using git filter-branch (Alternative)

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch assets/config/gemini-config.js" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

⚠️ **Warning**: Force pushing rewrites history. Notify any collaborators.

## Troubleshooting

### Error: "Proxy error: 500"

- Check that the environment variable `GEMINI_API_KEY` is set correctly
- Verify the API key is valid at https://aistudio.google.com/app/apikey
- Check Cloudflare Functions logs in the dashboard

### Error: "CORS policy blocked"

- Ensure the CORS origin in `/functions/api/gemini.js` matches your domain
- Clear browser cache and try again
- Check browser console for exact error message

### Streaming doesn't work

- Verify the proxy function is returning `text/event-stream` content type
- Check that the `Content-Type` header is set correctly in the response
- Test with a simple message first

### Chat doesn't open

- Check browser console for JavaScript errors
- Verify all JavaScript files are loading correctly
- Test on a different browser

### Old API key still showing in code

- Make sure you pulled the latest changes from the repository
- Clear browser cache (Cmd+Shift+R on macOS)
- Check that you're viewing the Cloudflare Pages site, not GitHub Pages

## Security Checklist

Before considering your site secure:

- [ ] New API key created in Google AI Studio
- [ ] Old API key revoked in Google AI Studio
- [ ] Environment variable added in Cloudflare Pages
- [ ] Site tested and working with proxy
- [ ] Console shows "Using secure proxy" (not direct API)
- [ ] Browser DevTools → Network tab shows POST to `/api/gemini`
- [ ] No API key visible in browser DevTools → Sources
- [ ] Git history cleaned (optional but recommended)

## Free Tier Limits

Cloudflare Pages Free Tier:
- 500 builds per month
- Unlimited requests
- Unlimited bandwidth
- 100,000 Functions requests per day

Gemini API Free Tier:
- 15 requests per minute
- 1 million tokens per day
- 1,500 requests per day

These limits should be more than sufficient for a portfolio site.

## Support

If you encounter issues:

1. Check Cloudflare Pages documentation: https://developers.cloudflare.com/pages/
2. Check Gemini API documentation: https://ai.google.dev/docs
3. Review Cloudflare Functions logs in your dashboard
4. Check browser console for client-side errors

## Next Steps

Once deployed successfully:

1. Update your README.md with the new deployment information
2. Add a note about the secure architecture
3. Consider adding rate limiting to the proxy function
4. Monitor your Gemini API usage in Google AI Studio
5. Set up Cloudflare Analytics to track site usage

---

**Remember**: Never commit API keys to your repository again. Always use environment variables for sensitive data!
