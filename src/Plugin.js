// import merge from 'lodash/merge';
import get from 'lodash/get';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { each } from 'async';
import keymirror from 'keymirror';
import stringify from 'json-stable-stringify';

export const Format = keymirror({
  JS: null,
  JSON: null,
});

const Extension = {
  [Format.JS]: '.js',
  [Format.JSON]: '.json',
};

const DEFAULT_OPTIONS = {
  format: Format.JSON,
  encoding: 'utf-8',
  saveImmediately: true,
};

export default class ExportLocales {
  constructor(options = {}) {
    this._options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this._locales = {};
  }

  getOptions() {
    return this._options;
  }

  addExtractedLocale = (extractedLocales, propertyName) => {
    const locales = this._locales;

    extractedLocales.forEach((locale) => {
      if (!locales[locale.id]) {
        locales[locale.id] = {};
      }

      const currentLocale = locales[locale.id];
      currentLocale[propertyName] = locale.data;
    });

    const options = this.getOptions();
    if (!options.saveImmediately) {
      return;
    }

    this.save();
  }

  save() {
    const options = this._options;
    const compiler = this._compiler;
    const locales = this._locales;
    const mainDir = options.path || get(compiler, 'options.output.path') || '.';

    const { format, encoding } = options;
    const ext = Extension[format];

    mkdirp.sync(mainDir);

    const localeKeys = Object.keys(locales);
    localeKeys.sort(); // always same result

    localeKeys.forEach((locale) => {
      const filePath = mainDir + '/' + locale + ext;
      const jsonContent = stringify(locales[locale], {
        space: 2,
      });
      const result = format === Format.JS
        ? `module.exports = ${jsonContent};`
        : jsonContent;

      try {
        const currentContent = fs.readFileSync(filePath, { encoding });
        if (currentContent === result) {
          return;
        }
      } catch(e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }

      fs.writeFileSync(filePath, result, {
        flag: 'w+',
        encoding,
      });
    });
  }

  apply = (compiler) => {
    const options = this.getOptions();
    this._compiler = compiler;

    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('normal-module-loader', (loaderContext) => {
        loaderContext.addExtractedLocale = this.addExtractedLocale;
      });

      compilation.plugin('additional-assets', (callback) => {
        if (options.saveImmediately) {
          callback();
          return;
        }

        this.save();
        callback();
      });
    });
  }
}
