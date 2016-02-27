import merge from 'lodash/merge';
import transform from './transform';

export default function combine(locales, propertyName) {
  const obj = {};

  Object.keys(locales).forEach((locale) => {
    const localeObj = locales[locale];

    const transformedObj = transform(localeObj, propertyName);
    merge(obj, transformedObj);
  });

  return {
    [propertyName]: obj,
  };
}
