# Locale Modules

A **Locale Module** is a translation file in which all properties and translations are scoped locally by default.

```js
/* ./locale/en_US.js */
export default {
  button: {
    next: 'Next'
  }
}
```

```js
/* ./locale/sk_SK.js */
export default {
  button: {
    next: 'Dalej'
  }
}
```

```jsx
/* ./Example.jsx  */
import React, { Component } from 'react';
import Translate from 'react-translate-maker';
import locale from './locale';

export default class Example extends Component {
  render() {
    return (
      <Translate path={locale.button.next} defaultValue="Next" />
    );
  }
}
```

## Naming

For local path camelCase naming is recommended, but not enforced.

## Why?

modular and reusable translations

 - No more conflicts
 - Explicit dependencies
 - No global scope
 - Automatic extraction of the translations

## Implementation

The main idea is very similar to [CSS Modules](https://github.com/css-modules/css-modules).
We already implemented webpack plugin for the locales modules named [translate-maker-loader](https://github.com/CherryProjects/translate-maker-loader) which you are able to use on the server too with the [babel-plugin-webpack-loaders](https://github.com/istarkov/babel-plugin-webpack-loaders).
This loader also contains locale extractor (plugin). This plugin will extract all translations into the locale files. You can load this files with the adapter of the [translate-maker](https://github.com/CherryProjects/translate-maker) available for the React too [react-translate-maker](https://github.com/CherryProjects/react-translate-maker).
