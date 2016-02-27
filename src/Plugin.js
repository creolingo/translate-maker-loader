// import merge from 'lodash/merge';
import get from 'lodash/get';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { each } from 'async';

export default class ExportLocales {
  constructor(options = {}) {
    this._options = options;
    this._locales = {};

    this.apply = this.apply.bind(this);
    this.addExtractedLocale = this.addExtractedLocale.bind(this);
  }

  getOptions() {
    return this._options;
  }

  addExtractedLocale(extractedLocales, propertyName, callback) {
    const locales = this._locales;

    Object.keys(extractedLocales).forEach((locale) => {
      const extracted = extractedLocales[locale];
      if (!locales[locale]) {
        locales[locale] = {};
      }

      const currentLocale = locales[locale];
      currentLocale[propertyName] = extracted;
    });

    this.save(callback);
  }

  save(callback) {
    const options = this._options;
    const compiler = this._compiler;
    const locales = this._locales;
    const mainDir = options.path || get(compiler, 'options.output.path') || '.';

    mkdirp(mainDir, (err) => {
      if (err) {
        callback(err);
      }

      each(Object.keys(locales), (locale, cb) => {
        const filePath = mainDir + '/' + locale + '.js';

        const jsonContent = JSON.stringify(locales[locale], undefined, '\t');
        const result = `module.exports = ${jsonContent};`;

        fs.writeFile(filePath, result, { flag: 'w+' }, cb);
      }, callback);
    });
  }

  apply(compiler) {
    this._compiler = compiler;

    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('normal-module-loader', (loaderContext) => {
        loaderContext.addExtractedLocale = this.addExtractedLocale;
      });
    });
  }
}
