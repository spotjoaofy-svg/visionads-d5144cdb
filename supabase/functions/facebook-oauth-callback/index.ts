import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const APP_ID = Deno.env.get('FACEBOOK_APP_ID')!;
  const APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')!;
  const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`;

  // Redirect target (the app's Settings page)
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://visionads.lovable.app';
  const settingsUrl = `${appOrigin}/settings`;

  if (error) {
    return Response.redirect(`${settingsUrl}?fb_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code) {
    return Response.redirect(`${settingsUrl}?fb_error=missing_code`, 302);
  }

  // Parse state to get workspace_id
  let workspaceId = '';
  try {
    const decoded = JSON.parse(atob(state ?? ''));
    workspaceId = decoded.workspace_id ?? '';
  } catch (_) {
    return Response.redirect(`${settingsUrl}?fb_error=invalid_state`, 302);
  }

  // Exchange code for access token
  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', APP_ID);
  tokenUrl.searchParams.set('client_secret', APP_SECRET);
  tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  tokenUrl.searchParams.set('code', code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return Response.redirect(`${settingsUrl}?fb_error=${encodeURIComponent(tokenData.error.message)}`, 302);
  }

  const accessToken = tokenData.access_token;

  // Fetch ad accounts from Meta Graph API
  const adAccountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_id,currency,account_status&access_token=${accessToken}`
  );
  const adAccountsData = await adAccountsRes.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (adAccountsData.data && workspaceId) {
    for (const acct of adAccountsData.data) {
      await supabase.from('ad_accounts').upsert({
        workspace_id: workspaceId,
        platform: 'meta',
        account_name: acct.name ?? acct.id,
        account_external_id: acct.account_id ?? acct.id.replace('act_', ''),
        is_connected: true,
      }, { onConflict: 'workspace_id,platform,account_external_id' });
    }
  }

  return Response.redirect(`${settingsUrl}?fb_success=1`, 302);
});
