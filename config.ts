import path from "path";
import * as dotenv from 'dotenv';
dotenv.config();

const rootPath = __dirname;

const config = {
  rootPath,
  publicPath: path.join(rootPath, 'public'),
  db: 'mongodb://localhost/js-92',
};

export default config