import { supabase } from '../utils/supabase';
import { 
  GENDER_OPTIONS,
  EDUCATION_OPTIONS, 
  REGION_OPTIONS, 
  DRINKING_FREQ_OPTIONS, 
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  JOB_OPTIONS,
  SMOKING_OPTIONS
} from '../enums/code';

// 로컬 정적 코드 맵
const STATIC_CODE_MAP: Record<string, { code: string; name: string }[]> = {
  'GENDER': GENDER_OPTIONS,
  'EDUCATION_LEVEL': EDUCATION_OPTIONS,
  'REGION': REGION_OPTIONS,
  'DRINKING': DRINKING_FREQ_OPTIONS,
  'RELIGION': RELIGION_OPTIONS,
  'MARITAL_STATUS': MARITAL_STATUS_OPTIONS,
  'JOB': JOB_OPTIONS,
  'SMOKING': SMOKING_OPTIONS,
};

/**
 * 공통 코드 조회 서비스
 * - 정적 코드: STATIC_CODE_MAP에서 즉시 반환
 * - 동적 코드(inquiry_type_cd 등): Supabase tb_code_group/tb_code 테이블에서 조회
 */
export const commonCodeService = {
  async getCodeListByGroup(codeGroupKey: string) {
    // 1. 정적 코드 우선 반환
    const staticOptions = STATIC_CODE_MAP[codeGroupKey];
    if (staticOptions) {
      const codes = staticOptions.map((opt, index) => ({
        codeId: opt.code,
        codeKey: opt.code,
        codeName: opt.name,
        codeValue: opt.code,
        sortNo: index + 1,
      }));
      return { data: { codeGroupKey, codes }, error: null };
    }

    // 2. DB 조회 (동적 코드)
    const { data: groupData, error: groupError } = await supabase
      .from('tb_code_group')
      .select('code_group_id')
      .eq('code_group_key', codeGroupKey)
      .eq('use_yn', 'Y')
      .single();

    if (groupError || !groupData) {
      return { data: { codeGroupKey, codes: [] }, error: groupError };
    }

    const { data: codeData, error: codeError } = await supabase
      .from('tb_code')
      .select('code_id, code_key, code_name, code_value, sort_no')
      .eq('code_group_id', groupData.code_group_id)
      .eq('use_yn', 'Y')
      .eq('del_yn', 'N')
      .order('sort_no', { ascending: true });

    if (codeError) {
      return { data: { codeGroupKey, codes: [] }, error: codeError };
    }

    const codes = (codeData || []).map(c => ({
      codeId: c.code_id,
      codeKey: c.code_key,
      codeName: c.code_name,
      codeValue: c.code_value,
      sortNo: c.sort_no,
    }));

    return { data: { codeGroupKey, codes }, error: null };
  }
};
