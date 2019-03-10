import path from 'path';
import qs from 'qs';
import loader, { ExtractLocales } from '../src';
import ResponseFormat from '../src/constants/ResponseFormat';

describe('Loader', () => {
  it('should be able to parse locales', (done) => {
    const extractLocales = new ExtractLocales({
      path: __dirname + '/output',
    });

    const result = loader.call({
      query: {
        format: ResponseFormat.FUNCTION,
        localIdentName: '[name]_[hash:base64:7]',
        path: __dirname + '/output',
        defaultLocale: 'en_US',
        babel: {
          presets: ['@babel/env'],
        },
      },
      addDependency: (file) => {
        console.log('Dependecy: ' + file);
      },
      resourcePath: path.resolve(__dirname + '/locale/locale'),
      emitWarning: (message) => console.log('WARNING: ' + message),
      emitError: (message) => console.log('ERROR: ' + message),
      addExtractedLocale: extractLocales.addExtractedLocale,
    });

    // console.log(result);
    done();
  });

  it('should be able to parse locales', (done) => {
    const extractLocales = new ExtractLocales({
      path: __dirname + '/output',
    });

    const result = loader.call({
      query: {
        format: ResponseFormat.PATH,
        localIdentName: '[name]_[hash:base64:7]',
        path: __dirname + '/output',
        defaultLocale: 'en_US',
        babel: {
          presets: ['@babel/env'],
        },
      },
      addDependency: (file) => {
        console.log('Dependecy: ' + file);
      },
      resourcePath: path.resolve(__dirname + '/test.locale'),
      emitWarning: message => console.log('WARNING: ' + message),
      emitError: (message) => console.log('ERROR: ' + message),
      addExtractedLocale: extractLocales.addExtractedLocale,
    });

    // console.log(result);
    done();
  });
});
