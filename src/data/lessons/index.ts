import { Lesson, WordItem } from '../../types';
import { LESSON_1_INFO, LESSON_1_WORDS } from './lesson1';
import { LESSON_2_INFO, LESSON_2_WORDS } from './lesson2';
import { LESSON_3_INFO, LESSON_3_WORDS } from './lesson3';
import { LESSON_4_INFO, LESSON_4_WORDS } from './lesson4';
import { LESSON_5_INFO, LESSON_5_WORDS } from './lesson5';
import { LESSON_6_INFO, LESSON_6_WORDS } from './lesson6';
import { LESSON_7_INFO, LESSON_7_WORDS } from './lesson7';
import { LESSON_8_INFO, LESSON_8_WORDS } from './lesson8';
import { LESSON_9_INFO, LESSON_9_WORDS } from './lesson9';
import { LESSON_10_INFO, LESSON_10_WORDS } from './lesson10';
import { LESSON_11_INFO, LESSON_11_WORDS } from './lesson11';
import { LESSON_12_INFO, LESSON_12_WORDS } from './lesson12';
import { LESSON_13_INFO, LESSON_13_WORDS } from './lesson13';
import { LESSON_14_INFO, LESSON_14_WORDS } from './lesson14';
import { LESSON_15_INFO, LESSON_15_WORDS } from './lesson15';

export const LESSONS: Lesson[] = [
  LESSON_1_INFO,
  LESSON_2_INFO,
  LESSON_3_INFO,
  LESSON_4_INFO,
  LESSON_5_INFO,
  LESSON_6_INFO,
  LESSON_7_INFO,
  LESSON_8_INFO,
  LESSON_9_INFO,
  LESSON_10_INFO,
  LESSON_11_INFO,
  LESSON_12_INFO,
  LESSON_13_INFO,
  LESSON_14_INFO,
  LESSON_15_INFO
];

export const ALL_WORDS: WordItem[] = [
  ...LESSON_1_WORDS,
  ...LESSON_2_WORDS,
  ...LESSON_3_WORDS,
  ...LESSON_4_WORDS,
  ...LESSON_5_WORDS,
  ...LESSON_6_WORDS,
  ...LESSON_7_WORDS,
  ...LESSON_8_WORDS,
  ...LESSON_9_WORDS,
  ...LESSON_10_WORDS,
  ...LESSON_11_WORDS,
  ...LESSON_12_WORDS,
  ...LESSON_13_WORDS,
  ...LESSON_14_WORDS,
  ...LESSON_15_WORDS
];
