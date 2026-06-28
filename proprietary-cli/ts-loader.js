// proprietary-cli/ts-loader.js
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: "ESNext",
    target: "ES2020"
  }
});
