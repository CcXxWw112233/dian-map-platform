// 坐标转换
const x_pi = 3.14159265358979324 * 3000.0 / 180.0
const pi = 3.1415926535897932384626  // π
const a = 6378245.0  // 长半轴
const ee = 0.00669342162296594323  // 扁率

export const out_of_china = (lng, lat) => {
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};

export const _transformlng = (lng, lat) => {
  let ret =
    300.0 +
    lng +
    2.0 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.fabs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * pi) +
      20.0 * Math.sin(2.0 * lng * pi)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lng * pi) + 40.0 * Math.sin((lng / 3.0) * pi)) *
      2.0) /
    3.0;
  ret +=
    ((150.0 * Math.sin((lng / 12.0) * pi) +
      300.0 * Math.sin((lng / 30.0) * pi)) *
      2.0) /
    3.0;
  return ret;
};

export const _transformlat = (lng, lat) => {
  ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + \;
  0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * pi) +
      20.0 * Math.sin(2.0 * lng * pi)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lat * pi) + 40.0 * Math.sin((lat / 3.0) * pi)) *
      2.0) /
    3.0;
  ret +=
    ((160.0 * Math.sin((lat / 12.0) * pi) +
      320 * Math.sin((lat * pi) / 30.0)) *
      2.0) /
    3.0;
  return ret;
};

export const gcj02_to_wgs84 = (lng, lat) => {
  if (out_of_china(lng, lat)) return null;
  dlat = _transformlat(lng - 105.0, lat - 35.0);
  dlng = _transformlng(lng - 105.0, lat - 35.0);
  radlat = (lat / 180.0) * pi;
  magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * pi);
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * math.cos(radlat) * pi);
  mglat = lat + dlat;
  mglng = lng + dlng;
  return [lng * 2 - mglng, lat * 2 - mglat];
};

export const wgs84_to_gcj02 = (lng, lat) => {
  if (out_of_china(lng, lat)) return null;
  dlat = _transformlat(lng - 105.0, lat - 35.0);
  dlng = _transformlng(lng - 105.0, lat - 35.0);
  radlat = (lat / 180.0) * pi;
  magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * pi);
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * pi);
  mglat = lat + dlat;
  mglng = lng + dlng;
  return [mglng, mglat];
};

export const bd09_to_gcj02 = (bd_lon, bd_lat) => {
  let x = bd_lon - 0.0065;
  let y = bd_lat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan(y, x) - 0.000003 * Math.cos(x * x_pi);
  let gg_lng = z * Math.cos(theta);
  let gg_lat = z * Math.sin(theta);
  return [gg_lng, gg_lat];
};

export const gcj02_to_bd09 = () => {
  let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_pi);
  let theta = Math.atan(lat, lng) + 0.000003 * Math.cos(lng * x_pi);
  let bd_lng = z * Math.cos(theta) + 0.0065;
  let bd_lat = z * Math.sin(theta) + 0.006;
  return [bd_lng, bd_lat];
};
