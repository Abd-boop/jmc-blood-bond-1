// Cloudflare Pages Function: /api/verify-turnstile
interface Env {
  CLOUDFLARE_TURNSTILE_SECRET_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { token?: string };

    const token = body.token;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Turnstile verification token.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const secretKey = env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'; // test fallback
    const clientIp = request.headers.get('CF-Connecting-IP') || '';

    // Verify token with Cloudflare Turnstile Siteverify API
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verifyData = await verifyRes.json() as { success: boolean; 'error-codes'?: string[] };

    if (!verifyData.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cloudflare Turnstile verification failed. Please try again.',
        codes: verifyData['error-codes']
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Human verification successful.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

