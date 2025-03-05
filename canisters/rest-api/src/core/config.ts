import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  APP_PORT: Joi.number().port().default(3000),
});

export type AppConfig = {
  app: { port: number };
};

export default (): AppConfig => ({
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
});
