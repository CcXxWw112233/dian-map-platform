export const getBaseUrl = () => {
  let NODE_ENV = process.env.NODE_ENV ;
  console.log(process.env)
  if(NODE_ENV === 'development'){
    return {
      API_URL: 'http://60.205.252.199/api',
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
