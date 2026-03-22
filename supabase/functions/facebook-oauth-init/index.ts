import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const APP_ID = Deno.env.get('FACEBOOK_APP_ID');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`;

  if (!APP_ID) {
    return new Response(JSON.stringify({ error: 'FACEBOOK_APP_ID not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let workspaceId = '';
  try {
    const body = await req.json();
    workspaceId = body.workspace_id ?? '';
  } catch (_) { /* no body */ }

  const state = btoa(JSON.stringify({ workspace_id: workspaceId, ts: Date.now() }));

  const scopes = [
    'ads_read',
    'ads_management',
    'business_management',
    'pages_show_list',
  ].join(',');

  const fbAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  fbAuthUrl.searchParams.set('client_id', APP_ID);
  fbAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  fbAuthUrl.searchParams.set('scope', scopes);
  fbAuthUrl.searchParams.set('state', state);
  fbAuthUrl.searchParams.set('response_type', 'code');

  return new Response(JSON.stringify({ auth_url: fbAuthUrl.toString() }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
