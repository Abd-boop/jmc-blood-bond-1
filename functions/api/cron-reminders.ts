// Cloudflare Pages Function / Worker: /api/cron-reminders
// Executes daily (scheduled via Cloudflare Cron: 0 6 * * *)
// Finds donors whose donation gap (default 90 days) has elapsed today,
// and inserts records into `notification_queue` for SMS/Email dispatch.

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CRON_SECRET?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // Authorize cron trigger or manual testing with secret token
    const authHeader = request.headers.get('Authorization') || '';
    const cronSecret = env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isCronEvent = request.headers.get('CF-Cron') !== null;
      if (!isCronEvent) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized cron execution.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const supabaseUrl = env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Mock execution: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured.',
        eligibleCount: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch donation gap setting from site_settings (default 90)
    let gapDays = 90;
    try {
      const settingsRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global&select=donation_gap_days`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json() as any[];
        if (settingsData[0]?.donation_gap_days) {
          gapDays = settingsData[0].donation_gap_days;
        }
      }
    } catch (_) {}

    // 2. Calculate target last_donation_date (Today - gapDays)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - gapDays);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // 3. Find donors who donated exactly gapDays ago and are currently active
    const donorsRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?last_donation_date=eq.${targetDateStr}&is_available=eq.true&select=id,full_name,phone,blood_group`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!donorsRes.ok) {
      const errText = await donorsRes.text();
      return new Response(JSON.stringify({ success: false, error: 'Failed to query donors: ' + errText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const eligibleDonors = await donorsRes.json() as any[];
    let queuedCount = 0;

    // 4. Insert each eligible donor into notification_queue
    const todayStr = new Date().toISOString().split('T')[0];
    for (const donor of eligibleDonors) {
      try {
        const queueRes = await fetch(`${supabaseUrl}/rest/v1/notification_queue`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donor_id: donor.id,
            notification_type: 'eligible_again',
            status: 'pending',
            scheduled_for: todayStr,
            payload: {
              donor_name: donor.full_name,
              phone: donor.phone,
              blood_group: donor.blood_group,
              message_en: `Hello ${donor.full_name}! Your ${gapDays}-day blood donation recovery period is complete. You are now eligible to save lives again with JMC Blood Bond!`,
              message_bn: `আসসালামু আলাইকুম ${donor.full_name}! আপনার রক্তদানের ${gapDays} দিন পূর্ণ হয়েছে। আপনি এখন পুনরায় যশোর মেডিকেল কলেজ রক্তদান ফোরামে রক্তদানের জন্য উপযুক্ত।`,
            },
          }),
        });
        if (queueRes.ok) queuedCount++;
      } catch (_) {}
    }

    // 5. Audit Log entry
    try {
      await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CRON_REMINDERS_PROCESSED',
          entity_type: 'notification_queue',
          details: {
            gap_days: gapDays,
            target_date: targetDateStr,
            eligible_count: eligibleDonors.length,
            queued_count: queuedCount,
          },
        }),
      });
    } catch (_) {}

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Cron job executed successfully. Found ${eligibleDonors.length} eligible donors, queued ${queuedCount} notifications.`,
      gapDays,
      targetDate: targetDateStr,
      queuedCount 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Cron execution failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

