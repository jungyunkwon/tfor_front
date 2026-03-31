import { supabase } from '../utils/supabase';

/**
 * TB_PROFILE_PHOTO 데이터를 처리하는 서비스 (API_GUIDE.md 285-363 기반)
 */
export const photoService = {
  /**
   * 내 프로필 사진 목록 조회 (getMyPhotoList)
   */
  async getMyPhotoList() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_profile_photo')
      .select('profile_photo_id, photo_type_cd, storage_path, thumbnail_path, sort_no, main_photo_yn, approval_status_cd, visible_yn')
      .eq('user_id', user.id)
      .eq('visible_yn', 'Y')
      .order('sort_no', { ascending: true });

    if (error) return { data: null, error };

    return { 
      data: {
        photoList: data?.map(p => ({
          profilePhotoId: p.profile_photo_id,
          photoTypeCd: p.photo_type_cd,
          storagePath: p.storage_path,
          thumbnailPath: p.thumbnail_path,
          sortNo: p.sort_no,
          mainPhotoYn: p.main_photo_yn,
          approvalStatusCd: p.approval_status_cd,
          visibleYn: p.visible_yn
        }))
      }, 
      error: null 
    };
  },

  /**
   * 프로필 사진 업로드 메타 데이터 저장 (uploadProfilePhoto)
   */
  async uploadProfilePhoto(photoPayload: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

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

    if (error) return { data: null, error };

    return { 
      data: {
        success: true,
        profilePhotoId: data.profile_photo_id,
        approvalStatusCd: data.approval_status_cd
      }, 
      error: null 
    };
  },

  /**
   * 프로필 사진 삭제 처리 (deleteProfilePhoto)
   */
  async deleteProfilePhoto(profilePhotoId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { error } = await supabase
      .from('tb_profile_photo')
      .update({ visible_yn: 'N', update_user: user.id })
      .eq('profile_photo_id', profilePhotoId)
      .eq('user_id', user.id);

    return { 
      data: { success: !error }, 
      error 
    };
  },

  /**
   * 사진 정렬 순서 및 대표 사진 변경 (updatePhotoOrder)
   */
  async updatePhotoOrder(photos: { profilePhotoId: string, sortNo: number, mainPhotoYn: string }[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // 트랜잭션이 지원되지 않는 경우 개별 업데이트 또는 RPC 사용 가능하지만 가이드에 따라 개별 처리 예시
    const updates = photos.map(p => 
      supabase
        .from('tb_profile_photo')
        .update({ sort_no: p.sortNo, main_photo_yn: p.mainPhotoYn, update_user: user.id })
        .eq('profile_photo_id', p.profilePhotoId)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    return { 
      data: { success: !hasError }, 
      error: hasError ? results.find(r => r.error)?.error : null 
    };
  }
};
