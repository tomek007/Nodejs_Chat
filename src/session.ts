import session from 'express-session';
import fileStoreInitializer from 'session-file-store';

export const initSession = (app) => {
  const FileStore = fileStoreInitializer(session);

  const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: `$2b$05$iG.vsaPAqHqUk1refViAdO.lYKEfzDAUqS3iy.OiPu0elLK6JGWt`,
    store: new FileStore({}),
  });
  app.use(sessionMiddleware);

  return sessionMiddleware;
};

export default {
  initSession,
};
