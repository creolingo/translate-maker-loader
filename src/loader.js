import path from 'path';
import fs from 'fs';
import { transform } from 'babel-core';
import walk from 'walkdir';
import getLocalIdent from './getLocalIdent';
import { parseQuery } from 'loader-utils';
import mergeLocales from './mergeLocales';
import normalizeLocale from './normalizeLocale';
import generateResponse from './generateResponse';
import ResponseFormat from './constants/ResponseFormat';
import prepareLocale from './prepareLocale';
import requireFromString from 'require-from-string';

const DEFAULT_QUERY = {
  defaultLocale: null,
  localIdentName: '[name]_[hash:base64:5]',
  format: ResponseFormat.PATH,
  normalize: true,
  ext: '.js',
  babel: {
    presets: ['es2015'],
  },
};

export default function loader() {
  //const callback = this.async();
  const { resourcePath, addExtractedLocale } = this;
  const options = {
    ...DEFAULT_QUERY,
    ...parseQuery(this.query || '?'),
  };
  const resolvedPath = path.resolve(resourcePath);

  const emitter = options.emitErrors ? this.emitError : this.emitWarning;

  const locales = [];
  const { dir } = path.parse(resolvedPath);

  walk.sync(dir, (filePath, stats) => {
    if (!stats.isFile()) {
      return;
    }

    const { name, ext } = path.parse(filePath);
    if (options.ext && ext !== options.ext) {
      return;
    }

    // mark file as project file
    this.addDependency(filePath);

    const babelQuery = options.babel;
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    const result = transform(fileContent, babelQuery);
    const content = requireFromString(result.code);

    locales.push({
      id: name,
      path: filePath,
      data: content.default && Object.keys(content).length === 1
        ? content.default
        : content,
    });
  });

  if (!locales.length) {
    return generateResponse({}, options.format);
  }

  // normalize locales
  if (options.normalize) {
    locales.forEach((locale) => {
      locale.data = normalizeLocale(locale.data);
    });
  }

  // create one big locale merged from all locales, check missing translations and type errors
  const mergedLocale = mergeLocales(locales, emitter);

  const localIdentName = options.localIdentName;
  const prefix = getLocalIdent(this, dir, localIdentName);
  const defaultLocale = locales.find((locale) => locale.id === options.defaultLocale);
  const value = prepareLocale(mergedLocale, prefix, options.format, defaultLocale.data);

  const response = generateResponse(value, options.format);
  if (addExtractedLocale) {
    addExtractedLocale(locales, prefix);
  }

  return response;
}
