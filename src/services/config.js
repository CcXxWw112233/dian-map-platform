export const getBaseUrl = () => {
  let NODE_ENV = process.env.NODE_ENV ;
  if(NODE_ENV === 'development'){
    return {
      API_URL: 'http://192.168.1.33',
      geoserver:""
    }
  }
  if(NODE_ENV === 'production'){
    return {
      API_URL: ""
    }
  }

  return {
    API_URL: ""
  }
}
