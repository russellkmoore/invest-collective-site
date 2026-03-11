'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { sendNewApplicationNotification } from '@/lib/email';

export async function saveApplication(formData: FormData) {
  try {
    const { env } = getCloudflareContext();
    const { DB } = env;

    // Validate Turnstile bot protection token (soft-fail if secret not configured in dev)
    const turnstileToken = formData.get('cf-turnstile-response') as string | null;
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return { success: false, error: 'Bot verification required. Please complete the challenge.' };
      }
      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      });
      const result = await verifyResponse.json() as { success: boolean };
      if (!result.success) {
        return { success: false, error: 'Bot verification failed. Please try again.' };
      }
    }

    // Extract all form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const years_investing = formData.get('yearsInvesting') as string;
    const trading_style = formData.get('tradingStyle') as string;
    const areas_of_expertise = formData.get('areasOfExpertise') as string;
    const macro_knowledge = formData.get('macroKnowledge') as string;
    const portfolio_size = formData.get('portfolioSize') as string;
    const investment_journey = formData.get('investmentJourney') as string;
    const expectations = formData.get('expectations') as string;
    const referral_source = formData.get('referralSource') as string;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !years_investing ||
      !trading_style ||
      !areas_of_expertise ||
      !macro_knowledge ||
      !portfolio_size ||
      !investment_journey ||
      !expectations
    ) {
      return {
        success: false,
        error: 'Please fill in all required fields',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    // Insert into database
    try {
      await DB.prepare(
        `INSERT INTO members (
          name, email, phone, years_investing, trading_style,
          areas_of_expertise, macro_knowledge, portfolio_size,
          investment_journey, expectations, referral_source, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      )
        .bind(
          name,
          email,
          phone,
          years_investing,
          trading_style,
          areas_of_expertise,
          macro_knowledge,
          portfolio_size,
          investment_journey,
          expectations,
          referral_source || null,
        )
        .run();
    } catch (dbError: any) {
      // Check for unique constraint violation (duplicate email)
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return {
          success: false,
          error: 'An application with this email address already exists',
        };
      }
      throw dbError; // Re-throw other DB errors
    }

    // Send email notification to admin (best effort - don't fail if this fails)
    console.log('[SIGNUP] About to send email notification');
    const emailResult = await sendNewApplicationNotification({
      name,
      email,
      phone,
      years_investing,
      trading_style,
      areas_of_expertise,
      macro_knowledge,
      portfolio_size,
      investment_journey,
      expectations,
      referral_source: referral_source || undefined,
    });

    console.log('[SIGNUP] Email result:', emailResult);

    if (!emailResult.success) {
      console.error('[SIGNUP] Failed to send email notification:', emailResult.error);
      // Continue anyway - the application is saved in the database
    }

    return {
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you soon.',
    };
  } catch (error) {
    console.error('Error saving application:', error);
    return {
      success: false,
      error: 'An error occurred while submitting your application. Please try again.',
    };
  }
}
