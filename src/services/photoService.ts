import { supabase } from '../utils/supabase';

/**
 * TB_PROFILE_PHOTO 데이터를 처리하는 서비스 (API_GUIDE.md 285-345 기반)
 */
export const photoService = {
  /**
   * 사진 업로드 (uploadProfilePhoto)
   * TB_PROFILE_PHOTO (2-4) 테이블 INSERT
   */
  async uploadProfilePhoto(photoPayload: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // API_GUIDE의 리스트 형태 응답 구조 준수
    const payload = {
      user_id: user.id,
      photo_type_cd: photoPayload.photoTypeCd || 'BASIC',
      storage_path: photoPayload.storagePath,
      thumbnail_path: photoPayload.thumbnailPath || null,
      mime_type: photoPayload.mimeType || 'image/jpeg',
      file_size: photoPayload.fileSize || 0,
      sort_no: photoPayload.sortNo || 1,
      main_photo_yn: photoPayload.mainPhotoYn || 'N',
      approval_status_cd: 'PENDING',
      visible_yn: 'Y',
      update_user: user.id
    };

    const { data, error } = await supabase
      .from('tb_profile_photo')
      .insert(payload)
      .select()
      .single();

    return { data, error };
  },

  /**
   * 내 사진 리스트 조회 (getMePhotos)
   */
  async getMePhotos() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_profile_photo')
      .select('*')
      .eq('user_id', user.id)
      .eq('visible_yn', 'Y')
      .order('sort_no', { ascending: true });

    return { data, error };
  },

  /**
   * 메인 사진 업데이트 (updateMainPhoto)
   */
  async updateMainPhoto(profilePhotoId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 1. 기존 메인 사진 N으로 비활성화
    await supabase.from('tb_profile_photo').update({ main_photo_yn: 'N' }).eq('user_id', user.id);
    
    // 2. 신규 사진을 메인으로 설정
    const { data, error } = await supabase
      .from('tb_profile_photo')
      .update({ main_photo_yn: 'Y', update_user: user.id })
      .eq('profile_photo_id', profilePhotoId)
      .select();

    return { data, error };
  }
};
