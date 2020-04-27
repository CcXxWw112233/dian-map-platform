export const getBaseUrl = () => {
  let NODE_ENV = process.env.NODE_ENV ;
  if(NODE_ENV === 'development'){
    return {
      API_URL: 'http://60.205.252.199/api',
      Geo_WFS:"https://map.di-an.com/geoserver/wfs"
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
