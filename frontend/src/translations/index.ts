import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import ml from './ml.json';
import bn from './bn.json';
import mr from './mr.json';
import gu from './gu.json';

export const translations: Record<string, any> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
  mr,
  gu
};

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu';