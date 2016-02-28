import path from 'path';
import fs from 'fs';
import { transform } from 'babel-core';
import walk from './walk';
import combine from './combine';
import getLocalIdent from './getLocalIdent';
import { parseQuery } from 'loader-utils';
import validateObject from './validateObject';

const DEFAULT_QUERY = {
  localIdentName: '[name]_[hash:base64:5]',
  defaultValue: true,
  defaultValuePropertyName: '_[name]',
  transform: (value) => value,
  babel: {
    presets: ['es2015'],
  },
};

export default function loader() {
  const callback = this.async();
  const { resourcePath, addExtractedLocale } = this;
  const query = {
    ...DEFAULT_QUERY,
    ...parseQuery(this.query || '?'),
  };
  const resolvedPath = path.resolve(resourcePath);

  const emitter = query.emitErrors ? this.emitError : this.emitWarning;

  const locales = {};
  const { dir } = path.parse(resolvedPath);
  walk(dir, (fileContent, filePath, cb) => {
    const babelQuery = query.babel;
    const result = transform(fileContent, babelQuery);

    const timestamp = new Date().getTime(); // TODO replace with puid
    const tempPath = __dirname + `/temp-${timestamp}.js`;

    // mark file as project file
    this.addDependency(filePath);

    fs.writeFile(tempPath, result.code, { flag: 'w+' }, (err2) => {
      if (err2) {
        return cb(err2);
      }

      const content = require(tempPath);
      fs.unlinkSync(tempPath);

      const { name } = path.parse(filePath);
      locales[name] = content.default ? content.default : content;

      cb(null);
    });
  }, (err2) => {
    if (err2) {
      return callback(err2);
    }

    const localIdentName = query.localIdentName;
    const propertyName = getLocalIdent(dir, localIdentName);
    const value = combine(locales, propertyName, query);

    validateObject(value, query, emitter, dir);

    const jsonContent = JSON.stringify(value, undefined, '\t');
    const result = `module.exports = ${jsonContent};`;

    if (!addExtractedLocale) {
      return callback(null, result);
    }

    addExtractedLocale(locales, propertyName, (err3) => {
      if (err3) {
        return callback(err3);
      }

      callback(null, result);
    });
  });
}
