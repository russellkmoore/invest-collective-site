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
