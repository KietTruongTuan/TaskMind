module.exports = {
  source: ['./src/assets/tokens/tokens.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: './src/assets/dist/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
        },
      ],
      transforms: ['attribute/cti', 'size/px'],
    },
  },
};