export default function getQueryString(name: string, url?: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let searchUrl = window.location.search.substr(1);
  if (url) {
    let pos = url.indexOf('?');
    if (pos > -1)
      searchUrl = url.substring(pos + 1);
    else
      searchUrl = '';
  }
  const r = searchUrl.match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}