import 'dotenv/config';

import { DataSource } from 'typeorm';

import { createDataSourceOptions } from './typeorm.options';

const dataSource = new DataSource(createDataSourceOptions(process.env));

export default dataSource;

