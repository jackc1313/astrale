module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@shared': './src/shared',
            '@features': './src/features',
            '@services': './src/services',
            '@i18n': './src/i18n',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
