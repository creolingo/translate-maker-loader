import path from 'path';
import fs from 'fs';
import { transform } from 'babel-core';
import walk from 'walkdir';
import requireFromString from 'require-from-string';
import getLocalIdent from './getLocalIdent';
import mergeLocales from './mergeLocales';
import normalizeLocale from './normalizeLocale';
import generateResponse from './generateResponse';
import ResponseFormat from './constants/ResponseFormat';
import prepareLocale from './prepareLocale';

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


function prepareResponse(locales, options, dir) {
  const emitter = options.emitErrors
    ? this.emitError
    : this.emitWarning;

  const { addExtractedLocale } = this;

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
  const context = options.context;
  const prefix = getLocalIdent(this, dir, localIdentName, context);
  const defaultLocale = locales.find(locale => locale.id === options.defaultLocale);
  if (options.defaultLocale && !defaultLocale) {
    emitter(`Default locale ${options.defaultLocale} is missing: ${dir}`);
  }

  const defaultData = defaultLocale && defaultLocale.data;
  const value = prepareLocale(mergedLocale, prefix, options.format, defaultData);

  const response = generateResponse(value, options.format);
  if (addExtractedLocale) {
    addExtractedLocale(locales, prefix);
  }

  return response;
}

export function newLoader() {
  const { resourcePath } = this;
  const options = {
    ...DEFAULT_QUERY,
    ...this.query,
  };

  const resolvedPath = path.resolve(resourcePath);
  const { dir } = path.parse(resolvedPath);
  const emitter = options.emitErrors
    ? this.emitError
    : this.emitWarning;

  // TODO: I am not sure if I need to add it or it is automatically
  this.addDependency(resolvedPath);

  const babelQuery = options.babel;
  const fileContent = fs.readFileSync(resolvedPath, { encoding: 'utf8' });
  const result = transform(fileContent, babelQuery);
  const content = requireFromString(result.code);

  const locales = [];

  Object.keys(content).forEach((locale) => {
    if (locale === 'default') {
      emitter(`File ${resolvedPath} contains export default. You need to export locale.`);
    }

    const data = content[locale];

    locales.push({
      id: locale,
      path: resolvedPath,
      data,
    });
  });

  return this::prepareResponse(locales, options, dir);
}

export default function loader() {
  // const callback = this.async();
  const { resourcePath } = this;
  const options = {
    ...DEFAULT_QUERY,
    ...this.query,
  };

  const resolvedPath = path.resolve(resourcePath);

  const locales = [];
  const { dir, name } = path.parse(resolvedPath);
  if (name !== 'locale') {
    return this::newLoader();
  }

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

  return this::prepareResponse(locales, options, dir);
}
