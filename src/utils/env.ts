/**
 * 환경 변수 접근을 중앙 관리하는 유틸리티입니다.
 * 직접 import.meta.env를 사용하는 대신 이 유틸리티를 사용합니다.
 */

export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    API_BASE_URL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') as string,
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
};
