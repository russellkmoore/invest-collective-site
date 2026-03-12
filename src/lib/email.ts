/**
 * Email notification utilities using Web3Forms API
 */

interface MemberApplication {
  name: string;
  email: string;
  phone: string;
  years_investing: string;
  trading_style: string;
  areas_of_expertise: string;
  macro_knowledge: string;
  portfolio_size: string;
  investment_journey: string;
  expectations: string;
  referral_source?: string;
}

/**
 * Send email notification to admin when a new member applies
 */
export async function sendNewApplicationNotification(
  application: MemberApplication,
): Promise<{ success: boolean; error?: string }> {
  console.log('[EMAIL] Starting to send notification for:', application.email);

  try {
    // Build a message summary for Web3Forms (required field)
    const message = `
New Member Application

Name: ${application.name}
Email: ${application.email}
Phone: ${application.phone}

Years Investing: ${application.years_investing}
Trading Style: ${application.trading_style}
Areas of Expertise: ${application.areas_of_expertise}
Macro Knowledge: ${application.macro_knowledge}
Portfolio Size: ${application.portfolio_size}

Investing Experience:
${application.investment_journey}

Expectations:
${application.expectations}

Referral Source: ${application.referral_source || 'Not specified'}
    `.trim();

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      throw new Error('WEB3FORMS_ACCESS_KEY environment variable is not set');
    }

    const payload = {
      access_key: accessKey,
      subject: 'New Invest Collective Application',
      from_name: application.name,
      name: application.name,
      email: application.email,
      message, // Web3Forms requires this field
      // Include additional fields for reference
      phone: application.phone,
      yearsInvesting: application.years_investing,
      tradingStyle: application.trading_style,
      areasOfExpertise: application.areas_of_expertise,
      macroeconomicsKnowledge: application.macro_knowledge,
      portfolioSize: application.portfolio_size,
      investingExperience: application.investment_journey,
      expectations: application.expectations,
      referralSource: application.referral_source || 'Not specified',
    };

    console.log('[EMAIL] Sending payload to Web3Forms:', JSON.stringify(payload));

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[EMAIL] Response status:', response.status, response.statusText);

    // Get response as text first to handle non-JSON responses
    const responseText = await response.text();
    console.log('[EMAIL] Response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[EMAIL] Parsed JSON data:', JSON.stringify(data));
    } catch (parseError) {
      console.error('[EMAIL] Failed to parse response as JSON, got:', responseText.substring(0, 200));
      return {
        success: false,
        error: 'Web3Forms returned non-JSON response (possible error page)',
      };
    }

    if (!response.ok) {
      console.error('[EMAIL] HTTP error:', response.status, data);
      return {
        success: false,
        error: data?.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    if (!data.success) {
      console.error('[EMAIL] Web3Forms returned success=false:', data);
      return {
        success: false,
        error: data.message || 'Email service returned failure',
      };
    }

    console.log('[EMAIL] Email sent successfully!');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Exception caught:', error);
    console.error('[EMAIL] Error details:', {
      name: error instanceof Error ? error.name : 'unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to an approved member via Resend.
 * Instantiates Resend inside the function (not module scope) to avoid Worker context leakage.
 */
export async function sendWelcomeEmail(
  member: { name: string; email: string },
): Promise<{ success: boolean; error?: string }> {
  console.log('[EMAIL] Sending welcome email to:', member.email);

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[EMAIL] RESEND_API_KEY not set');
      return { success: false, error: 'Email service not configured (RESEND_API_KEY missing)' };
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: 'The Invest Collective <noreply@theinvestcollective.com>',
      to: member.email,
      subject: 'Welcome to The Invest Collective!',
      html: buildWelcomeEmailHtml(member.name),
    });

    if (error) {
      console.error('[EMAIL] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Welcome email sent successfully to:', member.email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] sendWelcomeEmail exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending welcome email',
    };
  }
}

function buildWelcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 8px;">Welcome to The Invest Collective!</h1>
  </div>

  <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>

  <p style="font-size: 16px; line-height: 1.6;">
    Congratulations! Your application to The Invest Collective has been approved. We're excited to have you join our community of investors who collaborate weekly to share insights, discuss strategies, and navigate the markets together.
  </p>

  <div style="background-color: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-top: 0;">Meeting Schedule</h2>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>Main Group Meeting:</strong> Every Friday at 10:30 AM Central
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>Leadership/Prep Sub-Group:</strong> Every Wednesday at 1:30 PM Central
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
      <strong>Format:</strong> Virtual via Google Meet
    </p>
  </div>

  <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h2 style="color: #166534; font-size: 20px; margin-top: 0;">How to Join Meetings</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      You'll receive a Google Meet invite for upcoming meetings. Simply click the link at the scheduled time to join. We recommend joining a few minutes early for your first session.
    </p>
  </div>

  <div style="background-color: #fefce8; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h2 style="color: #854d0e; font-size: 20px; margin-top: 0;">What to Expect</h2>
    <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>Market recap and key news discussion</li>
      <li>Member presentations on investment ideas</li>
      <li>Open Q&A and strategy sharing</li>
      <li>A welcoming, collaborative environment</li>
    </ul>
  </div>

  <p style="font-size: 16px; line-height: 1.6;">
    If you have any questions before your first meeting, don't hesitate to reach out. We look forward to seeing you!
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 32px;">
    Best regards,<br>
    <strong>The Invest Collective Team</strong>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    You received this email because your application to The Invest Collective was approved.
  </p>
</body>
</html>`;
}
