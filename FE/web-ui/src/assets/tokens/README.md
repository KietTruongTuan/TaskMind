## Related directories
- `FE\web-ui\src\assets\tokens` defines the design tokens in `json` format. 
	- Tokens are like common, predefined values to be used widely across the application
	- These tokens are then converted to `css` formats and used in the code, more details later
- `FE\web-ui\style-dictionary.config.js` contain the configuration to be used by the tools to convert the `json` tokens to `css` format. Some of the notable config are
```js
module.exports = {
  source: ['./src/assets/tokens/tokens.json'],    // source tokens in .json
  platforms: {
    scss: {
      transformGroup: 'scss',            // target stylesheet format
      buildPath: './src/assets/dist/',   // target stylesheet directory
      files: [
        {
          destination: '_tokens.scss',   // target stylesheet file name
          format: 'scss/variables',
        },
      ],
      transforms: ['attribute/cti', 'size/px'],
    },
  },
};
```

## Apply the generated styles
- Run tool
	- Once tokens are ready to be applied, activate tool to convert them to stylesheet files with
	  `pnpm build:tokens` (command defined in `./package.json`)

## Update the styles
- If you need to update the styles, update from the `.json` source file
- The tokens will be generated following the hierarchy order defined, e.g., for a tokens source such as follow:
```json
{
  "light": {
    "color": {
      "background": { "value": "#ffffff", "type": "color" },
      "foreground": { "value": "#171717", "type": "color" },
    }
  },
  "typography": {
    "font-family-sans": { "value": "var(--font-geist-sans)", "type": "fontFamilies" },
  }
}
```
Then the generated stylesheets (in `scss` format) will be:
```scss
$light-color-background: #ffffff;
$light-color-foreground: #171717;
$typography-font-family-sans: var(--font-geist-sans);
```