import merge from 'lodash/merge';
import fs from 'fs';

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

  addExtractedLocale(extractedLocales, propertyName) {
    const locales = this._locales;

    Object.keys(extractedLocales).forEach((locale) => {
      const extracted = extractedLocales[locale];
      if (!locales[locale]) {
        locales[locale] = {};
      }

      const currentLocale = locales[locale];
      currentLocale[propertyName] = extracted;
    });

    this.save();
  }

  save() {
    const options = this.getOptions();
    const locales = this._locales;

    const mainDir = options.path || '.';

    Object.keys(locales).forEach((locale) => {
      const filePath = mainDir + '/' + locale + '.js';

      const jsonContent = JSON.stringify(locales[locale], undefined, '\t');
      const result = `module.exports = ${jsonContent};`;

      fs.writeFile(filePath, result, { flag: 'w+' }, (err) => {
        if (err) {
          throw err;
        }
      });
    });
  }

  apply(compiler) {
    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('normal-module-loader', (loaderContext) => {
        loaderContext.addExtractedLocale = this.addExtractedLocale;
      });
    });
  }
}
