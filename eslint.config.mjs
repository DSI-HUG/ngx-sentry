import hug from '@hug/eslint-config';
export default [
    ...(await hug.configs.moderate),
    hug.configs.stylistic
];
