'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { members } from '../../../drizzle/schema';
import { signupSchema } from '@/lib/validation-schemas';
import { sendNewApplicationNotification } from '@/lib/email';

/**
 * Process a new member signup application.
 * Validates the Cloudflare Turnstile token (soft-fail when key not configured in dev),
 * validates all form fields with Zod signupSchema, then inserts into D1 via Drizzle.
 * Sends an admin notification email on success (best-effort; failure doesn't block save).
 */
export async function saveApplication(formData: FormData) {
  try {
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

    // Parse and validate all form fields with Zod
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      years_investing: formData.get('yearsInvesting'),
      trading_style: formData.get('tradingStyle'),
      areas_of_expertise: formData.get('areasOfExpertise'),
      macro_knowledge: formData.get('macroKnowledge'),
      portfolio_size: formData.get('portfolioSize'),
      investment_journey: formData.get('investmentJourney'),
      expectations: formData.get('expectations'),
      referral_source: formData.get('referralSource'),
      // Supply a dummy value to satisfy the schema; Turnstile already validated above
      turnstile_token: turnstileToken ?? 'server-validated',
    };

    const parsed = signupSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Please fill in all required fields',
      };
    }

    const data = parsed.data;
    const db = getDb();

    // Insert into database
    try {
      await db.insert(members).values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        years_investing: data.years_investing,
        trading_style: data.trading_style,
        areas_of_expertise: data.areas_of_expertise,
        macro_knowledge: data.macro_knowledge,
        portfolio_size: data.portfolio_size,
        investment_journey: data.investment_journey,
        expectations: data.expectations,
        referral_source: data.referral_source ?? null,
        status: 'pending',
      });
    } catch (dbError: unknown) {
      // Check for unique constraint violation (duplicate email)
      const msg = dbError instanceof Error ? dbError.message : '';
      if (msg.includes('UNIQUE constraint failed')) {
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      years_investing: data.years_investing,
      trading_style: data.trading_style,
      areas_of_expertise: data.areas_of_expertise,
      macro_knowledge: data.macro_knowledge,
      portfolio_size: data.portfolio_size,
      investment_journey: data.investment_journey,
      expectations: data.expectations,
      referral_source: data.referral_source ?? undefined,
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
