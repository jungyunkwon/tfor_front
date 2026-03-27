import { supabase } from '../utils/supabase';

/**
 * TB_SURVEY_QUESTION, TB_SURVEY_OPTION, TB_USER_SURVEY_ANSWER 데이터를 처리하는 서비스 (API_GUIDE.md 231-283 기반)
 */
export const surveyService = {
  /**
   * 온보딩/설문용 질문 리스트 조회 (getSurveyQuestions)
   * TB_SURVEY_QUESTION (2-5) 테이블 조회
   */
  async getSurveyQuestions(groupCode: string) {
    const { data, error } = await supabase
      .from('tb_survey_question')
      .select(`
        survey_question_id,
        question_code,
        question_text,
        question_type_cd,
        required_yn,
        display_order,
        tb_survey_option (
          survey_option_id,
          option_text,
          option_value,
          display_order
        )
      `)
      .eq('question_group_cd', groupCode)
      .eq('active_yn', 'Y')
      .order('display_order', { ascending: true })
      .order('display_order', { foreignTable: 'tb_survey_option', ascending: true });

    return { data, error };
  },

  /**
   * 설문 응답 저장 (saveSurveyAnswers)
   * TB_USER_SURVEY_ANSWER (2-7) 테이블 UPSERT
   */
  async saveSurveyAnswers(answers: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    // API_GUIDE의 리스트 형태 응답 구조 준수
    const payload = answers.map(ans => ({
      user_id: user.id,
      survey_question_id: ans.surveyQuestionId,
      survey_option_id: ans.surveyOptionId || null,
      answer_text: ans.answerText || null,
      answer_number: ans.answerNumber || null,
      answer_json: ans.answerJson || null,
      submitted_dt: new Date().toISOString(),
      update_user: user.id
    }));

    const { data, error } = await supabase
      .from('tb_user_survey_answer')
      .upsert(payload, { onConflict: 'user_id,survey_question_id' }) // 복합키 conflict 처리
      .select();

    return { data, error };
  },

  /**
   * 사용자 설문 응답 결과 조회 (getUserSurveyResult)
   */
  async getUserSurveyResult() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_user_survey_answer')
      .select('survey_question_id, survey_option_id, answer_text, answer_json, submitted_dt')
      .eq('user_id', user.id);

    return { data, error };
  }
};
