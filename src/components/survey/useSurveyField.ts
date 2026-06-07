import { computed } from 'vue';

type SurveyOption = {
  label?: string;
  value?: string | number;
  optionText?: string;
  optionValue?: string | number;
  surveyOptionId?: string;
};

const normalizeOptions = (options: SurveyOption[] = []) => {
  return options.map(option => ({
    label: option.label ?? option.optionText ?? String(option.value ?? option.optionValue ?? ''),
    value: option.value ?? option.optionValue,
    surveyOptionId: option.surveyOptionId
  }));
};

export const useSurveyField = (props: any) => {
  const question = computed(() => {
    if (!props.code || !props.questionsMap) return null;
    return props.questionsMap[props.code] ?? null;
  });

  const fieldLabel = computed(() => {
    return props.label || question.value?.questionText || props.code || '';
  });

  const fieldRequired = computed(() => {
    if (typeof props.required === 'boolean') return props.required;
    return question.value?.requiredYn === 'Y';
  });

  const fieldOptions = computed(() => {
    const directOptions = Array.isArray(props.options) ? props.options : [];
    if (directOptions.length > 0) return normalizeOptions(directOptions);
    return normalizeOptions(question.value?.options || []);
  });

  return {
    question,
    fieldLabel,
    fieldRequired,
    fieldOptions
  };
};
