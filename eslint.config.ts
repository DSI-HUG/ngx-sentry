import hug from '@hug/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    hug.configs.moderate,
    hug.configs.stylistic.recommended,
);
