const { Sequelize } = require('sequelize');

const dialect = String(process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'usg_data_server',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false
    }
  );
} else if (dialect === 'postgres' || dialect === 'postgresql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'usg_data_server',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 5432),
      dialect: 'postgres',
      logging: false
    }
  );
} else {
  throw new Error(`Unsupported DB_DIALECT: ${dialect}`);
}

module.exports = sequelize;
