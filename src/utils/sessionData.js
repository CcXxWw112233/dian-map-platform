//sessionStorage会话窗口的字段读取

export const ORG_ID_KEY_NAME = "orgId";
export const setSesstionStorage = (name, value) => {
  window.sessionStorage.setItem(name, value);
};
export const getSesstionStorage = name => {
  return window.sessionStorage.getItem(name);
};

export const setSessionOrgId = value => {
  setSesstionStorage(ORG_ID_KEY_NAME, value);
};

export const getSessionOrgId = () => {
  return getSesstionStorage(ORG_ID_KEY_NAME);
};
