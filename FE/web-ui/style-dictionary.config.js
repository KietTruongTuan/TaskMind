module.exports = {
  source: ['./src/assets/tokens/dark.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: './src/assets/dist',
      files: [
        {
          destination: '_tokens-dark.scss',
          format: 'scss/variables',
        },
        // {
        //   destination: '_tokens-dark.scss',
        //   format: 'scss/variables',
        //   filter: {
        //     theme: 'dark'
        //   }
        // }
      ],
      // transforms: ['attribute/cti', 'name/cti/kebab']
    }
  }
};