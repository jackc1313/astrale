import { useState, useCallback } from "react";

import { storage, storageService } from "@services/storage";
import type { ZodiacSignId } from "@shared/utils/zodiac";
import {
  STAR_CATEGORIES,
  STAR_QUESTIONS,
  getStarResponse,
  type StarCategory,
  type StarQuestion,
  type StarResponse,
} from "../data/starQuestions";

const ASKED_KEY_PREFIX = "stars.asked";
const today = (): string => new Date().toISOString().split("T")[0];

const getAskedKey = (questionId: string): string =>
  `${ASKED_KEY_PREFIX}.${questionId}.${today()}`;

const isQuestionAskedToday = (questionId: string): boolean =>
  storage.getBoolean(getAskedKey(questionId)) === true;

type StarsPhase = "categories" | "questions" | "thinking" | "answer";

export const useStars = () => {
  const [phase, setPhase] = useState<StarsPhase>("categories");
  const [selectedCategory, setSelectedCategory] = useState<StarCategory | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<StarQuestion | null>(null);
  const [response, setResponse] = useState<StarResponse | null>(null);

  const profile = storageService.getUserProfile();
  const sign: ZodiacSignId = profile?.zodiacSign ?? "aries";

  const questionsForCategory = useCallback((category: StarCategory): StarQuestion[] => {
    return STAR_QUESTIONS.filter((q) => q.category === category);
  }, []);

  const isAsked = useCallback((questionId: string): boolean => {
    return isQuestionAskedToday(questionId);
  }, []);

  const selectCategory = useCallback((category: StarCategory) => {
    setSelectedCategory(category);
    setSelectedQuestion(null);
    setResponse(null);
    setPhase("questions");
  }, []);

  const selectQuestion = useCallback((question: StarQuestion) => {
    if (isQuestionAskedToday(question.id)) return;

    setSelectedQuestion(question);
    setPhase("thinking");

    const todayStr = today();
    const questionIndex = STAR_QUESTIONS.indexOf(question);
    const result = getStarResponse(question.category, sign, questionIndex, todayStr);

    storage.set(getAskedKey(question.id), true);
    storageService.addReadingEntry("stars", `${question.category}: ${result.text.slice(0, 60)}`);

    setResponse(result);
  }, [sign]);

  const showAnswer = useCallback(() => {
    setPhase("answer");
  }, []);

  const backToCategories = useCallback(() => {
    setSelectedCategory(null);
    setSelectedQuestion(null);
    setResponse(null);
    setPhase("categories");
  }, []);

  const backToQuestions = useCallback(() => {
    setSelectedQuestion(null);
    setResponse(null);
    setPhase("questions");
  }, []);

  return {
    phase,
    selectedCategory,
    selectedQuestion,
    response,
    sign,
    categories: STAR_CATEGORIES,
    questionsForCategory,
    isAsked,
    selectCategory,
    selectQuestion,
    showAnswer,
    backToCategories,
    backToQuestions,
  };
};
