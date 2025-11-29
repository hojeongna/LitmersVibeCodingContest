import { NextResponse } from 'next/server';
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/auth/sync-profile
 * Ensures Firebase user exists in Supabase profiles table
 * Called after sign-in/sign-up to sync user data
 */
export async function POST() {
  try {
    // Verify Firebase authentication
    const { user, error: authError } = await verifyFirebaseAuth();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.uid)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.uid,
        email: user.email || '',
        name: user.name || user.email?.split('@')[0] || 'User',
        avatar_url: user.picture || null,
      });

      if (insertError) {
        console.error('Failed to create profile:', insertError);
        return NextResponse.json(
          { success: false, error: { code: 'DATABASE_ERROR', message: '프로필 생성 실패' } },
          { status: 500 }
        );
      }
    } else {
      // Update profile with latest Firebase data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: user.email || '',
          name: user.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.picture || null,
        })
        .eq('id', user.uid);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
      }
    }

    return NextResponse.json({ success: true, data: { synced: true } });
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/sync-profile:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
