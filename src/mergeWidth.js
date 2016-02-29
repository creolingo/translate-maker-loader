import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';

export default function mergeWidth(dest, src, fn, path) {
  // try to get custom combination
  const newValue = fn(dest, src, path);
  if (typeof newValue !== 'undefined') {
    return newValue;
  }

  // if it a same return imadiately
  if (dest === src) {
    return src;
  }

  // if one is undefined return defined obj
  if (typeof dest === 'undefined') {
    return src;
  } else if (typeof src === 'undefined') {
    return dest;
  }

  if (isArray(dest) && isArray(src)) {
    const used = {};

    dest.forEach((value, key) => {
      const newPath = path ? `${path}.${key}` : key;

      used[key] = true;
      dest[key] = mergeWidth(dest[key], src[key], fn, newPath);
    });

    src.forEach((value, key) => {
      if (used[key]) {
        return;
      }

      const newPath = path ? `${path}.${key}` : key;
      dest[key] = mergeWidth(dest[key], src[key], fn, newPath);
    });

    return dest;
  }

  if (isPlainObject(dest) && isPlainObject(src)) {
    const used = {};

    Object.keys(dest).forEach((key) => {
      const newPath = path ? `${path}.${key}` : key;

      used[key] = true;
      dest[key] = mergeWidth(dest[key], src[key], fn, newPath);
    });

    Object.keys(src).forEach((key) => {
      if (used[key]) {
        return;
      }

      const newPath = path ? `${path}.${key}` : key;
      dest[key] = mergeWidth(dest[key], src[key], fn, newPath);
    });

    return dest;
  }

  return src;
}
