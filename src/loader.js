import path from 'path';
import fs from 'fs';
import { transform } from 'babel-core';
import walk from './walk';
import getLocalIdent from './getLocalIdent';
import { parseQuery } from 'loader-utils';
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
  babel: {
    presets: ['es2015'],
  },
};

export default function loader() {
  const callback = this.async();
  const { resourcePath, addExtractedLocale } = this;
  const options = {
    ...DEFAULT_QUERY,
    ...parseQuery(this.query || '?'),
  };
  const resolvedPath = path.resolve(resourcePath);

  const emitter = options.emitErrors ? this.emitError : this.emitWarning;

  const locales = [];
  const { dir } = path.parse(resolvedPath);
  walk(dir, (fileContent, filePath, cb) => {
    const babelQuery = options.babel;
    const result = transform(fileContent, babelQuery);

    const timestamp = new Date().getTime(); // TODO replace with puid
    const tempPath = __dirname + `/temp-${timestamp}.js`;

    // mark file as project file
    this.addDependency(filePath);

    // TODO find how to do that without file save
    fs.writeFile(tempPath, result.code, { flag: 'w+' }, (err2) => {
      if (err2) {
        return cb(err2);
      }

      const content = require(tempPath);
      fs.unlinkSync(tempPath);

      const { name } = path.parse(filePath);
      locales.push({
        id: name,
        path: filePath,
        data: content.default ? content.default : content,
      });

      cb(null);
    });
  }, (err2) => {
    if (err2) {
      return callback(err2);
    }

    if (!locales.length) {
      const content = generateResponse({}, options.format);
      return callback(null, content);
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
    if (!addExtractedLocale) {
      return callback(null, response);
    }

    addExtractedLocale(locales, prefix, (err3) => {
      if (err3) {
        return callback(err3);
      }

      callback(null, response);
    });
  });
}
