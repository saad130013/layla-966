
import { useContext } from 'react';
import { I18nContext } from '../context/I18nContext';

export const useI18n = () => {
  return useContext(I18nContext);
};
