// import Promise from 'bluebird';

// export default function(method, url, data, options) {
//   options = options || {};
//   return new Promise((resolve, reject) => {
//     method = method || 'GET';
//     let xhr = new XMLHttpRequest();
//     if ('withCredentials' in xhr) {
//       // XHR for Chrome/Firefox/Opera/Safari.
//       xhr.withCredentials = options.withCredentials !== undefined ? options.withCredentials : true;
//       xhr.open(method, url, true);
//     } else if (typeof XDomainRequest !== 'undefined') {
//       // XDomainRequest for IE.
//       xhr = new XDomainRequest();
//       xhr.open(method, url);
//     }
//     xhr.setRequestHeader('content-type', 'application/json');
//     xhr.onload = (e) => {
//       if (xhr.status >= 400) {
//         reject({
//           status: e.target.status,
//           responseText: e.target.responseText
//         });
//       }
//       try {
//         resolve(JSON.parse(xhr.responseText));
//       } catch(e) {
//         reject('Error parsing json');
//       }
//     };
//     xhr.onerror = () => {
//       reject('Error');
//     };
//     if (data) {
//       xhr.send(JSON.stringify(data));
//     } else {
//       xhr.send();
//     }
//   });
// }