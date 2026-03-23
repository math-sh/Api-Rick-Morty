import * as process from 'process';

export const configuration = () => {
  return {
    port: Number(process.env.APP_PORT) || 3000,
    rickApi: {
      baseUrl: process.env.RICK_API_BASE_URL,
    },
  };
};
