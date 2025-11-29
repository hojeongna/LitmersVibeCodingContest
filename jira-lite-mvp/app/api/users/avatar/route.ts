import { NextResponse } from 'next/server';
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';
import { adminStorage } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    // Verify auth
    const { user, error: authError } = await verifyFirebaseAuth();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: '파일이 없습니다' } },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
         { success: false, error: { code: 'BAD_REQUEST', message: '이미지 파일만 업로드 가능합니다' } },
         { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
       return NextResponse.json(
         { success: false, error: { code: 'BAD_REQUEST', message: '파일 크기는 5MB 이하여야 합니다' } },
         { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${user.uid}/avatar.${fileExt}`;
    
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);
    const uuid = crypto.randomUUID();

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=3600',
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });

    // Construct Firebase Storage Public URL
    const encodedPath = encodeURIComponent(fileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${uuid}`;

    return NextResponse.json({ success: true, data: { url: publicUrl } });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : '서버 오류' 
        } 
      },
      { status: 500 }
    );
  }
}
