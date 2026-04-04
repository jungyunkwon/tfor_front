import { supabase } from '../utils/supabase';

/**
 * TB_SURVEY_QUESTION, TB_SURVEY_OPTION, TB_USER_SURVEY_ANSWER 데이터를 처리하는 서비스 (API_GUIDE.md 231-283 기반)
 */
export const surveyService = {
  /**
   * 온보딩/설문용 질문 리스트 조회 (getSurveyQuestions)
   */
  async getSurveyQuestions(groupCode: string, includeAdminOnly: boolean = false) {
    let query = supabase
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
      .eq('active_yn', 'Y');
    
    if (!includeAdminOnly) {
      query = query.eq('admin_only_yn', 'N');
    }

    const { data, error } = await query
      .order('display_order', { ascending: true })
      .order('display_order', { foreignTable: 'tb_survey_option', ascending: true });

    if (error) return { data: null, error };

    return { 
      data: {
        questions: data?.map(q => ({
          surveyQuestionId: q.survey_question_id,
          questionCode: q.question_code,
          questionText: q.question_text,
          questionTypeCd: q.question_type_cd,
          options: q.tb_survey_option?.map((o: any) => ({
            surveyOptionId: o.survey_option_id,
            optionText: o.option_text,
            optionValue: o.option_value
          }))
        }))
      }, 
      error: null 
    };
  },

  /**
   * 설문 응답 저장 (saveSurveyAnswers)
   */
  async saveSurveyAnswers(answers: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

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
      .upsert(payload, { onConflict: 'user_id,survey_question_id' })
      .select();

    if (error) return { data: null, error };

    return { 
      data: {
        success: true,
        submittedCount: data?.length || 0
      }, 
      error: null 
    };
  },

  /**
   * 내 설문 응답 조회 (getMySurveyAnswers)
   */
  async getMySurveyAnswers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: '로그인이 필요합니다.' } };

    const { data, error } = await supabase
      .from('tb_user_survey_answer')
      .select('survey_question_id, survey_option_id, answer_text, answer_json, submitted_dt')
      .eq('user_id', user.id);

    if (error) return { data: null, error };

    return { 
      data: {
        answers: data
      }, 
      error: null 
    };
  }
};
