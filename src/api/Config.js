const urls = {
  gae: {
    loginUrl: 'https://login-service-dot-drive-manager-a3954.df.r.appspot.com/api',
    baseUrl: 'https://online-editor-api-dot-drive-manager-a3954.df.r.appspot.com/api',
    wsUrl: 'wss://online-editor-api-dot-drive-manager-a3954.df.r.appspot.com/api',
  },
  heroku: {
    loginUrl: 'https://login-service-dot-drive-manager-a3954.df.r.appspot.com/api',
    baseUrl: 'https://sync-notes-api-1.herokuapp.com/api',
    wsUrl: 'wss://sync-notes-api-1.herokuapp.com/api',
  },
  local: {
    loginUrl: 'https://login-service-dot-drive-manager-a3954.df.r.appspot.com/api',
    baseUrl: 'http://localhost:8080/api',
    wsUrl: 'ws://localhost:8080/api',
  },
}

let target = process.env.REACT_APP_BUILD_TARGET;
const {baseUrl, loginUrl, wsUrl} = urls[target] ? urls[target] : urls.local;

const apiConfig = {
  buildTarget: process.env.REACT_APP_BUILD_TARGET,
  baseUrl: baseUrl,
  loginUrl: loginUrl,
  wsUrl: wsUrl,
  unauthorizedPath: '/#/user/login',
  notFoundPath: '/#/error/notFound',
};

export default Object.assign({}, apiConfig);
