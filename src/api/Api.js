import config from './Config.js';

class Api {
  buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    let token = localStorage.getItem("jwt.token");
    if (token) {
      headers['Authorization'] = `Bearer ${localStorage.getItem("jwt.token")}`;
    }

    return headers;
  }

  get = (path) => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("jwt.token");
      // if (!token) {
      //   console.log('no token');
      //   reject({error: 'Not Authorized'});
      // }
      fetch(config.baseUrl + path, {
        method: 'GET',
        headers: this.buildHeaders()
      }).then(resp => {
        resp.json().then(data => {
          if (resp.status === 401) {
            reject(data)
          } else if (resp.status === 404) {
            reject(resp, data);
          } else if (resp.status === 500) {
            reject(resp, data);
          } else {
            resolve(data);
          }
        }).catch(err => {
          reject(err)
        })

      });
    })
  };

  post = (path, body, raw) => {
    const _this = this;
    let input = path.startsWith("http") ? path : config.baseUrl + path;
    return new Promise((resolve, reject) => {
      fetch(input, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: raw ? body : JSON.stringify(body),
      }).then(resp => {
        _this.handleResponse(resp, reject, resolve);
      }).catch(err => {
        reject(err);
      });
    });
  };

  put = (path, body, raw) => {
    const _this = this;
    let input = path.startsWith("http") ? path : config.baseUrl + path;
    return new Promise((resolve, reject) => {
      fetch(input, {
        method: 'PUT',
        headers: this.buildHeaders(),
        body: raw ? body : JSON.stringify(body),
      }).then(resp => {
        _this.handleResponse(resp, reject, resolve)
      }).catch(err => {
        reject(err);
      });
    });
  };

  delete = (path) => {
    const _this = this;
    let input = path.startsWith("http") ? path : config.baseUrl + path;
    return new Promise((resolve, reject) => {
      fetch(input, {
        method: 'DELETE',
        headers: this.buildHeaders(),
      }).then(resp => {
        _this.handleResponse(resp, reject, resolve)
      }).catch(err => {
        reject(err);
      });
    });
  };

  handleResponse(resp, reject, resolve) {
    resp.json().then(data => {
      if (resp.status >= 200 && resp.status <= 299) {
        resolve(data);
      } else {
        reject(data);
      }
    }).catch(err => {
      reject({'error': `Fail to parse response data by error ${err}`})
    })
  }

  fetchBlob = (url) => {
    return fetch(url).then(resp => resp.blob())
  };

  setToken = (token) => {
    if (token) {
      console.log('set token');
      localStorage.setItem("jwt.token", token);
    } else {
      console.log('delete token');
      localStorage.removeItem("jwt.token");
    }
    this.token = token;
  };

  postForm(path, formData) {
    const input = config.baseUrl + path;
    const headers = {};
    headers['Authorization'] = `Bearer ${localStorage.getItem("jwt.token")}`;
    return new Promise((resolve, reject) => {
      fetch(input, {
        method: 'POST',
        headers: headers,
        body: formData,
      }).then(resp => {
        if (resp.status >= 200 && resp.status <= 299) {
          resp.json().then(data => {
            resolve(data);
          })
        } else {
          resp.json().then(data => {
            reject(data);
          });
        }
      }).catch(err => {
        reject(err);
      });
    });
  }

}

const api = new Api();

export default api;
