
import { createRequire as __createRequire__ } from 'module';
const require = __createRequire__(import.meta.url);

var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/bind.js
var require_bind = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/bind.js"(exports, module) {
    "use strict";
    module.exports = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/utils.js
var require_utils = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/utils.js"(exports, module) {
    "use strict";
    var bind = require_bind();
    var toString = Object.prototype.toString;
    function isArray(val) {
      return toString.call(val) === "[object Array]";
    }
    function isUndefined(val) {
      return typeof val === "undefined";
    }
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
    }
    function isArrayBuffer(val) {
      return toString.call(val) === "[object ArrayBuffer]";
    }
    function isFormData(val) {
      return typeof FormData !== "undefined" && val instanceof FormData;
    }
    function isArrayBufferView(val) {
      var result;
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
      } else {
        result = val && val.buffer && val.buffer instanceof ArrayBuffer;
      }
      return result;
    }
    function isString(val) {
      return typeof val === "string";
    }
    function isNumber(val) {
      return typeof val === "number";
    }
    function isObject(val) {
      return val !== null && typeof val === "object";
    }
    function isPlainObject(val) {
      if (toString.call(val) !== "[object Object]") {
        return false;
      }
      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }
    function isDate(val) {
      return toString.call(val) === "[object Date]";
    }
    function isFile(val) {
      return toString.call(val) === "[object File]";
    }
    function isBlob(val) {
      return toString.call(val) === "[object Blob]";
    }
    function isFunction(val) {
      return toString.call(val) === "[object Function]";
    }
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams;
    }
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }
    function isStandardBrowserEnv() {
      if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) {
        return false;
      }
      return typeof window !== "undefined" && typeof document !== "undefined";
    }
    function forEach(obj, fn) {
      if (obj === null || typeof obj === "undefined") {
        return;
      }
      if (typeof obj !== "object") {
        obj = [obj];
      }
      if (isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }
    function merge() {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }
      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === "function") {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }
    function stripBOM(content) {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    }
    module.exports = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isFunction,
      isStream,
      isURLSearchParams,
      isStandardBrowserEnv,
      forEach,
      merge,
      extend,
      trim,
      stripBOM
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/buildURL.js
var require_buildURL = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/buildURL.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function encode(val) {
      return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }
    module.exports = function buildURL(url, params, paramsSerializer) {
      if (!params) {
        return url;
      }
      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];
        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === "undefined") {
            return;
          }
          if (utils.isArray(val)) {
            key = key + "[]";
          } else {
            val = [val];
          }
          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + "=" + encode(v));
          });
        });
        serializedParams = parts.join("&");
      }
      if (serializedParams) {
        var hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
      }
      return url;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/InterceptorManager.js
var require_InterceptorManager = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/InterceptorManager.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function InterceptorManager() {
      this.handlers = [];
    }
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };
    module.exports = InterceptorManager;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/normalizeHeaderName.js
var require_normalizeHeaderName = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/normalizeHeaderName.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/enhanceError.js
var require_enhanceError = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/enhanceError.js"(exports, module) {
    "use strict";
    module.exports = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }
      error.request = request;
      error.response = response;
      error.isAxiosError = true;
      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/createError.js
var require_createError = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/createError.js"(exports, module) {
    "use strict";
    var enhanceError = require_enhanceError();
    module.exports = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/settle.js
var require_settle = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/settle.js"(exports, module) {
    "use strict";
    var createError = require_createError();
    module.exports = function settle(resolve2, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve2(response);
      } else {
        reject(createError(
          "Request failed with status code " + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/cookies.js
var require_cookies = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/cookies.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = utils.isStandardBrowserEnv() ? (
      // Standard browser envs support document.cookie
      /* @__PURE__ */ (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path5, domain, secure) {
            var cookie = [];
            cookie.push(name + "=" + encodeURIComponent(value));
            if (utils.isNumber(expires)) {
              cookie.push("expires=" + new Date(expires).toGMTString());
            }
            if (utils.isString(path5)) {
              cookie.push("path=" + path5);
            }
            if (utils.isString(domain)) {
              cookie.push("domain=" + domain);
            }
            if (secure === true) {
              cookie.push("secure");
            }
            document.cookie = cookie.join("; ");
          },
          read: function read(name) {
            var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
            return match ? decodeURIComponent(match[3]) : null;
          },
          remove: function remove(name) {
            this.write(name, "", Date.now() - 864e5);
          }
        };
      })()
    ) : (
      // Non standard browser env (web workers, react-native) lack needed support.
      /* @__PURE__ */ (function nonStandardBrowserEnv() {
        return {
          write: function write() {
          },
          read: function read() {
            return null;
          },
          remove: function remove() {
          }
        };
      })()
    );
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isAbsoluteURL.js
var require_isAbsoluteURL = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isAbsoluteURL.js"(exports, module) {
    "use strict";
    module.exports = function isAbsoluteURL(url) {
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/combineURLs.js
var require_combineURLs = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/combineURLs.js"(exports, module) {
    "use strict";
    module.exports = function combineURLs(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/buildFullPath.js
var require_buildFullPath = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/buildFullPath.js"(exports, module) {
    "use strict";
    var isAbsoluteURL = require_isAbsoluteURL();
    var combineURLs = require_combineURLs();
    module.exports = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/parseHeaders.js
var require_parseHeaders = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/parseHeaders.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var ignoreDuplicateOf = [
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ];
    module.exports = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;
      if (!headers) {
        return parsed;
      }
      utils.forEach(headers.split("\n"), function parser(line) {
        i = line.indexOf(":");
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));
        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === "set-cookie") {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
          }
        }
      });
      return parsed;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isURLSameOrigin.js
var require_isURLSameOrigin = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isURLSameOrigin.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = utils.isStandardBrowserEnv() ? (
      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement("a");
        var originURL;
        function resolveURL(url) {
          var href = url;
          if (msie) {
            urlParsingNode.setAttribute("href", href);
            href = urlParsingNode.href;
          }
          urlParsingNode.setAttribute("href", href);
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
          };
        }
        originURL = resolveURL(window.location.href);
        return function isURLSameOrigin(requestURL) {
          var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
          return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
        };
      })()
    ) : (
      // Non standard browser envs (web workers, react-native) lack needed support.
      /* @__PURE__ */ (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
    );
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/adapters/xhr.js
var require_xhr = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/adapters/xhr.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var settle = require_settle();
    var cookies = require_cookies();
    var buildURL = require_buildURL();
    var buildFullPath = require_buildFullPath();
    var parseHeaders = require_parseHeaders();
    var isURLSameOrigin = require_isURLSameOrigin();
    var createError = require_createError();
    module.exports = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve2, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        if (utils.isFormData(requestData)) {
          delete requestHeaders["Content-Type"];
        }
        var request = new XMLHttpRequest();
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
          requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
        }
        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
        request.timeout = config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle(resolve2, reject, response);
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(createError("Request aborted", config, "ECONNABORTED", request));
          request = null;
        };
        request.onerror = function handleError() {
          reject(createError("Network Error", config, null, request));
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = "timeout of " + config.timeout + "ms exceeded";
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            config.transitional && config.transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED",
            request
          ));
          request = null;
        };
        if (utils.isStandardBrowserEnv()) {
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : void 0;
          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }
        if ("setRequestHeader" in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
              delete requestHeaders[key];
            } else {
              request.setRequestHeader(key, val);
            }
          });
        }
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = config.responseType;
        }
        if (typeof config.onDownloadProgress === "function") {
          request.addEventListener("progress", config.onDownloadProgress);
        }
        if (typeof config.onUploadProgress === "function" && request.upload) {
          request.upload.addEventListener("progress", config.onUploadProgress);
        }
        if (config.cancelToken) {
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }
            request.abort();
            reject(cancel);
            request = null;
          });
        }
        if (!requestData) {
          requestData = null;
        }
        request.send(requestData);
      });
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/ms/index.js
var require_ms = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/common.js
var require_common = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/node.js
var require_node = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/node.js"(exports, module) {
    var tty = __require("tty");
    var util = __require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = __require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.format(...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/index.js
var require_src = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/debug/src/index.js"(exports, module) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node();
    }
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/follow-redirects/debug.js
var require_debug = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/follow-redirects/debug.js"(exports, module) {
    var debug;
    module.exports = function() {
      if (!debug) {
        try {
          debug = require_src()("follow-redirects");
        } catch (error) {
        }
        if (typeof debug !== "function") {
          debug = function() {
          };
        }
      }
      debug.apply(null, arguments);
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/follow-redirects/index.js"(exports, module) {
    var url = __require("url");
    var URL = url.URL;
    var http2 = __require("http");
    var https2 = __require("https");
    var Writable = __require("stream").Writable;
    var assert = __require("assert");
    var debug = require_debug();
    (function detectUnsupportedEnvironment() {
      var looksLikeNode = typeof process !== "undefined";
      var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
      var looksLikeV8 = isFunction(Error.captureStackTrace);
      if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
        console.warn("The follow-redirects package should be excluded from browser builds.");
      }
    })();
    var useNativeURL = false;
    try {
      assert(new URL(""));
    } catch (error) {
      useNativeURL = error.code === "ERR_INVALID_URL";
    }
    var sensitiveHeaders = [
      "Authorization",
      "Proxy-Authorization",
      "Cookie"
    ];
    var preservedUrlFields = [
      "auth",
      "host",
      "hostname",
      "href",
      "path",
      "pathname",
      "port",
      "protocol",
      "query",
      "search",
      "hash"
    ];
    var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
    var eventHandlers = /* @__PURE__ */ Object.create(null);
    events.forEach(function(event) {
      eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
      };
    });
    var InvalidUrlError = createErrorType(
      "ERR_INVALID_URL",
      "Invalid URL",
      TypeError
    );
    var RedirectionError = createErrorType(
      "ERR_FR_REDIRECTION_FAILURE",
      "Redirected request failed"
    );
    var TooManyRedirectsError = createErrorType(
      "ERR_FR_TOO_MANY_REDIRECTS",
      "Maximum number of redirects exceeded",
      RedirectionError
    );
    var MaxBodyLengthExceededError = createErrorType(
      "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
      "Request body larger than maxBodyLength limit"
    );
    var WriteAfterEndError = createErrorType(
      "ERR_STREAM_WRITE_AFTER_END",
      "write after end"
    );
    var destroy = Writable.prototype.destroy || noop;
    function RedirectableRequest(options, responseCallback) {
      Writable.call(this);
      this._sanitizeOptions(options);
      this._options = options;
      this._ended = false;
      this._ending = false;
      this._redirectCount = 0;
      this._redirects = [];
      this._requestBodyLength = 0;
      this._requestBodyBuffers = [];
      if (responseCallback) {
        this.on("response", responseCallback);
      }
      var self = this;
      this._onNativeResponse = function(response) {
        try {
          self._processResponse(response);
        } catch (cause) {
          self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
        }
      };
      this._headerFilter = new RegExp("^(?:" + sensitiveHeaders.concat(options.sensitiveHeaders).map(escapeRegex).join("|") + ")$", "i");
      this._performRequest();
    }
    RedirectableRequest.prototype = Object.create(Writable.prototype);
    RedirectableRequest.prototype.abort = function() {
      destroyRequest(this._currentRequest);
      this._currentRequest.abort();
      this.emit("abort");
    };
    RedirectableRequest.prototype.destroy = function(error) {
      destroyRequest(this._currentRequest, error);
      destroy.call(this, error);
      return this;
    };
    RedirectableRequest.prototype.write = function(data, encoding, callback) {
      if (this._ending) {
        throw new WriteAfterEndError();
      }
      if (!isString(data) && !isBuffer(data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
      }
      if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
      }
      if (data.length === 0) {
        if (callback) {
          callback();
        }
        return;
      }
      if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({ data, encoding });
        this._currentRequest.write(data, encoding, callback);
      } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
      }
    };
    RedirectableRequest.prototype.end = function(data, encoding, callback) {
      if (isFunction(data)) {
        callback = data;
        data = encoding = null;
      } else if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
      }
      if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
      } else {
        var self = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
          self._ended = true;
          currentRequest.end(null, null, callback);
        });
        this._ending = true;
      }
    };
    RedirectableRequest.prototype.setHeader = function(name, value) {
      this._options.headers[name] = value;
      this._currentRequest.setHeader(name, value);
    };
    RedirectableRequest.prototype.removeHeader = function(name) {
      delete this._options.headers[name];
      this._currentRequest.removeHeader(name);
    };
    RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
      var self = this;
      function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
      }
      function startTimer(socket) {
        if (self._timeout) {
          clearTimeout(self._timeout);
        }
        self._timeout = setTimeout(function() {
          self.emit("timeout");
          clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
      }
      function clearTimer() {
        if (self._timeout) {
          clearTimeout(self._timeout);
          self._timeout = null;
        }
        self.removeListener("abort", clearTimer);
        self.removeListener("error", clearTimer);
        self.removeListener("response", clearTimer);
        self.removeListener("close", clearTimer);
        if (callback) {
          self.removeListener("timeout", callback);
        }
        if (!self.socket) {
          self._currentRequest.removeListener("socket", startTimer);
        }
      }
      if (callback) {
        this.on("timeout", callback);
      }
      if (this.socket) {
        startTimer(this.socket);
      } else {
        this._currentRequest.once("socket", startTimer);
      }
      this.on("socket", destroyOnTimeout);
      this.on("abort", clearTimer);
      this.on("error", clearTimer);
      this.on("response", clearTimer);
      this.on("close", clearTimer);
      return this;
    };
    [
      "flushHeaders",
      "getHeader",
      "setNoDelay",
      "setSocketKeepAlive"
    ].forEach(function(method) {
      RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
      };
    });
    ["aborted", "connection", "socket"].forEach(function(property) {
      Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
          return this._currentRequest[property];
        }
      });
    });
    RedirectableRequest.prototype._sanitizeOptions = function(options) {
      if (!options.headers) {
        options.headers = {};
      }
      if (!isArray(options.sensitiveHeaders)) {
        options.sensitiveHeaders = [];
      }
      if (options.host) {
        if (!options.hostname) {
          options.hostname = options.host;
        }
        delete options.host;
      }
      if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
          options.pathname = options.path;
        } else {
          options.pathname = options.path.substring(0, searchPos);
          options.search = options.path.substring(searchPos);
        }
      }
    };
    RedirectableRequest.prototype._performRequest = function() {
      var protocol = this._options.protocol;
      var nativeProtocol = this._options.nativeProtocols[protocol];
      if (!nativeProtocol) {
        throw new TypeError("Unsupported protocol " + protocol);
      }
      if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
      }
      var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
      request._redirectable = this;
      for (var event of events) {
        request.on(event, eventHandlers[event]);
      }
      this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : (
        // When making a request to a proxy, […]
        // a client MUST send the target URI in absolute-form […].
        this._options.path
      );
      if (this._isRedirect) {
        var i = 0;
        var self = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
          if (request === self._currentRequest) {
            if (error) {
              self.emit("error", error);
            } else if (i < buffers.length) {
              var buffer = buffers[i++];
              if (!request.finished) {
                request.write(buffer.data, buffer.encoding, writeNext);
              }
            } else if (self._ended) {
              request.end();
            }
          }
        })();
      }
    };
    RedirectableRequest.prototype._processResponse = function(response) {
      var statusCode = response.statusCode;
      if (this._options.trackRedirects) {
        this._redirects.push({
          url: this._currentUrl,
          headers: response.headers,
          statusCode
        });
      }
      var location = response.headers.location;
      if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response.responseUrl = this._currentUrl;
        response.redirects = this._redirects;
        this.emit("response", response);
        this._requestBodyBuffers = [];
        return;
      }
      destroyRequest(this._currentRequest);
      response.destroy();
      if (++this._redirectCount > this._options.maxRedirects) {
        throw new TooManyRedirectsError();
      }
      var requestHeaders;
      var beforeRedirect = this._options.beforeRedirect;
      if (beforeRedirect) {
        requestHeaders = Object.assign({
          // The Host header was set by nativeProtocol.request
          Host: response.req.getHeader("host")
        }, this._options.headers);
      }
      var method = this._options.method;
      if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
      // the server is redirecting the user agent to a different resource […]
      // A user agent can perform a retrieval request targeting that URI
      // (a GET or HEAD request if using HTTP) […]
      statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
      }
      var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
      var currentUrlParts = parseUrl(this._currentUrl);
      var currentHost = currentHostHeader || currentUrlParts.host;
      var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));
      var redirectUrl = resolveUrl(location, currentUrl);
      debug("redirecting to", redirectUrl.href);
      this._isRedirect = true;
      spreadUrlObject(redirectUrl, this._options);
      if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
        removeMatchingHeaders(this._headerFilter, this._options.headers);
      }
      if (isFunction(beforeRedirect)) {
        var responseDetails = {
          headers: response.headers,
          statusCode
        };
        var requestDetails = {
          url: currentUrl,
          method,
          headers: requestHeaders
        };
        beforeRedirect(this._options, responseDetails, requestDetails);
        this._sanitizeOptions(this._options);
      }
      this._performRequest();
    };
    function wrap(protocols) {
      var exports2 = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
      };
      var nativeProtocols = {};
      Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
        function request(input, options, callback) {
          if (isURL(input)) {
            input = spreadUrlObject(input);
          } else if (isString(input)) {
            input = spreadUrlObject(parseUrl(input));
          } else {
            callback = options;
            options = validateUrl(input);
            input = { protocol };
          }
          if (isFunction(options)) {
            callback = options;
            options = null;
          }
          options = Object.assign({
            maxRedirects: exports2.maxRedirects,
            maxBodyLength: exports2.maxBodyLength
          }, input, options);
          options.nativeProtocols = nativeProtocols;
          if (!isString(options.host) && !isString(options.hostname)) {
            options.hostname = "::1";
          }
          assert.equal(options.protocol, protocol, "protocol mismatch");
          debug("options", options);
          return new RedirectableRequest(options, callback);
        }
        function get(input, options, callback) {
          var wrappedRequest = wrappedProtocol.request(input, options, callback);
          wrappedRequest.end();
          return wrappedRequest;
        }
        Object.defineProperties(wrappedProtocol, {
          request: { value: request, configurable: true, enumerable: true, writable: true },
          get: { value: get, configurable: true, enumerable: true, writable: true }
        });
      });
      return exports2;
    }
    function noop() {
    }
    function parseUrl(input) {
      var parsed;
      if (useNativeURL) {
        parsed = new URL(input);
      } else {
        parsed = validateUrl(url.parse(input));
        if (!isString(parsed.protocol)) {
          throw new InvalidUrlError({ input });
        }
      }
      return parsed;
    }
    function resolveUrl(relative, base) {
      return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
    }
    function validateUrl(input) {
      if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
        throw new InvalidUrlError({ input: input.href || input });
      }
      if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
        throw new InvalidUrlError({ input: input.href || input });
      }
      return input;
    }
    function spreadUrlObject(urlObject, target) {
      var spread = target || {};
      for (var key of preservedUrlFields) {
        spread[key] = urlObject[key];
      }
      if (spread.hostname.startsWith("[")) {
        spread.hostname = spread.hostname.slice(1, -1);
      }
      if (spread.port !== "") {
        spread.port = Number(spread.port);
      }
      spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
      return spread;
    }
    function removeMatchingHeaders(regex, headers) {
      var lastValue;
      for (var header in headers) {
        if (regex.test(header)) {
          lastValue = headers[header];
          delete headers[header];
        }
      }
      return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
    }
    function createErrorType(code, message, baseClass) {
      function CustomError(properties) {
        if (isFunction(Error.captureStackTrace)) {
          Error.captureStackTrace(this, this.constructor);
        }
        Object.assign(this, properties || {});
        this.code = code;
        this.message = this.cause ? message + ": " + this.cause.message : message;
      }
      CustomError.prototype = new (baseClass || Error)();
      Object.defineProperties(CustomError.prototype, {
        constructor: {
          value: CustomError,
          enumerable: false
        },
        name: {
          value: "Error [" + code + "]",
          enumerable: false
        }
      });
      return CustomError;
    }
    function destroyRequest(request, error) {
      for (var event of events) {
        request.removeListener(event, eventHandlers[event]);
      }
      request.on("error", noop);
      request.destroy(error);
    }
    function isSubdomain(subdomain, domain) {
      assert(isString(subdomain) && isString(domain));
      var dot = subdomain.length - domain.length - 1;
      return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
    }
    function isArray(value) {
      return value instanceof Array;
    }
    function isString(value) {
      return typeof value === "string" || value instanceof String;
    }
    function isFunction(value) {
      return typeof value === "function";
    }
    function isBuffer(value) {
      return typeof value === "object" && "length" in value;
    }
    function isURL(value) {
      return URL && value instanceof URL;
    }
    function escapeRegex(regex) {
      return regex.replace(/[\]\\/()*+?.$]/g, "\\$&");
    }
    module.exports = wrap({ http: http2, https: https2 });
    module.exports.wrap = wrap;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/package.json
var require_package = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/package.json"(exports, module) {
    module.exports = {
      name: "axios",
      version: "0.21.4",
      description: "Promise based HTTP client for the browser and node.js",
      main: "index.js",
      scripts: {
        test: "grunt test",
        start: "node ./sandbox/server.js",
        build: "NODE_ENV=production grunt build",
        preversion: "npm test",
        version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json",
        postversion: "git push && git push --tags",
        examples: "node ./examples/server.js",
        coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
        fix: "eslint --fix lib/**/*.js"
      },
      repository: {
        type: "git",
        url: "https://github.com/axios/axios.git"
      },
      keywords: [
        "xhr",
        "http",
        "ajax",
        "promise",
        "node"
      ],
      author: "Matt Zabriskie",
      license: "MIT",
      bugs: {
        url: "https://github.com/axios/axios/issues"
      },
      homepage: "https://axios-http.com",
      devDependencies: {
        coveralls: "^3.0.0",
        "es6-promise": "^4.2.4",
        grunt: "^1.3.0",
        "grunt-banner": "^0.6.0",
        "grunt-cli": "^1.2.0",
        "grunt-contrib-clean": "^1.1.0",
        "grunt-contrib-watch": "^1.0.0",
        "grunt-eslint": "^23.0.0",
        "grunt-karma": "^4.0.0",
        "grunt-mocha-test": "^0.13.3",
        "grunt-ts": "^6.0.0-beta.19",
        "grunt-webpack": "^4.0.2",
        "istanbul-instrumenter-loader": "^1.0.0",
        "jasmine-core": "^2.4.1",
        karma: "^6.3.2",
        "karma-chrome-launcher": "^3.1.0",
        "karma-firefox-launcher": "^2.1.0",
        "karma-jasmine": "^1.1.1",
        "karma-jasmine-ajax": "^0.1.13",
        "karma-safari-launcher": "^1.0.0",
        "karma-sauce-launcher": "^4.3.6",
        "karma-sinon": "^1.0.5",
        "karma-sourcemap-loader": "^0.3.8",
        "karma-webpack": "^4.0.2",
        "load-grunt-tasks": "^3.5.2",
        minimist: "^1.2.0",
        mocha: "^8.2.1",
        sinon: "^4.5.0",
        "terser-webpack-plugin": "^4.2.3",
        typescript: "^4.0.5",
        "url-search-params": "^0.10.0",
        webpack: "^4.44.2",
        "webpack-dev-server": "^3.11.0"
      },
      browser: {
        "./lib/adapters/http.js": "./lib/adapters/xhr.js"
      },
      jsdelivr: "dist/axios.min.js",
      unpkg: "dist/axios.min.js",
      typings: "./index.d.ts",
      dependencies: {
        "follow-redirects": "^1.14.0"
      },
      bundlesize: [
        {
          path: "./dist/axios.min.js",
          threshold: "5kB"
        }
      ]
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/adapters/http.js
var require_http = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/adapters/http.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var settle = require_settle();
    var buildFullPath = require_buildFullPath();
    var buildURL = require_buildURL();
    var http2 = __require("http");
    var https2 = __require("https");
    var httpFollow = require_follow_redirects().http;
    var httpsFollow = require_follow_redirects().https;
    var url = __require("url");
    var zlib = __require("zlib");
    var pkg = require_package();
    var createError = require_createError();
    var enhanceError = require_enhanceError();
    var isHttps = /https:?/;
    function setProxy(options, proxy, location) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.port = proxy.port;
      options.path = location;
      if (proxy.auth) {
        var base64 = Buffer.from(proxy.auth.username + ":" + proxy.auth.password, "utf8").toString("base64");
        options.headers["Proxy-Authorization"] = "Basic " + base64;
      }
      options.beforeRedirect = function beforeRedirect(redirection) {
        redirection.headers.host = redirection.host;
        setProxy(redirection, proxy, redirection.href);
      };
    }
    module.exports = function httpAdapter(config) {
      return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
        var resolve2 = function resolve3(value) {
          resolvePromise(value);
        };
        var reject = function reject2(value) {
          rejectPromise(value);
        };
        var data = config.data;
        var headers = config.headers;
        if ("User-Agent" in headers || "user-agent" in headers) {
          if (!headers["User-Agent"] && !headers["user-agent"]) {
            delete headers["User-Agent"];
            delete headers["user-agent"];
          }
        } else {
          headers["User-Agent"] = "axios/" + pkg.version;
        }
        if (data && !utils.isStream(data)) {
          if (Buffer.isBuffer(data)) {
          } else if (utils.isArrayBuffer(data)) {
            data = Buffer.from(new Uint8Array(data));
          } else if (utils.isString(data)) {
            data = Buffer.from(data, "utf-8");
          } else {
            return reject(createError(
              "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
              config
            ));
          }
          headers["Content-Length"] = data.length;
        }
        var auth = void 0;
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password || "";
          auth = username + ":" + password;
        }
        var fullPath = buildFullPath(config.baseURL, config.url);
        var parsed = url.parse(fullPath);
        var protocol = parsed.protocol || "http:";
        if (!auth && parsed.auth) {
          var urlAuth = parsed.auth.split(":");
          var urlUsername = urlAuth[0] || "";
          var urlPassword = urlAuth[1] || "";
          auth = urlUsername + ":" + urlPassword;
        }
        if (auth) {
          delete headers.Authorization;
        }
        var isHttpsRequest = isHttps.test(protocol);
        var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
        var options = {
          path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ""),
          method: config.method.toUpperCase(),
          headers,
          agent,
          agents: { http: config.httpAgent, https: config.httpsAgent },
          auth
        };
        if (config.socketPath) {
          options.socketPath = config.socketPath;
        } else {
          options.hostname = parsed.hostname;
          options.port = parsed.port;
        }
        var proxy = config.proxy;
        if (!proxy && proxy !== false) {
          var proxyEnv = protocol.slice(0, -1) + "_proxy";
          var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
          if (proxyUrl) {
            var parsedProxyUrl = url.parse(proxyUrl);
            var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
            var shouldProxy = true;
            if (noProxyEnv) {
              var noProxy = noProxyEnv.split(",").map(function trim(s) {
                return s.trim();
              });
              shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
                if (!proxyElement) {
                  return false;
                }
                if (proxyElement === "*") {
                  return true;
                }
                if (proxyElement[0] === "." && parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
                  return true;
                }
                return parsed.hostname === proxyElement;
              });
            }
            if (shouldProxy) {
              proxy = {
                host: parsedProxyUrl.hostname,
                port: parsedProxyUrl.port,
                protocol: parsedProxyUrl.protocol
              };
              if (parsedProxyUrl.auth) {
                var proxyUrlAuth = parsedProxyUrl.auth.split(":");
                proxy.auth = {
                  username: proxyUrlAuth[0],
                  password: proxyUrlAuth[1]
                };
              }
            }
          }
        }
        if (proxy) {
          options.headers.host = parsed.hostname + (parsed.port ? ":" + parsed.port : "");
          setProxy(options, proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
        }
        var transport;
        var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
        if (config.transport) {
          transport = config.transport;
        } else if (config.maxRedirects === 0) {
          transport = isHttpsProxy ? https2 : http2;
        } else {
          if (config.maxRedirects) {
            options.maxRedirects = config.maxRedirects;
          }
          transport = isHttpsProxy ? httpsFollow : httpFollow;
        }
        if (config.maxBodyLength > -1) {
          options.maxBodyLength = config.maxBodyLength;
        }
        var req = transport.request(options, function handleResponse(res) {
          if (req.aborted) return;
          var stream = res;
          var lastRequest = res.req || req;
          if (res.statusCode !== 204 && lastRequest.method !== "HEAD" && config.decompress !== false) {
            switch (res.headers["content-encoding"]) {
              /*eslint default-case:0*/
              case "gzip":
              case "compress":
              case "deflate":
                stream = stream.pipe(zlib.createUnzip());
                delete res.headers["content-encoding"];
                break;
            }
          }
          var response = {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            config,
            request: lastRequest
          };
          if (config.responseType === "stream") {
            response.data = stream;
            settle(resolve2, reject, response);
          } else {
            var responseBuffer = [];
            var totalResponseBytes = 0;
            stream.on("data", function handleStreamData(chunk) {
              responseBuffer.push(chunk);
              totalResponseBytes += chunk.length;
              if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
                stream.destroy();
                reject(createError(
                  "maxContentLength size of " + config.maxContentLength + " exceeded",
                  config,
                  null,
                  lastRequest
                ));
              }
            });
            stream.on("error", function handleStreamError(err) {
              if (req.aborted) return;
              reject(enhanceError(err, config, null, lastRequest));
            });
            stream.on("end", function handleStreamEnd() {
              var responseData = Buffer.concat(responseBuffer);
              if (config.responseType !== "arraybuffer") {
                responseData = responseData.toString(config.responseEncoding);
                if (!config.responseEncoding || config.responseEncoding === "utf8") {
                  responseData = utils.stripBOM(responseData);
                }
              }
              response.data = responseData;
              settle(resolve2, reject, response);
            });
          }
        });
        req.on("error", function handleRequestError(err) {
          if (req.aborted && err.code !== "ERR_FR_TOO_MANY_REDIRECTS") return;
          reject(enhanceError(err, config, null, req));
        });
        if (config.timeout) {
          var timeout = parseInt(config.timeout, 10);
          if (isNaN(timeout)) {
            reject(createError(
              "error trying to parse `config.timeout` to int",
              config,
              "ERR_PARSE_TIMEOUT",
              req
            ));
            return;
          }
          req.setTimeout(timeout, function handleRequestTimeout() {
            req.abort();
            reject(createError(
              "timeout of " + timeout + "ms exceeded",
              config,
              config.transitional && config.transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED",
              req
            ));
          });
        }
        if (config.cancelToken) {
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (req.aborted) return;
            req.abort();
            reject(cancel);
          });
        }
        if (utils.isStream(data)) {
          data.on("error", function handleStreamError(err) {
            reject(enhanceError(err, config, null, req));
          }).pipe(req);
        } else {
          req.end(data);
        }
      });
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/defaults.js
var require_defaults = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/defaults.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var normalizeHeaderName = require_normalizeHeaderName();
    var enhanceError = require_enhanceError();
    var DEFAULT_CONTENT_TYPE = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"])) {
        headers["Content-Type"] = value;
      }
    }
    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== "undefined") {
        adapter = require_xhr();
      } else if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") {
        adapter = require_http();
      }
      return adapter;
    }
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== "SyntaxError") {
            throw e;
          }
        }
      }
      return (encoder || JSON.stringify)(rawValue);
    }
    var defaults = {
      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },
      adapter: getDefaultAdapter(),
      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, "Accept");
        normalizeHeaderName(headers, "Content-Type");
        if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
          return data.toString();
        }
        if (utils.isObject(data) || headers && headers["Content-Type"] === "application/json") {
          setContentTypeIfUnset(headers, "application/json");
          return stringifySafely(data);
        }
        return data;
      }],
      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === "json";
        if (strictJSONParsing || forcedJSONParsing && utils.isString(data) && data.length) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw enhanceError(e, this, "E_JSON_PARSE");
              }
              throw e;
            }
          }
        }
        return data;
      }],
      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };
    defaults.headers = {
      common: {
        "Accept": "application/json, text/plain, */*"
      }
    };
    utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });
    utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });
    module.exports = defaults;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/transformData.js
var require_transformData = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/transformData.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var defaults = require_defaults();
    module.exports = function transformData(data, headers, fns) {
      var context = this || defaults;
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });
      return data;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/isCancel.js
var require_isCancel = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/isCancel.js"(exports, module) {
    "use strict";
    module.exports = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/dispatchRequest.js
var require_dispatchRequest = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/dispatchRequest.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var transformData = require_transformData();
    var isCancel = require_isCancel();
    var defaults = require_defaults();
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }
    module.exports = function dispatchRequest(config) {
      throwIfCancellationRequested(config);
      config.headers = config.headers || {};
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );
      utils.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );
      var adapter = config.adapter || defaults.adapter;
      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );
        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }
        return Promise.reject(reason);
      });
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/mergeConfig.js
var require_mergeConfig = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/mergeConfig.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = function mergeConfig(config1, config2) {
      config2 = config2 || {};
      var config = {};
      var valueFromConfig2Keys = ["url", "method", "data"];
      var mergeDeepPropertiesKeys = ["headers", "auth", "proxy", "params"];
      var defaultToConfig2Keys = [
        "baseURL",
        "transformRequest",
        "transformResponse",
        "paramsSerializer",
        "timeout",
        "timeoutMessage",
        "withCredentials",
        "adapter",
        "responseType",
        "xsrfCookieName",
        "xsrfHeaderName",
        "onUploadProgress",
        "onDownloadProgress",
        "decompress",
        "maxContentLength",
        "maxBodyLength",
        "maxRedirects",
        "transport",
        "httpAgent",
        "httpsAgent",
        "cancelToken",
        "socketPath",
        "responseEncoding"
      ];
      var directMergeKeys = ["validateStatus"];
      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(void 0, config1[prop]);
        }
      }
      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(void 0, config2[prop]);
        }
      });
      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(void 0, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(void 0, config1[prop]);
        }
      });
      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(void 0, config1[prop]);
        }
      });
      var axiosKeys = valueFromConfig2Keys.concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
      var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
        return axiosKeys.indexOf(key) === -1;
      });
      utils.forEach(otherKeys, mergeDeepProperties);
      return config;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/validator.js
var require_validator = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/validator.js"(exports, module) {
    "use strict";
    var pkg = require_package();
    var validators = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach(function(type, i) {
      validators[type] = function validator(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
      };
    });
    var deprecatedWarnings = {};
    var currentVerArr = pkg.version.split(".");
    function isOlderVersion(version, thanVersion) {
      var pkgVersionArr = thanVersion ? thanVersion.split(".") : currentVerArr;
      var destVer = version.split(".");
      for (var i = 0; i < 3; i++) {
        if (pkgVersionArr[i] > destVer[i]) {
          return true;
        } else if (pkgVersionArr[i] < destVer[i]) {
          return false;
        }
      }
      return false;
    }
    validators.transitional = function transitional(validator, version, message) {
      var isDeprecated = version && isOlderVersion(version);
      function formatMessage(opt, desc) {
        return "[Axios v" + pkg.version + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, " has been removed in " + version));
        }
        if (isDeprecated && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(
            formatMessage(
              opt,
              " has been deprecated since v" + version + " and will be removed in the near future"
            )
          );
        }
        return validator ? validator(value, opt, opts) : true;
      };
    };
    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === void 0 || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError("option " + opt + " must be " + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error("Unknown option " + opt);
        }
      }
    }
    module.exports = {
      isOlderVersion,
      assertOptions,
      validators
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/Axios.js
var require_Axios = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/core/Axios.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var buildURL = require_buildURL();
    var InterceptorManager = require_InterceptorManager();
    var dispatchRequest = require_dispatchRequest();
    var mergeConfig = require_mergeConfig();
    var validator = require_validator();
    var validators = validator.validators;
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    Axios.prototype.request = function request(config) {
      if (typeof config === "string") {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }
      config = mergeConfig(this.defaults, config);
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = "get";
      }
      var transitional = config.transitional;
      if (transitional !== void 0) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
          forcedJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
          clarifyTimeoutError: validators.transitional(validators.boolean, "1.0.0")
        }, false);
      }
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      var promise;
      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, void 0];
        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);
        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
      }
      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }
      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }
      return promise;
    };
    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, "");
    };
    utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });
    utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data
        }));
      };
    });
    module.exports = Axios;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/Cancel.js
var require_Cancel = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/Cancel.js"(exports, module) {
    "use strict";
    function Cancel(message) {
      this.message = message;
    }
    Cancel.prototype.toString = function toString() {
      return "Cancel" + (this.message ? ": " + this.message : "");
    };
    Cancel.prototype.__CANCEL__ = true;
    module.exports = Cancel;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/CancelToken.js
var require_CancelToken = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/cancel/CancelToken.js"(exports, module) {
    "use strict";
    var Cancel = require_Cancel();
    function CancelToken(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve2) {
        resolvePromise = resolve2;
      });
      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          return;
        }
        token.reason = new Cancel(message);
        resolvePromise(token.reason);
      });
    }
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    };
    module.exports = CancelToken;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/spread.js
var require_spread = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/spread.js"(exports, module) {
    "use strict";
    module.exports = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isAxiosError.js
var require_isAxiosError = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/helpers/isAxiosError.js"(exports, module) {
    "use strict";
    module.exports = function isAxiosError(payload) {
      return typeof payload === "object" && payload.isAxiosError === true;
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/axios.js
var require_axios = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/lib/axios.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var bind = require_bind();
    var Axios = require_Axios();
    var mergeConfig = require_mergeConfig();
    var defaults = require_defaults();
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind(Axios.prototype.request, context);
      utils.extend(instance, Axios.prototype, context);
      utils.extend(instance, context);
      return instance;
    }
    var axios = createInstance(defaults);
    axios.Axios = Axios;
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };
    axios.Cancel = require_Cancel();
    axios.CancelToken = require_CancelToken();
    axios.isCancel = require_isCancel();
    axios.all = function all(promises3) {
      return Promise.all(promises3);
    };
    axios.spread = require_spread();
    axios.isAxiosError = require_isAxiosError();
    module.exports = axios;
    module.exports.default = axios;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/index.js
var require_axios2 = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/node_modules/axios/index.js"(exports, module) {
    module.exports = require_axios();
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/HeaderHostTransformer.js
var require_HeaderHostTransformer = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/HeaderHostTransformer.js"(exports, module) {
    var { Transform } = __require("stream");
    var HeaderHostTransformer = class extends Transform {
      constructor(opts = {}) {
        super(opts);
        this.host = opts.host || "localhost";
        this.replaced = false;
      }
      _transform(data, encoding, callback) {
        callback(
          null,
          this.replaced ? data : data.toString().replace(/(\r\n[Hh]ost: )\S+/, (match, $1) => {
            this.replaced = true;
            return $1 + this.host;
          })
        );
      }
    };
    module.exports = HeaderHostTransformer;
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/TunnelCluster.js
var require_TunnelCluster = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/TunnelCluster.js"(exports, module) {
    var { EventEmitter } = __require("events");
    var debug = require_src()("localtunnel:client");
    var fs4 = __require("fs");
    var net = __require("net");
    var tls = __require("tls");
    var HeaderHostTransformer = require_HeaderHostTransformer();
    module.exports = class TunnelCluster extends EventEmitter {
      constructor(opts = {}) {
        super(opts);
        this.opts = opts;
      }
      open() {
        const opt = this.opts;
        const remoteHostOrIp = opt.remote_ip || opt.remote_host;
        const remotePort = opt.remote_port;
        const localHost = opt.local_host || "localhost";
        const localPort = opt.local_port;
        const localProtocol = opt.local_https ? "https" : "http";
        const allowInvalidCert = opt.allow_invalid_cert;
        debug(
          "establishing tunnel %s://%s:%s <> %s:%s",
          localProtocol,
          localHost,
          localPort,
          remoteHostOrIp,
          remotePort
        );
        const remote = net.connect({
          host: remoteHostOrIp,
          port: remotePort
        });
        remote.setKeepAlive(true);
        remote.on("error", (err) => {
          debug("got remote connection error", err.message);
          if (err.code === "ECONNREFUSED") {
            this.emit(
              "error",
              new Error(
                `connection refused: ${remoteHostOrIp}:${remotePort} (check your firewall settings)`
              )
            );
          }
          remote.end();
        });
        const connLocal = () => {
          if (remote.destroyed) {
            debug("remote destroyed");
            this.emit("dead");
            return;
          }
          debug("connecting locally to %s://%s:%d", localProtocol, localHost, localPort);
          remote.pause();
          if (allowInvalidCert) {
            debug("allowing invalid certificates");
          }
          const getLocalCertOpts = () => allowInvalidCert ? { rejectUnauthorized: false } : {
            cert: fs4.readFileSync(opt.local_cert),
            key: fs4.readFileSync(opt.local_key),
            ca: opt.local_ca ? [fs4.readFileSync(opt.local_ca)] : void 0
          };
          const local = opt.local_https ? tls.connect({ host: localHost, port: localPort, ...getLocalCertOpts() }) : net.connect({ host: localHost, port: localPort });
          const remoteClose = () => {
            debug("remote close");
            this.emit("dead");
            local.end();
          };
          remote.once("close", remoteClose);
          local.once("error", (err) => {
            debug("local error %s", err.message);
            local.end();
            remote.removeListener("close", remoteClose);
            if (err.code !== "ECONNREFUSED") {
              return remote.end();
            }
            setTimeout(connLocal, 1e3);
          });
          local.once("connect", () => {
            debug("connected locally");
            remote.resume();
            let stream = remote;
            if (opt.local_host) {
              debug("transform Host header to %s", opt.local_host);
              stream = remote.pipe(new HeaderHostTransformer({ host: opt.local_host }));
            }
            stream.pipe(local).pipe(remote);
            local.once("close", (hadError) => {
              debug("local connection closed [%s]", hadError);
            });
          });
        };
        remote.on("data", (data) => {
          const match = data.toString().match(/^(\w+) (\S+)/);
          if (match) {
            this.emit("request", {
              method: match[1],
              path: match[2]
            });
          }
        });
        remote.once("connect", () => {
          this.emit("open", remote);
          connLocal();
        });
      }
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/Tunnel.js
var require_Tunnel = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/lib/Tunnel.js"(exports, module) {
    var { parse } = __require("url");
    var { EventEmitter } = __require("events");
    var axios = require_axios2();
    var debug = require_src()("localtunnel:client");
    var TunnelCluster = require_TunnelCluster();
    module.exports = class Tunnel extends EventEmitter {
      constructor(opts = {}) {
        super(opts);
        this.opts = opts;
        this.closed = false;
        if (!this.opts.host) {
          this.opts.host = "https://localtunnel.me";
        }
      }
      _getInfo(body) {
        const { id, ip, port: port2, url, cached_url, max_conn_count } = body;
        const { host, port: local_port, local_host } = this.opts;
        const { local_https, local_cert, local_key, local_ca, allow_invalid_cert } = this.opts;
        return {
          name: id,
          url,
          cached_url,
          max_conn: max_conn_count || 1,
          remote_host: parse(host).hostname,
          remote_ip: ip,
          remote_port: port2,
          local_port,
          local_host,
          local_https,
          local_cert,
          local_key,
          local_ca,
          allow_invalid_cert
        };
      }
      // initialize connection
      // callback with connection info
      _init(cb) {
        const opt = this.opts;
        const getInfo = this._getInfo.bind(this);
        const params = {
          responseType: "json"
        };
        const baseUri = `${opt.host}/`;
        const assignedDomain = opt.subdomain;
        const uri = baseUri + (assignedDomain || "?new");
        (function getUrl() {
          axios.get(uri, params).then((res) => {
            const body = res.data;
            debug("got tunnel information", res.data);
            if (res.status !== 200) {
              const err = new Error(
                body && body.message || "localtunnel server returned an error, please try again"
              );
              return cb(err);
            }
            cb(null, getInfo(body));
          }).catch((err) => {
            debug(`tunnel server offline: ${err.message}, retry 1s`);
            return setTimeout(getUrl, 1e3);
          });
        })();
      }
      _establish(info) {
        this.setMaxListeners(info.max_conn + (EventEmitter.defaultMaxListeners || 10));
        this.tunnelCluster = new TunnelCluster(info);
        this.tunnelCluster.once("open", () => {
          this.emit("url", info.url);
        });
        this.tunnelCluster.on("error", (err) => {
          debug("got socket error", err.message);
          this.emit("error", err);
        });
        let tunnelCount = 0;
        this.tunnelCluster.on("open", (tunnel) => {
          tunnelCount++;
          debug("tunnel open [total: %d]", tunnelCount);
          const closeHandler = () => {
            tunnel.destroy();
          };
          if (this.closed) {
            return closeHandler();
          }
          this.once("close", closeHandler);
          tunnel.once("close", () => {
            this.removeListener("close", closeHandler);
          });
        });
        this.tunnelCluster.on("dead", () => {
          tunnelCount--;
          debug("tunnel dead [total: %d]", tunnelCount);
          if (this.closed) {
            return;
          }
          this.tunnelCluster.open();
        });
        this.tunnelCluster.on("request", (req) => {
          this.emit("request", req);
        });
        for (let count = 0; count < info.max_conn; ++count) {
          this.tunnelCluster.open();
        }
      }
      open(cb) {
        this._init((err, info) => {
          if (err) {
            return cb(err);
          }
          this.clientId = info.name;
          this.url = info.url;
          if (info.cached_url) {
            this.cachedUrl = info.cached_url;
          }
          this._establish(info);
          cb();
        });
      }
      close() {
        this.closed = true;
        this.emit("close");
      }
    };
  }
});

// ../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/localtunnel.js
var require_localtunnel = __commonJS({
  "../../../.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel/localtunnel.js"(exports, module) {
    var Tunnel = require_Tunnel();
    module.exports = function localtunnel(arg1, arg2, arg3) {
      const options = typeof arg1 === "object" ? arg1 : { ...arg2, port: arg1 };
      const callback = typeof arg1 === "object" ? arg2 : arg3;
      const client = new Tunnel(options);
      if (callback) {
        client.open((err) => err ? callback(err) : callback(null, client));
        return client;
      }
      return new Promise(
        (resolve2, reject) => client.open((err) => err ? reject(err) : resolve2(client))
      );
    };
  }
});

// main/index.ts
import * as fs3 from "fs";
import * as path4 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { app as app2, BrowserWindow as BrowserWindow2, Menu, logger as logger6, initDevToolsButtonState } from "@glaze/core/backend";

// main/handlers/index.ts
import * as path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// main/handlers/app.ts
import { logger } from "@glaze/core/backend";
var appHandlers = {
  // Example: Get app information
  getInfo: async () => {
    logger.info("app", "App info requested");
    return {
      name: "My Glaze App",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production"
    };
  }
  // TODO: Add your app handlers here
  // Example:
  // myMethod: async (params: { arg1: string }) => {
  //   return { result: 'success' };
  // }
};

// main/windows/settings-window.ts
import { BrowserWindow, logger as logger2 } from "@glaze/core/backend";

// main/windows/window-paths.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
var currentFilePath = fileURLToPath(import.meta.url);
var currentDirPath = path.dirname(currentFilePath);
var BUILD_ROOT = path.resolve(currentDirPath, "..");
function resolveWindowHtml(htmlFileName) {
  return path.join(BUILD_ROOT, htmlFileName);
}
function getWindowFileUrl(htmlFileName) {
  return pathToFileURL(resolveWindowHtml(htmlFileName)).toString();
}
function getPreloadPath() {
  return path.join(BUILD_ROOT, "assets", "preload.js");
}
async function getWindowUrl(htmlFileName) {
  const devServerHostFile = path.join(BUILD_ROOT, "..", ".devserverhost");
  if (fs.existsSync(devServerHostFile)) {
    try {
      const devServerHost = (await fs.promises.readFile(devServerHostFile, "utf-8")).trim();
      if (devServerHost) {
        return `${devServerHost}/${htmlFileName}`;
      }
    } catch {
    }
  }
  return getWindowFileUrl(htmlFileName);
}

// main/windows/settings-window.ts
var settingsWindow = null;
async function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    logger2.debug("settings", "Settings window already exists, showing it");
    settingsWindow.show();
    return;
  }
  logger2.info("settings", "Creating settings window");
  settingsWindow = new BrowserWindow({
    windowKey: "settings",
    width: 520,
    height: 300,
    minWidth: 400,
    minHeight: 200,
    title: "Settings",
    show: false,
    center: true,
    webPreferences: {
      preload: getPreloadPath()
    }
  });
  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
  const url = await getWindowUrl("settings-window.html");
  logger2.info("settings", "Loading settings URL", { url });
  await settingsWindow.loadURL(url);
}
function getSettingsWindow() {
  return settingsWindow;
}

// main/handlers/sync-handlers.ts
import { ipcMain, logger as logger4, shell } from "@glaze/core/backend";

// main/services/sync-service.ts
import * as fs2 from "node:fs/promises";
import * as http from "node:http";
import * as https from "node:https";
import * as os from "node:os";
import * as path2 from "node:path";
import { spawn } from "node:child_process";
import { app, logger as logger3 } from "@glaze/core/backend";
function isFileNotFound(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
var WEB_CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Canvas \u2014 Web</title>
<style>
  /* Glaze minimalistic \u2014 matches app's styles.css + @glaze/core */
  :root { --glaze-bg-app: #ffffff; --glaze-bg-sidebar: #f8f8f7; --glaze-bg-popover: #ffffff; --glaze-bg-well: #f5f5f5; --glaze-bg-control: #f0f0f0; --glaze-border-separator: #e5e5e5; --glaze-border-secondary: #d1d1d1; --glaze-text-primary: #111111; --glaze-text-secondary: #6b6b6b; --glaze-text-tertiary: #9a9a9a; --glaze-accent: #007aff; --glaze-accent-soft: rgba(0,122,255,0.08); --bg: var(--glaze-bg-app); --surface: var(--glaze-bg-sidebar); --text: var(--glaze-text-primary); --text-dim: var(--glaze-text-secondary); --accent: var(--glaze-accent); --accent-dim: #0056d6; --border: var(--glaze-border-separator); --radius: 8px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--glaze-bg-app); color: var(--glaze-text-primary); height: 100vh; display: flex; }
  .sidebar { width: 240px; min-width: 240px; background: var(--glaze-bg-sidebar); border-right: 1px solid var(--glaze-border-separator); display: flex; flex-direction: column; }
  .sidebar-header { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid var(--glaze-border-separator); }
  .sidebar-header h2 { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--glaze-text-tertiary); }
  .sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
  .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--glaze-text-primary); border: 1px solid transparent; }
  .sidebar-item:hover { background: #efefed; }
  .sidebar-item.active { background: var(--glaze-bg-popover); border-color: var(--glaze-border-separator); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--glaze-bg-sidebar); border-bottom: 1px solid var(--glaze-border-separator); display:none; }
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--glaze-bg-app); }
  .toolbar { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: rgba(248,248,247,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glaze-border-separator); gap: 12px; }
  .toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .toolbar-title { font-size: 13px; font-weight: 600; }
  .toolbar-meta { font-size: 11px; color: var(--glaze-text-tertiary); }
  .status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--glaze-text-tertiary); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #00c950; }
  .dot.offline { background: #ff3b30; }
  .dot.syncing { background: #ff9500; }
  .seg { display: flex; background: #ededec; border-radius: 999px; padding: 2px; gap: 1px; }
  .seg button { border: none; background: transparent; padding: 5px 9px; border-radius: 999px; cursor: pointer; font-size: 11px; font-weight: 500; color: var(--glaze-text-secondary); }
  .seg button.active { background: var(--glaze-bg-popover); color: var(--glaze-text-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.06); border: 1px solid var(--glaze-border-separator); }
  .btn { border: 1px solid transparent; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-glass { background: rgba(17,17,16,0.06); color: var(--glaze-text-primary); }
  .btn-glass:hover { background: rgba(17,17,16,0.1); }
  .btn-accent { background: var(--glaze-accent); color: white; border-color: var(--glaze-accent); }
  .btn-accent:hover { background: #0056d6; }
  .content { flex: 1; overflow-y: auto; padding: 24px; background: var(--glaze-bg-app); }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--glaze-text-tertiary); margin-bottom: 12px; }
  .project-card { background: var(--glaze-bg-popover); border: 1px solid var(--glaze-border-separator); border-radius: 10px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .project-card h3 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .project-meta { font-size: 11px; color: var(--glaze-text-tertiary); margin-bottom: 8px; }
  .sticky-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .sticky { padding: 12px; border-radius: 8px; font-size: 13px; min-height: 80px; white-space: pre-wrap; word-break: break-word; border: 1px solid; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .sticky.yellow { background: #fef3c7; color: #78350f; border-color: #fde68a; }
  .sticky.pink { background: #fce7f3; color: #831843; border-color: #fbcfe8; }
  .sticky.blue { background: #dbeafe; color: #1e3a8a; border-color: #bfdbfe; }
  .sticky.green { background: #d1fae5; color: #064e3b; border-color: #a7f3d0; }
  .sticky.purple { background: #ede9fe; color: #4c1d95; border-color: #ddd6fe; }
  .doc-list { display: flex; flex-direction: column; gap: 8px; }
  .doc-item { background: var(--glaze-bg-popover); border: 1px solid var(--glaze-border-separator); border-radius: 10px; padding: 14px; }
  .doc-item h4 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .doc-item p { font-size: 11px; color: var(--glaze-text-tertiary); line-height: 14px; }
  .phase-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .phase-badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; border: 1px solid transparent; }
  .phase-badge.discover { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
  .phase-badge.define { background: #f5f3ff; color: #6d28d9; border-color: #ede9fe; }
  .phase-badge.develop { background: #fff7ed; color: #9a3412; border-color: #ffedd5; }
  .phase-badge.deliver { background: #f0fdf4; color: #166534; border-color: #dcfce7; }
  .task-list { list-style: none; }
  .task-item { display: flex; align-items: center; gap: 8px; padding: 7px 0; font-size: 13px; border-bottom: 1px solid var(--glaze-border-separator); }
  .task-item:last-child { border-bottom: none; }
  .task-item input { accent-color: var(--glaze-accent); }
  .task-item.done span { text-decoration: line-through; color: var(--glaze-text-tertiary); }
  .notes { background: var(--glaze-bg-well); border: 1px solid var(--glaze-border-separator); border-radius: 8px; padding: 12px; font-size: 13px; min-height: 60px; white-space: pre-wrap; }
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 8px; }
  .empty h3 { font-size: 13px; font-weight: 600; }
  .empty p { font-size: 11px; color: var(--glaze-text-tertiary); max-width: 320px; line-height: 14px; }
  .save-bar { height: 28px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; background: var(--glaze-bg-sidebar); border-top: 1px solid var(--glaze-border-separator); font-size: 11px; color: var(--glaze-text-tertiary); }
  .save-bar strong { font-weight: 500; color: var(--glaze-text-secondary); }
  .btn-sm { background: var(--accent); color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
  .btn-sm:hover { background: var(--accent-dim); }
  /* Responsive */
  @media (max-width: 768px) {
    body { flex-direction: column; }
    .sidebar { width: 100% !important; min-width: 100% !important; max-height: 200px; border-right: none !important; border-bottom: 1px solid var(--border); }
    .main { flex-direction: column; }
    .toolbar { padding: 8px 12px !important; gap: 6px !important; flex-wrap: wrap; }
    .toolbar .seg { gap: 2px; }
    .toolbar .seg button { padding: 4px 6px !important; font-size: 10px !important; }
    .content { padding: 16px !important; }
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 8px !important; }
    #web-canvas { height: 400px !important; }
    .save-bar { padding: 6px 12px !important; font-size: 10px !important; flex-direction: column; gap: 4px; }
  }
  @media (max-width: 480px) {
    header { padding: 8px 12px !important; }
    header h1 { font-size: 14px !important; }
    .toolbar { padding: 6px 8px !important; }
    .content { padding: 12px !important; }
    .sticky { min-height: 60px !important; padding: 8px !important; font-size: 11px !important; }
    .doc-item { padding: 8px !important; }
    #web-canvas { height: 320px !important; }
    .sidebar { max-height: 160px !important; }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .sidebar { width: 200px !important; min-width: 200px !important; }
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
  }
  @media (min-width: 1200px) {
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; }
    .content { padding: 24px !important; max-width: 1200px; margin: 0 auto; width: 100%; }
  }
  </style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header"><h2>Projects</h2><span id="sidebar-count" class="toolbar-meta"></span></div>
  <div class="sidebar-list" id="sidebar-list"></div>
  <div class="sidebar-footer"><span id="sidebar-footer-text">0 projects</span><div id="user-display" style="margin-top:8px; display:flex; align-items:center; gap:6px; padding:6px 8px; background:var(--bg-well); border:1px solid var(--border-separator); border-radius:var(--radius-md);"><span id="user-avatar" style="width:20px; height:20px; border-radius:50%; background:var(--accent); color:white; display:grid; place-items:center; font-size:10px; font-weight:600;">?</span><span id="user-name" style="font-size:11px; font-weight:500;">Anonymous</span><span id="user-role" style="font-size:10px; color:var(--text-quaternary); margin-left:auto;"></span></div><div style="font-size:10px; color:var(--text-quaternary); margin-top:4px; text-align:center;">Right-click project for menu</div></div>
</div>
<div id="web-context-menu" style="position:fixed; display:none; min-width:200px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:8px; box-shadow:var(--shadow-popover); z-index:50; padding:4px 0; font-size:13px;"></div>
<div id="web-doc-menu" style="position:fixed; display:none; min-width:200px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:8px; box-shadow:var(--shadow-popover); z-index:50; padding:4px 0; font-size:13px;"></div>
<div class="main">
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="toolbar-title" id="toolbar-title">Canvas</div>
      <span class="toolbar-meta" id="toolbar-meta"></span>
      <span class="status"><span class="dot" id="status-dot"></span><span id="status-text">Connected</span></span>
      <span class="separator" style="margin:0 8px;"></span>
      <div id="presence" style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-tertiary);"><span id="presence-count">\u25CF 1 online</span><span id="presence-avatars" style="display:flex; gap:3px;"></span></div>
    </div>
    <div class="toolbar-actions">
      <div class="seg" id="mode-seg"></div>
      <div class="separator"></div>
      <button class="btn btn-glass btn-icon" onclick="refresh()" title="Refresh">\u21BB</button>
    </div>
  </div>
  <div class="content" id="content"></div>
  <div class="save-bar"><span id="last-sync">Last synced: never</span><span><strong>Auto-save</strong> \u2022 Auto-sync 500ms</span></div>
</div>
<div id="username-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); display:none; place-items:center; z-index:100;">
  <div style="background:#ffffff; color:#1d1d1f; border:1px solid rgba(0,0,0,0.1); border-radius:20px; padding:24px; width:360px; box-shadow:0 24px 48px rgba(0,0,0,0.25);">
    <h3 style="font-size:17px; font-weight:600; margin-bottom:6px; letter-spacing:-0.02em;">Welcome to Canvas</h3>
    <p style="font-size:12px; color:#666666; margin-bottom:16px; line-height:1.4;">Create a username. It will be saved forever on this device and shown on the left bottom. Your edits will be logged with this name.</p>
    <input id="username-input" placeholder="Enter username (e.g. Alex)" maxlength="24" style="width:100%; padding:10px 12px; border:1px solid #d1d1d6; border-radius:10px; font-size:13px; background:#f5f5f7; color:#1d1d1f; margin-bottom:12px; outline:none;">
    <button id="username-submit" class="btn btn-accent" style="width:100%; justify-content:center; padding:10px; border-radius:10px; font-weight:600;">Continue</button>
    <p style="font-size:10px; color:#8e8e93; margin-top:10px; text-align:center;">Stored in localStorage \u2014 clear site data to change</p>
  </div>
</div>
<script>
let state = null;
let currentProjectId = null;
let currentMode = 'canvas';
let canvasTx = 0, canvasTy = 0, canvasScale = 1;
const WEB_TABS = [
  { id: 'canvas', label: 'Canvas', enabled: true, order: 0 },
  { id: 'document', label: 'Document', enabled: true, order: 1 },
  { id: 'methodology', label: 'Method', enabled: true, order: 2 },
  { id: 'viewer', label: 'Prototype', enabled: true, order: 3 },
  { id: 'screenplay', label: 'Screenplay', enabled: true, order: 4 },
  { id: 'log', label: 'Log', enabled: false, order: 5 },
  { id: 'cad', label: 'CAD', enabled: false, order: 6 },
  { id: 'research', label: 'Research', enabled: false, order: 7 },
];
function getWebTabs(){
  try{
    const s=localStorage.getItem('canvas-web-tabs');
    if(s) return JSON.parse(s);
  }catch{}
  return JSON.parse(JSON.stringify(WEB_TABS));
}
let webTabs = getWebTabs();
let hasCompletedWebSetup = false;
try{ hasCompletedWebSetup = localStorage.getItem('canvas-web-setup') === 'true'; }catch{}
function showWebSetupIfNeeded(){
  // App default: no setup wizard dialog on startup
  hasCompletedWebSetup = true;
  try{ localStorage.setItem('canvas-web-setup', 'true'); }catch{}
}
function saveWebTabs(){ try{ localStorage.setItem('canvas-web-tabs', JSON.stringify(webTabs)); }catch{} }
function isTabEnabled(id){ const t=webTabs.find(x=>x.id===id); return t ? t.enabled : false; }
let _canvasDrag = null;
let _canvasPan = null;
let _canvasListenersAttached = false;
let syncTimeout = null;
function scheduleSync(){
  if(syncTimeout) clearTimeout(syncTimeout);
  setStatus('syncing');
  syncTimeout = setTimeout(async ()=>{ await syncNow(); syncTimeout=null; heartbeatPresence(); }, 500);
}
function getUsername(){ try{ const u=localStorage.getItem('canvas-username'); if(u) return u; }catch{} return 'Anonymous'; }
function isAdminUser(){ try{ const u=localStorage.getItem('canvas-username'); return u && u.toLowerCase()==='admin'; }catch{ return false; } }
function updateUserDisplay(){ const name=getUsername(); const el=document.getElementById('user-name'); const av=document.getElementById('user-avatar'); const role=document.getElementById('user-role'); if(el) el.textContent=name; if(av) av.textContent=name.charAt(0).toUpperCase()||'?'; if(role) role.textContent=isAdminUser()?'admin':''; if(el) el.title='Click to change username'; }
function ensureUsername(){
  const name=getUsername();
  const modal=document.getElementById('username-modal');
  if(name==='Anonymous' && modal){
    modal.style.display='grid';
    const input=document.getElementById('username-input');
    const submit=document.getElementById('username-submit');
    const save=()=>{
      const v=(input.value||'').trim();
      if(!v){ input.style.borderColor='#ff3b30'; if(input) input.focus(); return; }
      try{ localStorage.setItem('canvas-username', v); localStorage.setItem('canvas-isAdmin', String(v.toLowerCase()==='admin')); }catch{}
      modal.style.display='none';
      updateUserDisplay();
    };
    if(submit) submit.onclick=save;
    if(input){ input.onkeydown=(e)=>{ if(e.key==='Enter') save(); }; setTimeout(()=>input.focus(), 100); }
  } else {
    updateUserDisplay();
  }
  // allow clicking username to change
  const disp=document.getElementById('user-display');
  if(disp) disp.onclick=()=>{
    const cur=getUsername();
    const nv=prompt('Change username:', cur!=='Anonymous'?cur:'');
    if(nv && nv.trim()){ try{ localStorage.setItem('canvas-username', nv.trim()); localStorage.setItem('canvas-isAdmin', String(nv.trim().toLowerCase()==='admin')); }catch{} updateUserDisplay(); }
  };
}
let presenceId = null;
try{ presenceId = localStorage.getItem('canvas-client-id'); if(!presenceId){ presenceId = 'c-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); localStorage.setItem('canvas-client-id', presenceId); } }catch{ presenceId = 'c-'+Math.random().toString(36).slice(2,7); }
async function heartbeatPresence(){
  try{
    const user=getUsername();
    const isAdmin=isAdminUser();
    await fetch('/api/presence', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: presenceId, user, isAdmin, projectId: currentProjectId }) });
  }catch{}
}
async function fetchPresence(){
  try{
    const res=await fetch('/api/presence');
    if(!res.ok) return;
    const data=await res.json();
    const countEl=document.getElementById('presence-count');
    const avEl=document.getElementById('presence-avatars');
    if(countEl) countEl.textContent='\u25CF ' + (data.count||1) + ' online' + (data.count>1 ? ' \u2022 ' + data.users.map(u=>u.user).join(', ') : '');
    if(avEl){
      avEl.innerHTML='';
      (data.users||[]).slice(0,5).forEach(u=>{
        const dot=document.createElement('span');
        dot.textContent=u.user.charAt(0).toUpperCase();
        dot.title=u.user + (u.isAdmin?' (admin)':'');
        dot.style.cssText='width:18px; height:18px; border-radius:50%; background:' + (u.isAdmin ? 'var(--accent)' : '#e5e5e3') + '; color:' + (u.isAdmin ? 'white' : 'var(--text-primary)') + '; display:grid; place-items:center; font-size:9px; font-weight:600; border:1px solid var(--border-separator);';
        avEl.appendChild(dot);
      });
      if((data.users||[]).length>5){
        const more=document.createElement('span');
        more.textContent='+' + (data.users.length-5);
        more.style.cssText='font-size:10px; color:var(--text-tertiary);';
        avEl.appendChild(more);
      }
    }
  }catch{}
}
function addChangeLog(action,targetId,targetType,targetName){
  const proj=state && state.projects ? state.projects.find(x=>x.id===currentProjectId) : null; if(!proj) return;
  if(!proj.changeLog) proj.changeLog=[];
  const user=getUsername(); const isAdmin=isAdminUser();
  proj.changeLog.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), user, isAdmin, action, targetId, targetType, targetName: targetName||targetId.slice(0,6), projectId: proj.id, projectName: proj.name, timestamp: Date.now() });
  if(proj.changeLog.length>100) proj.changeLog=proj.changeLog.slice(-100);
}
async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to fetch');
    state = await res.json();
    setStatus('online');
    render();
  } catch (e) {
    setStatus('offline');
  }
}
function setStatus(s) {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  if (s === 'online') { dot.className = 'dot'; text.textContent = 'Connected'; }
  else if (s === 'syncing') { dot.className = 'dot syncing'; text.textContent = 'Syncing\u2026'; }
  else { dot.className = 'dot offline'; text.textContent = 'Disconnected'; }
}
function setMode(m) {
  if (!isTabEnabled(m)) {
    const first = webTabs.find(t=>t.enabled);
    if (first) m = first.id;
  }
  currentMode = m;
  document.querySelectorAll('#mode-seg button').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  render();
  updateModeSeg();
}
function updateModeSeg(){
  const seg = document.getElementById('mode-seg');
  if (!seg) return;
  const enabled = webTabs.filter(t=>t.enabled).sort((a,b)=>a.order-b.order);
  seg.innerHTML = enabled.map(tab=> '<button data-mode="'+tab.id+'" class="' + (currentMode===tab.id?'active':'') + '" title="'+tab.label+'">'+tab.label+'</button>').join('') + '<button id="web-tab-config" title="Configure tabs" style="margin-left:4px; padding:4px 6px; background:var(--bg-well); border:1px solid var(--border-separator); border-radius:6px; cursor:pointer; font-size:10px;">\u2699</button>';
  seg.querySelectorAll('button[data-mode]').forEach(btn=>{
    btn.addEventListener('click', ()=> setMode(btn.getAttribute('data-mode')));
  });
  const cfgBtn = document.getElementById('web-tab-config');
  if(cfgBtn) cfgBtn.addEventListener('click', ()=> openWebTabConfig());
}
function openWebTabConfig(){
  // iOS style modal configurator for tabs
  const oldModal = document.getElementById('web-tab-modal');
  if(oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'web-tab-modal';
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); display:grid; place-items:center; z-index:100; padding:16px;';
  
  let html = '<div style="background:var(--bg-popover, #ffffff); backdrop-filter:none; -webkit-backdrop-filter:none; border:1px solid var(--border-separator, #e5e5e5); border-radius:20px; padding:24px; width:100%; max-width:440px; box-shadow:0 24px 48px rgba(0,0,0,0.25);">'
    + '<h2 style="font-size:17px; font-weight:600; margin-bottom:4px; letter-spacing:-0.02em;">Configure Tabs</h2>'
    + '<p style="font-size:12px; color:var(--text-tertiary, #666); margin-bottom:18px;">Select tabs to enable or disable in your workspace.</p>'
    + '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; max-height:300px; overflow-y:auto;">';

  webTabs.sort((a,b)=>a.order-b.order).forEach(t => {
    html += '<label style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--bg-well, #f5f5f7); border-radius:12px; cursor:pointer; font-size:13px; font-weight:500;">'
      + '<span>' + t.label + '</span>'
      + '<input type="checkbox" data-tab-id="' + t.id + '" ' + (t.enabled ? 'checked' : '') + ' style="width:18px; height:18px; accent-color:var(--accent, #007aff); cursor:pointer;">'
      + '</label>';
  });

  html += '</div><div style="display:flex; justify-content:flex-end; gap:10px;">'
    + '<button id="web-tab-cancel" class="btn" style="padding:8px 16px; border-radius:10px; background:var(--bg-well); border:none; cursor:pointer; font-size:13px; font-weight:500;">Cancel</button>'
    + '<button id="web-tab-save" class="btn" style="padding:8px 18px; border-radius:10px; background:var(--accent, #007aff); color:white; border:none; cursor:pointer; font-size:13px; font-weight:600;">Save Changes</button>'
    + '</div></div>';

  modal.innerHTML = html;
  document.body.appendChild(modal);

  modal.querySelector('#web-tab-cancel').onclick = () => modal.remove();
  modal.querySelector('#web-tab-save').onclick = () => {
    modal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      const id = chk.getAttribute('data-tab-id');
      const tab = webTabs.find(t=>t.id===id);
      if(tab) tab.enabled = chk.checked;
    });
    if(!webTabs.some(t=>t.enabled)) webTabs[0].enabled = true;
    saveWebTabs();
    updateModeSeg();
    if(!isTabEnabled(currentMode)){
      const first = webTabs.find(t=>t.enabled);
      if(first) setMode(first.id);
    }
    modal.remove();
  };
}

function render() {
  const list = document.getElementById('sidebar-list');
  const count = document.getElementById('sidebar-count');
  const foot = document.getElementById('sidebar-footer-text');
  if (!state || !state.projects || state.projects.length === 0) {
    list.innerHTML = '<div class="empty"><h3>No projects</h3><p>Create your first project in the desktop app to start building moodboards.</p></div>';
    count.textContent = '';
    foot.textContent = '0 projects';
    document.getElementById('content').innerHTML = '<div class="empty"><h3>No project selected</h3><p>Select a project from the sidebar or create a new one in the desktop app.</p></div>';
    document.getElementById('toolbar-title').textContent = 'Canvas';
    document.getElementById('toolbar-meta').textContent = '';
    return;
  }
  if (!currentProjectId || !state.projects.find(p => p.id === currentProjectId)) {
    currentProjectId = state.activeProjectId || state.projects[0].id;
  }
  count.textContent = state.projects.length + ' projects';
  foot.textContent = state.projects.length + ' ' + (state.projects.length===1?'project':'projects');
  list.innerHTML = state.projects.map(p => '<div class="sidebar-item' + (p.id===currentProjectId?' active':'') + '" data-id="' + p.id + '"><span class="icon">\u25E7</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(p.name) + '</span><span class="toolbar-meta">' + (p.nodes||[]).length + '</span></div>').join('');
  list.querySelectorAll('.sidebar-item').forEach(el => {
    el.addEventListener('click', () => selectProject(el.getAttribute('data-id')));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-id');
      const proj = state.projects.find(x=>x.id===id); if(!proj) return;
      const menu = document.getElementById('web-context-menu');
      if(!menu) return;
      menu.innerHTML = '<div style="padding:6px 10px; border-bottom:1px solid var(--border-separator);"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proj.name) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + proj.nodes.length + ' items \u2022 ' + (proj.documents||[]).length + ' docs</div></div>'
        + '<button data-action="rename" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u270E</span> Rename</button>'
        + '<button data-action="duplicate" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u29C9</span> Duplicate</button>'
        + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
        + '<div style="padding:4px 10px; font-size:10px; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Share</div>'
        + '<button data-action="copy_link" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2197</span> Copy Link</button>'
        + '<button data-action="copy_json" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2398</span> Copy JSON</button>'
        + '<button data-action="export" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2B07</span> Export File\u2026</button>'
        + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
        + '<button data-action="delete" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; color:#b12424; display:flex; gap:6px; align-items:center;"><span>\u2715</span> Delete</button>';
      menu.style.display='block';
      menu.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 280) + 'px';
      const handleAction = async (action) => {
        console.log('handleAction', action, proj.name);
        menu.style.display='none';
        if(action==='rename'){
          const name=prompt('Rename project:', proj.name);
          console.log('rename prompt result', name);
          if(name&&name.trim()){
            const newName=name.trim();
            proj.name=newName;
            console.log('renamed to', newName);
            // Update UI immediately
            const titleEl=document.getElementById('toolbar-title');
            if(titleEl) titleEl.textContent=newName;
            // Also update the sidebar item directly for immediate feedback
            const listItem = document.querySelector('.sidebar-item[data-id="'+proj.id+'"] span');
            if(listItem) listItem.textContent=newName;
            // Direct POST for immediate persistence (in addition to scheduleSync)
            fetch('/api/state', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(state) }).catch(e=>console.error(e));
            scheduleSync(); render();
          } else { console.log('rename cancelled or empty'); }
        } else if(action==='duplicate'){
          const newId = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
          const copy = JSON.parse(JSON.stringify(proj));
          copy.id=newId; copy.name=proj.name+' Copy'; copy.createdAt=Date.now(); copy.changeLog=[];
          state.projects.push(copy); state.activeProjectId=newId; scheduleSync(); render();
        } else if(action==='copy_link'){
          const link = location.origin + location.pathname + '?project=' + proj.id;
          const webUrl = 'http://' + location.hostname + ':7531?project=' + proj.id;
          try{ await navigator.clipboard.writeText(link + ' Web: ' + webUrl); alert('Link copied: '+link); }catch{ prompt('Copy link:', link); }
        } else if(action==='copy_json'){
          const json=JSON.stringify(proj,null,2);
          try{ await navigator.clipboard.writeText(json); alert('Project JSON copied'); }catch{ prompt('Copy JSON:', json.slice(0,3000)); }
        } else if(action==='export'){
          const json=JSON.stringify(proj,null,2);
          const blob=new Blob([json],{type:'application/json'});
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a'); a.href=url; a.download=(proj.name.replace(/[^a-z0-9]/gi,'_')+'.canvas.json'); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        } else if(action==='delete'){
          if(confirm('Delete "'+proj.name+'"?')){ state.projects=state.projects.filter(p=>p.id!==proj.id); if(state.activeProjectId===proj.id) state.activeProjectId=(state.projects[0]&&state.projects[0].id)||null; scheduleSync(); render(); }
        }
      };
      menu.querySelectorAll('button[data-action]').forEach(btn=>{
        btn.addEventListener('click', ()=> handleAction(btn.getAttribute('data-action')));
        btn.addEventListener('mouseenter', ()=> btn.style.background='var(--bg-well)');
        btn.addEventListener('mouseleave', ()=> btn.style.background='none');
      });
      const close = (ev)=>{ if(!menu.contains(ev.target)){ menu.style.display='none'; window.removeEventListener('click', close); } };
      setTimeout(()=> window.addEventListener('click', close), 0);
    });
  });
  const p = state.projects.find(x => x.id === currentProjectId);
  if (!p) return;
  document.getElementById('toolbar-title').textContent = p.name;
  document.getElementById('toolbar-meta').textContent = p.nodes.length + ' ' + (p.nodes.length===1?'item':'items') + ' \u2022 ' + (p.documents||[]).length + ' docs';
  let html = '';
  if (currentMode === 'canvas') {
    const snapshots = p.snapshots || [];
    html += '<div class="section"><div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;"><h2 style="margin:0">Canvas \u2014 ' + escapeHtml(p.name) + '</h2><div style="display:flex; gap:6px;"><button class="btn btn-glass" id="canvas-add-snapshot" title="Capture current view">\u25CE Snapshot</button><button class="btn btn-glass" id="canvas-add-sticky" title="Add sticky note">+ Sticky</button><button class="btn btn-glass" id="canvas-add-image" title="Add image from device">+ Image</button><button class="btn btn-glass" id="canvas-add-link" title="Add link">+ Link</button></div></div><div class="project-meta">' + p.nodes.length + ' items \u2022 ' + snapshots.length + ' snapshots on left \u2022 drag background to pan \u2022 scroll to zoom \u2022 drag nodes to move</div><input type="file" id="canvas-image-input" accept="image/*" style="display:none"></div>';
    html += '<div style="display:flex; gap:12px; height:560px;">';
    // Left snapshots panel
    html += '<div style="width:200px; min-width:200px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
    html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Snapshots</span><span style="font-size:11px; color:var(--text-quaternary);">' + snapshots.length + '</span></div>';
    html += '<div style="flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:8px;">';
    if (snapshots.length === 0) {
      html += '<div style="padding:16px; text-align:center;"><div style="font-size:11px; color:var(--text-tertiary);">No snapshots</div><div style="font-size:10px; color:var(--text-quaternary); margin-top:4px; line-height:12px;">Click \u25CE Snapshot to capture current view. It will be fixed here on the left.</div></div>';
    } else {
      snapshots.forEach(snap => {
        html += '<div style="border:1px solid var(--border-separator); border-radius:var(--radius-md); overflow:hidden; background:var(--bg-popover); box-shadow:var(--shadow-sm);"><div class="snapshot-thumb" data-restore="' + snap.id + '" style="height:80px; background:var(--bg-well); border-bottom:1px solid var(--border-separator); cursor:pointer; position:relative; overflow:hidden; display:grid; place-items:center;">';
        if (snap.thumbnail) {
          html += '<img src="' + snap.thumbnail + '" style="width:100%; height:100%; object-fit:cover; display:block;">';
        } else {
          html += '<span style="font-size:11px; color:var(--text-tertiary);">' + snap.nodes.length + ' items \u2022 ' + Math.round((snap.viewport?.zoom||1)*100) + '%</span>';
        }
        html += '<div style="position:absolute; inset:0; background:rgba(0,0,0,0);"></div></div><div style="padding:6px 8px;"><div style="display:flex; justify-content:space-between; align-items:center; gap:4px;"><span style="font-size:11px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">' + escapeHtml(snap.name) + '</span><span style="font-size:10px; color:var(--text-quaternary);">' + new Date(snap.createdAt).toLocaleTimeString() + '</span></div><div style="display:flex; gap:4px; margin-top:6px;"><button class="btn btn-glass" data-restore="' + snap.id + '" style="flex:1; padding:4px; font-size:11px;">View</button><button class="btn btn-glass" data-rename-snap="' + snap.id + '" style="padding:4px 6px; font-size:11px;">\u270E</button><button class="btn btn-glass" data-delete-snap="' + snap.id + '" style="padding:4px 6px; font-size:11px; color:#b12424;">\u2715</button></div></div></div>';
      });
    }
    html += '</div><div style="padding:6px 8px; border-top:1px solid var(--border-separator); font-size:10px; color:var(--text-quaternary); text-align:center;">Click View to restore \u2022 Snapshots sync</div></div>';
    // Right canvas
    html += '<div style="flex:1; display:flex; flex-direction:column; min-width:0;">';
    html += '<div id="web-canvas" style="position:relative; width:100%; flex:1; overflow:hidden; background: var(--bg-well); border:1px solid var(--border-separator); border-radius:var(--radius-lg); background-image: radial-gradient(circle, var(--border-separator) 1px, transparent 1px); background-size: 20px 20px;"><div id="canvas-viewport" style="position:absolute; left:0; top:0; width:2000px; height:2000px; transform-origin:0 0;">';
    const nodes = p.nodes || [];
    const edges = p.edges || [];
    if (edges.length > 0) {
      html += '<svg style="position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none;"><g>';
      edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source);
        const tt = nodes.find(n => n.id === e.target);
        if (s && tt) {
          const sx = (s.position?.x||0) + 80, sy = (s.position?.y||0) + 48, tx = (tt.position?.x||0) + 80, ty = (tt.position?.y||0) + 48;
          html += '<line x1="' + sx + '" y1="' + sy + '" x2="' + tx + '" y2="' + ty + '" stroke="var(--border-secondary)" stroke-width="1.5" />';
        }
      });
      html += '</g></svg>';
    }
    nodes.forEach(n => {
      const x = n.position?.x||0, y = n.position?.y||0;
      if (n.type === 'sticky') {
        const c = n.data?.color || 'yellow';
        html += '<div class="web-node sticky ' + c + '" data-id="' + n.id + '" data-type="sticky" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:160px; min-height:96px; cursor:grab;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span style="font-size:8px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; opacity:0.6;">Note</span><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer; opacity:0.5; font-size:12px;">\u2715</button></div><div class="web-node-text" data-edit="' + n.id + '" style="min-height:60px; white-space:pre-wrap; word-break:break-word; cursor:text;">' + escapeHtml(n.data?.text || 'Double-click to edit...') + '</div></div>';
      } else if (n.type === 'image') {
        const src = n.data?.src || '';
        const label = n.data?.label || '';
        html += '<div class="web-node img-card" data-id="' + n.id + '" data-type="image" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:200px; cursor:grab;"><img src="' + escapeHtml(src) + '" draggable="false" style="width:100%; height:120px; object-fit:cover; display:block;"/><div style="padding:6px 8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px;">' + escapeHtml(label||'Image') + '</span><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer;">\u2715</button></div></div>';
      } else if (n.type === 'link') {
        html += '<div class="web-node link-card" data-id="' + n.id + '" data-type="link" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:220px; cursor:grab;"><div style="display:flex; gap:8px; align-items:center; flex:1; min-width:0;"><div style="width:28px; height:28px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; border-radius:6px; flex-shrink:0;">\u2197</div><div style="flex:1; min-width:0;"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(n.data?.title||'Untitled') + '</div><div style="font-size:10px; color:var(--text-tertiary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(n.data?.url||'') + '</div></div></div><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer; flex-shrink:0;">\u2715</button></div>';
      }
    });
    html += '</div></div></div></div>';
    html += '<div style="margin-top:8px; display:flex; gap:6px; align-items:center; font-size:11px; color:var(--text-tertiary); flex-wrap:wrap;"><button class="btn btn-glass" id="canvas-reset-view">Reset view</button><span>Drag background to pan \u2022 Scroll to zoom \u2022 Drag nodes to move \u2022 Snapshots on left</span></div>';
    if (nodes.length === 0) {
      html += '<div class="empty" style="margin-top:12px;"><h3>Empty canvas</h3><p>Click + Sticky / + Image / + Link above to add items. They sync instantly to the desktop app.</p></div>';
    }
  } else if (currentMode === 'document') {
    const docs = p.documents || [];
    const activeDocId = p.activeDocumentId || (docs[0] && docs[0].id) || null;
    const activeDoc = docs.find(d=>d.id===activeDocId) || null;
    html += '<div style="display:flex; gap:12px; height:560px;">';
    // Lateral section - document list
    html += '<div style="width:220px; min-width:220px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
    html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Text Files</span><span style="font-size:11px; color:var(--text-quaternary);">' + docs.length + '</span></div>';
    html += '<div style="padding:8px;"><button class="btn btn-accent" id="doc-add" title="Create new text file" style="width:100%; justify-content:center;"><span>+</span> New text file</button></div>';
    html += '<div style="flex:1; overflow-y:auto; padding:0 8px 8px; display:flex; flex-direction:column; gap:4px;">';
    if (docs.length===0) {
      html += '<div style="padding:16px; text-align:center; font-size:11px; color:var(--text-tertiary);">No files yet<br><span style="font-size:10px; color:var(--text-quaternary);">Create one to start</span></div>';
    } else {
      docs.forEach(d=>{
        const isActive = d.id===activeDocId;
        const preview = d.content ? extractText(d.content).slice(0,40) : 'Empty';
        html += '<div data-activate-doc="' + d.id + '" title="Open ' + escapeHtml(d.title) + '" style="padding:8px; border-radius:var(--radius-md); cursor:pointer; border:1px solid ' + (isActive ? 'var(--accent)' : 'transparent') + '; background:' + (isActive ? 'var(--bg-popover)' : 'transparent') + '; ' + (isActive ? 'box-shadow:var(--shadow-sm);' : '') + '"><div style="display:flex; align-items:center; gap:6px;"><span style="font-size:12px;">\u{1F4C4}</span><span style="font-size:11px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">' + escapeHtml(d.title||'Untitled') + '</span>' + (isActive ? '<span style="width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0;"></span>' : '') + '</div><div style="font-size:10px; color:var(--text-tertiary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">' + escapeHtml(preview) + '</div><div style="font-size:10px; color:var(--text-quaternary); margin-top:2px;">' + new Date(d.updatedAt||Date.now()).toLocaleDateString() + '</div></div>';
      });
    }
    html += '</div>';
    html += '<div style="padding:6px 8px; border-top:1px solid var(--border-separator); font-size:10px; color:var(--text-quaternary); text-align:center;">Click a file to navigate \u2022 ' + docs.length + ' files</div>';
    html += '</div>';
    // Main editor - current text file
    html += '<div style="flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden;">';
    if (activeDoc) {
      const text = activeDoc.content ? extractText(activeDoc.content) : '';
      html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; height:100%; overflow:hidden; box-shadow:var(--shadow-sm);">';
      html += '<div style="height:40px; display:flex; align-items:center; gap:8px; padding:0 10px; border-bottom:1px solid var(--border-separator); background:var(--bg-sidebar);"><span style="font-size:12px;">\u{1F4C4}</span><input data-rename-doc="' + activeDoc.id + '" value="' + escapeHtml(activeDoc.title) + '" title="Rename text file" style="font-size:13px; font-weight:600; border:1px solid var(--border-separator); background:var(--bg-well); flex:1; padding:4px 8px; border-radius:6px;"><span style="font-size:10px; color:var(--text-quaternary);">' + new Date(activeDoc.updatedAt||Date.now()).toLocaleTimeString() + '</span><button class="btn btn-glass" data-delete-doc="' + activeDoc.id + '" title="Delete this text file" style="padding:4px 8px; font-size:11px; color:#b12424;">Delete</button></div>';
      html += '<textarea data-edit-doc="' + activeDoc.id + '" placeholder="Start writing... (auto-saves 500ms)" title="Edit text file content" style="flex:1; width:100%; padding:16px; border:none; font-size:13px; line-height:18px; resize:none; background:var(--bg-popover); outline:none;">' + escapeHtml(text) + '</textarea>';
      html += '<div style="height:28px; display:flex; justify-content:space-between; align-items:center; padding:0 10px; border-top:1px solid var(--border-separator); background:var(--bg-sidebar); font-size:10px; color:var(--text-quaternary);"><span>' + escapeHtml(activeDoc.title) + ' \u2022 Auto-save 500ms</span><span>' + text.length + ' chars</span></div>';
      html += '</div>';
    } else {
      html += '<div style="flex:1; display:grid; place-items:center; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg);"><div style="text-align:center; padding:24px;"><div style="font-size:14px; font-weight:600; margin-bottom:4px;">No text file selected</div><div style="font-size:11px; color:var(--text-tertiary); margin-bottom:12px;">Select a file from the left or create a new one.</div><button class="btn btn-accent" id="doc-add-empty" title="Create new text file">+ New text file</button></div></div>';
    }
    html += '</div>';
    html += '</div>';
  } else if (currentMode === 'screenplay') {
    const screenplayText = p.documents && p.documents[0] ? extractText(p.documents[0].content) : "INT. COFFEE SHOP - DAY

ALEX (30s) sits by the window, typing furiously on a sleek laptop.

BARISTA
(O.S.)
Your double espresso, Alex.

ALEX
Thanks. Just in time.

Alex takes a sip, staring at the glowing screen.";
    html += '<div style="display:flex; flex-direction:column; height:580px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm);">';
    html += '<div style="height:48px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid var(--border-separator); background:var(--bg-sidebar);"><div style="display:flex; align-items:center; gap:8px;"><span style="font-size:14px;">\u{1F3AC}</span><span style="font-size:13px; font-weight:600;">Screenplay Studio</span></div><button id="screenplay-export" class="btn btn-glass" style="font-size:12px; padding:6px 12px;">Export .Fountain</button></div>';
    html += '<div style="flex:1; display:flex; min-height:0;">';
    // Raw editor
    html += '<div style="flex:1; display:flex; flex-direction:column; border-right:1px solid var(--border-separator); background:var(--bg-well); padding:16px;">';
    html += '<div style="font-size:11px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">Fountain Raw Text</div>';
    html += '<textarea id="screenplay-textarea" placeholder="Type your screenplay..." style="flex:1; width:100%; background:var(--bg-popover); color:var(--text-primary); border:1px solid var(--border-separator); border-radius:8px; padding:12px; font-family:ui-monospace, monospace; font-size:12px; line-height:1.6; resize:none; outline:none;">' + escapeHtml(screenplayText) + '</textarea>';
    html += '</div>';
    // Preview
    html += '<div style="flex:1; display:flex; flex-direction:column; background:var(--bg-app); padding:20px; overflow-y:auto;">';
    html += '<div style="font-size:11px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">Industry Standard Formatter</div>';
    html += '<div id="screenplay-preview" style="max-width:480px; width:100%; margin:0 auto; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:12px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.05); font-family:ui-monospace, monospace; font-size:12px;">';
    
    // Parse fountain lines
    const lines = screenplayText.split('
');
    lines.forEach(l => {
      const trimmed = l.trim();
      if (!trimmed) { html += '<div style="height:12px;"></div>'; return; }
      if (/^(INT|EXT|EST|INT/EXT)\b/i.test(trimmed) || (/^[A-Z0-9s-.,/()]+$/.test(trimmed) && trimmed === trimmed.toUpperCase() && !trimmed.endsWith(':') && trimmed.length < 60)) {
        html += '<div style="font-weight:700; text-transform:uppercase; margin:16px 0 8px 0; letter-spacing:0.05em; color:var(--text-primary);">' + escapeHtml(trimmed) + '</div>';
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        html += '<div style="color:var(--text-tertiary); font-style:italic; text-align:center; margin:2px 0; padding-left:40px;">' + escapeHtml(trimmed) + '</div>';
      } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !/[.?!]$/.test(trimmed)) {
        html += '<div style="font-weight:700; color:var(--accent); text-transform:uppercase; text-align:center; margin:14px 0 2px 0; letter-spacing:0.05em;">' + escapeHtml(trimmed) + '</div>';
      } else {
        html += '<div style="color:var(--text-primary); margin-bottom:8px; line-height:1.5;">' + escapeHtml(trimmed) + '</div>';
      }
    });

    html += '</div></div></div></div>';
    if (p.methodology) {
      const phases = p.methodology.phases || {};
      const order = ['discover','define','develop','deliver'];
      html += '<div class="section"><h2>Double Diamond Methodology</h2><div class="phase-list">';
      order.forEach(ph => {
        const pd = phases[ph];
        if (!pd) return;
        const done = (pd.tasks||[]).filter(t => t.done).length;
        const total = (pd.tasks||[]).length;
        const isActive = (p.methodology.currentPhase||'discover')===ph;
        html += '<button class="phase-badge ' + ph + '" data-set-phase="' + ph + '" style="cursor:pointer; border:none; ' + (isActive ? 'box-shadow:0 0 0 2px var(--accent); opacity:1;' : 'opacity:0.8;') + '">' + escapeHtml(pd.title) + ' (' + done + '/' + total + ')</button>';
      });
      html += '</div>';
      const cur = phases[p.methodology.currentPhase || 'discover'];
      if (cur) {
        html += '<div class="project-card"><h3>' + escapeHtml(cur.title) + '</h3><p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:18px">' + escapeHtml(cur.description) + '</p>';
        html += '<div style="display:flex; gap:6px; margin-bottom:12px;"><input id="method-new-task" placeholder="Add task..." style="flex:1; padding:6px 10px; border:1px solid var(--border-separator); border-radius:var(--radius-md); font-size:13px; background:var(--bg-well);"><button class="btn btn-accent" id="method-add-task">Add</button></div>';
        if (cur.tasks && cur.tasks.length > 0) {
          html += '<ul class="task-list">';
          cur.tasks.forEach(t => {
            html += '<li class="task-item' + (t.done ? ' done' : '') + '" style="justify-content:space-between;"><div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;"><input type="checkbox" data-phase="' + (p.methodology.currentPhase||'discover') + '" data-task="' + t.id + '" ' + (t.done ? 'checked' : '') + '><span style="flex:1; min-width:0; word-break:break-word;">' + escapeHtml(t.text) + '</span></div><button class="btn btn-glass" data-delete-task="' + t.id + '" data-phase="' + (p.methodology.currentPhase||'discover') + '" style="padding:2px 6px; font-size:11px;">\u2715</button></li>';
          });
          html += '</ul>';
        } else {
          html += '<p style="font-size:11px;color:var(--text-tertiary)">No tasks yet \u2014 add one above.</p>';
        }
        html += '<div style="margin-top:16px"><div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600">Notes</div><textarea id="method-notes" data-phase="' + (p.methodology.currentPhase||'discover') + '" placeholder="Add notes for this phase... (auto-saves 500ms)" style="width:100%; min-height:80px; padding:10px; border:1px solid var(--border-separator); border-radius:var(--radius-md); font-size:13px; background:var(--bg-well); resize:vertical;">' + escapeHtml(cur.notes||'') + '</textarea></div>';
        html += '</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="empty"><h3>No methodology</h3><p>Methodology data will appear here once created.</p></div>';
    }
  } else if (currentMode === 'viewer') {
    const prototypes = p.prototypes || (p.viewerModel ? [{ id: 'legacy', kind: (p.viewerModel.type||'').startsWith('image/') ? 'image' : '3d', name: p.viewerModel.name, src: p.viewerModel.src, type: p.viewerModel.type, createdAt: p.viewerModel.uploadedAt }] : []);
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;"><h2>Prototype \u2014 Website / 3D / Image</h2><div style="display:flex; gap:6px;"><button class="btn btn-glass" id="proto-add-website">+ Website</button><button class="btn btn-glass" id="proto-add-3d">+ 3D</button><button class="btn btn-glass" id="proto-add-image">+ Image</button></div></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Add website prototypes (URL), 3D products (.OBJ/.GLTF/.GLB) or image concepts. All sync to desktop app.</p></div>';
    html += '<input type="file" id="viewer-file-input" accept=".obj,.gltf,.glb,.png,.jpg,.jpeg,.webp" style="display:none">';
    if (prototypes.length === 0) {
      html += '<div class="empty"><h3>No prototypes</h3><p>Add a website, 3D product or image concept. They sync instantly.</p><div id="viewer-drop" style="margin-top:12px; width:100%; height:200px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well);">Drop .OBJ/.GLTF/.GLB or image here, or click + buttons</div></div>';
    } else {
      html += '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:12px;">';
      prototypes.forEach(proto=>{
        const isWebsite = proto.kind==='website';
        const isImage = proto.kind==='image' || (proto.type||'').startsWith('image/');
        const is3d = proto.kind==='3d';
        html += '<div style="border:1px solid var(--border-separator); border-radius:var(--radius-lg); overflow:hidden; background:var(--bg-popover); box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">';
        html += '<div style="height:180px; background:var(--bg-well); border-bottom:1px solid var(--border-separator); overflow:hidden; position:relative;">';
        if (isWebsite) {
          html += '<iframe src="' + escapeHtml(proto.src) + '" style="width:100%; height:100%; border:0;" sandbox="allow-scripts allow-same-origin"></iframe><div style="position:absolute; inset:0; pointer-events:none;"></div>';
        } else if (isImage) {
          html += '<img src="' + proto.src + '" style="width:100%; height:100%; object-fit:contain; display:block; padding:8px;">';
        } else {
          html += '<div style="width:100%; height:100%; display:grid; place-items:center; text-align:center; padding:12px;"><div style="font-size:24px;">\u25C8</div><div style="font-size:12px; font-weight:600; margin-top:4px;">' + escapeHtml(proto.name) + '</div><div style="font-size:11px; color:var(--text-tertiary);">' + escapeHtml(proto.type||'3d model') + ' \u2022 ' + Math.round((proto.src||'').length/1024) + ' KB</div></div>';
        }
        html += '</div>';
        html += '<div style="padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;"><div style="min-width:0; flex:1;"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proto.name) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + (isWebsite?'Website': is3d?'3D Product':'Image Concept') + ' \u2022 ' + new Date(proto.createdAt).toLocaleDateString() + '</div></div><button class="btn btn-glass" data-delete-proto="' + proto.id + '" style="padding:4px 6px; font-size:11px; color:#b12424;">\u2715</button></div>';
        if (isWebsite) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:6px; word-break:break-all; background:var(--bg-well); padding:6px; border-radius:6px; border:1px solid var(--border-separator); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proto.src) + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
      html += '<div id="viewer-drop" style="margin-top:12px; height:80px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well); font-size:11px;">Drop more files here</div>';
    }
  } else if (currentMode === 'cad') {
    const cads = p.cadDrawings || [];
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><h2>CAD Drawings \u2014 ' + cads.length + '</h2><button class="btn btn-accent" id="cad-upload" title="Add CAD drawing">+ Add CAD</button></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Upload .DXF, .DWG, .PDF or images and visualize. Drag background to pan, scroll to zoom.</p></div>';
    html += '<input type="file" id="cad-file-input" accept=".dxf,.dwg,.pdf,.png,.jpg,.jpeg,.svg,.webp" style="display:none">';
    if (cads.length===0) {
      html += '<div class="empty"><h3>No CAD drawings</h3><p>Click + Add CAD to upload a drawing. Supports images, PDF, DXF, DWG (preview as image).</p><div id="cad-drop" style="margin-top:12px; height:160px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well);">Drop CAD file here</div></div>';
    } else {
      // Lateral list + viewer
      html += '<div style="display:flex; gap:12px; height:520px;">';
      html += '<div style="width:220px; min-width:220px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
      html += '<div style="height:32px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Drawings</span><span style="font-size:11px; color:var(--text-quaternary);">' + cads.length + '</span></div>';
      html += '<div style="flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:4px;">';
      cads.forEach(c=>{
        html += '<div data-select-cad="' + c.id + '" style="padding:8px; border-radius:8px; border:1px solid ' + (p.cadDrawings && p.cadDrawings[0] && p.cadDrawings[0].id===c.id ? 'var(--accent)' : 'transparent') + '; background:' + (p.cadDrawings && p.cadDrawings[0] && p.cadDrawings[0].id===c.id ? 'var(--bg-popover)' : 'transparent') + '; cursor:pointer; display:flex; gap:8px; align-items:center;"><span style="width:36px; height:36px; border-radius:6px; background:var(--bg-well); border:1px solid var(--border-separator); display:grid; place-items:center; font-size:12px; overflow:hidden;">' + (c.type.startsWith('image/')||c.src.startsWith('data:image') ? '<img src="'+c.src+'" style="width:100%; height:100%; object-fit:cover;">' : '\u25C8') + '</span><span style="flex:1; min-width:0;"><span style="font-size:11px; font-weight:500; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(c.name) + '</span><span style="font-size:10px; color:var(--text-tertiary);">' + escapeHtml(c.type||'cad') + '</span></span><button data-delete-cad="' + c.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">\u2715</button></div>';
      });
      html += '</div></div>';
      // Viewer for first CAD
      const first = cads[0];
      html += '<div style="flex:1; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
      html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600;">' + escapeHtml(first.name) + '</span><span style="font-size:10px; color:var(--text-tertiary);">' + Math.round((first.src||'').length/1024) + ' KB</span></div>';
      html += '<div id="cad-viewer" style="flex:1; background:radial-gradient(circle, var(--border-separator) 1px, transparent 1px); background-size:20px 20px; background-color:var(--bg-well); display:grid; place-items:center; overflow:hidden; position:relative;"><div id="cad-zoom" style="transform-origin:center; transition:transform 0.1s;">';
      if (first.type.startsWith('image/') || first.src.startsWith('data:image')) {
        html += '<img src="' + first.src + '" style="max-width:700px; max-height:400px; object-fit:contain; box-shadow:0 8px 32px rgba(0,0,0,0.12); border-radius:8px; border:1px solid var(--border-separator); background:white;">';
      } else {
        html += '<div style="width:400px; height:300px; background:white; border:1px solid var(--border-separator); border-radius:8px; display:grid; place-items:center; box-shadow:0 8px 32px rgba(0,0,0,0.12);"><span style="font-size:12px; color:var(--text-tertiary);">CAD: ' + escapeHtml(first.name) + '<br><span style="font-size:10px;">' + escapeHtml(first.type) + '</span></span></div>';
      }
      html += '</div></div>';
      html += '<div style="height:32px; display:flex; align-items:center; justify-content:center; gap:6px; border-top:1px solid var(--border-separator);"><button class="btn btn-glass" data-cad-zoom="out" style="padding:4px 8px; font-size:11px;">\u2212 Zoom out</button><span id="cad-zoom-label" style="font-size:11px; color:var(--text-tertiary);">100%</span><button class="btn btn-glass" data-cad-zoom="in" style="padding:4px 8px; font-size:11px;">+ Zoom in</button><button class="btn btn-glass" data-cad-reset style="padding:4px 8px; font-size:11px;">Reset</button></div>';
      html += '</div>';
      html += '</div>';
    }
  } else if (currentMode === 'research') {
    const research = p.research || { qa: [], websites: [], forms: [] };
    html += '<div class="section"><h2>Research</h2><p style="font-size:11px; color:var(--text-tertiary);">Q&A transcriptions, website researches and form results \u2014 all synced.</p></div>';
    // QA
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Q&A Transcriptions \u2014 ' + research.qa.length + '</h2><button class="btn btn-glass" id="research-add-qa" style="padding:4px 8px; font-size:11px;">+ Q&A</button></div>';
    html += '<div id="research-qa-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="qa-q" placeholder="Question" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><textarea id="qa-a" placeholder="Answer / transcription" rows="2" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"></textarea><input id="qa-speaker" placeholder="Speaker (optional)" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><div style="display:flex; gap:6px;"><button class="btn btn-accent" id="qa-save" style="padding:4px 10px; font-size:11px;">Save</button><button class="btn btn-glass" id="qa-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.qa.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No Q&A yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.qa.forEach(qa=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px;"><div style="flex:1;"><div style="font-size:11px; font-weight:600;">Q: ' + escapeHtml(qa.question) + '</div><div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">A: ' + escapeHtml(qa.answer) + '</div>' + (qa.speaker ? '<div style="font-size:10px; color:var(--text-quaternary); margin-top:4px;">Speaker: ' + escapeHtml(qa.speaker) + '</div>' : '') + '</div><button data-delete-qa="' + qa.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">\u2715</button></div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    // Websites
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Website Researches \u2014 ' + research.websites.length + '</h2><button class="btn btn-glass" id="research-add-web" style="padding:4px 8px; font-size:11px;">+ Website</button></div>';
    html += '<div id="research-web-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="web-url" placeholder="https://" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><input id="web-title" placeholder="Title" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><textarea id="web-notes" placeholder="Notes" rows="2" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"></textarea><div style="display:flex; gap:6px;"><button class="btn btn-accent" id="web-save" style="padding:4px 10px; font-size:11px;">Save</button><button class="btn btn-glass" id="web-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.websites.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No websites yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.websites.forEach(w=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; display:flex; justify-content:space-between; gap:8px;"><div style="flex:1; min-width:0;"><div style="font-size:11px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(w.title) + '</div><div style="font-size:10px; color:var(--text-link); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(w.url) + '</div>' + (w.notes ? '<div style="font-size:11px; color:var(--text-secondary); margin-top:4px; white-space:pre-wrap;">' + escapeHtml(w.notes) + '</div>' : '') + '</div><button data-delete-web="' + w.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">\u2715</button></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    // Forms
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Form Results \u2014 ' + research.forms.length + '</h2><button class="btn btn-glass" id="research-add-form" style="padding:4px 8px; font-size:11px;">+ Form</button></div>';
    html += '<div id="research-form-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="form-title" placeholder="Form title" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><div id="form-qa-list" style="display:flex; flex-direction:column; gap:4px;"></div><div style="display:flex; gap:4px;"><input id="form-q" placeholder="Question" style="flex:1; padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><input id="form-a" placeholder="Answer" style="flex:1; padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><button class="btn btn-glass" id="form-add-qa" style="padding:4px 8px; font-size:11px;">Add</button></div><div style="display:flex; gap:6px; margin-top:6px;"><button class="btn btn-accent" id="form-save" style="padding:4px 10px; font-size:11px;">Save form</button><button class="btn btn-glass" id="form-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.forms.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No forms yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.forms.forEach(f=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px;"><div><div style="font-size:11px; font-weight:600;">' + escapeHtml(f.formTitle) + '</div><div style="font-size:10px; color:var(--text-quaternary);">' + new Date(f.submittedAt).toLocaleString() + ' \u2022 ' + f.responses.length + ' answers</div></div><button data-delete-form="' + f.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">\u2715</button></div><div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">';
        f.responses.forEach(r=>{ html += '<div style="font-size:11px; background:var(--bg-well); padding:6px; border-radius:6px;"><b>Q:</b> ' + escapeHtml(r.question) + '<br><b>A:</b> ' + escapeHtml(r.answer) + '</div>'; });
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
  } else if (currentMode === 'log') {
    const log = (p.changeLog||[]).filter(e=>['add','delete','move'].includes(e.action)).slice().reverse();
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><h2>Activity Log \u2014 ' + log.length + ' changes</h2><div style="display:flex; gap:6px;"><span style="font-size:11px; color:var(--text-tertiary); align-self:center;">adds / deletes / moves only</span><button class="btn btn-glass" id="log-clear" style="padding:4px 8px; font-size:11px;">Clear</button></div></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Shows who added, deleted or moved canvas items. Synced across app & website. Admin sees all.</p></div>';
    if (log.length===0) {
      html += '<div class="empty"><h3>No activity yet</h3><p>Canvas adds, deletes and moves will appear here with username and time.</p></div>';
    } else {
      html += '<div style="display:flex; flex-direction:column; gap:8px;">';
      log.forEach(entry=>{
        const d = new Date(entry.timestamp);
        const time = d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
        const icon = entry.action==='add' ? '\uFF0B' : entry.action==='delete' ? '\u2715' : '\u2194';
        const col = entry.action==='add' ? '#0a7a42' : entry.action==='delete' ? '#b12424' : '#6a3dec';
        const adminBadge = entry.isAdmin ? '<span style="font-size:9px; background:var(--accent); color:white; padding:1px 4px; border-radius:4px; margin-left:4px;">admin</span>' : '';
        html += '<div style="display:flex; gap:10px; align-items:flex-start; padding:10px 12px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); box-shadow:var(--shadow-sm);"><div style="width:28px; height:28px; border-radius:50%; background:' + (entry.isAdmin ? 'var(--accent)' : '#e5e5e3') + '; color:' + (entry.isAdmin ? 'white' : 'var(--text-primary)') + '; display:grid; place-items:center; font-size:11px; font-weight:600; flex-shrink:0;">' + escapeHtml(entry.user.charAt(0).toUpperCase()) + '</div><div style="flex:1; min-width:0;"><div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;"><span style="font-size:12px; font-weight:600;">' + escapeHtml(entry.user) + '</span>' + adminBadge + '<span style="font-size:11px; color:' + col + '; font-weight:600; text-transform:uppercase;">' + icon + ' ' + escapeHtml(entry.action) + '</span><span style="font-size:11px; color:var(--text-secondary);">' + escapeHtml(entry.targetType) + ': ' + escapeHtml(entry.targetName) + '</span></div><div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">' + time + ' \u2022 ' + escapeHtml(entry.projectName) + ' \u2022 ' + escapeHtml(entry.targetId.slice(0,8)) + '</div></div></div>';
      });
      html += '</div>';
    }
  }
  const gs = state.globalStickies || [];
  if (gs.length > 0) {
    html += '<div class="section"><h2>Global Post-its (' + gs.length + ')</h2><div class="sticky-grid">';
    gs.forEach(s => {
      html += '<div class="sticky ' + (s.color||'yellow') + '">' + escapeHtml(s.text || 'Empty') + '</div>';
    });
    html += '</div></div>';
  }
  document.getElementById('content').innerHTML = html;
  document.getElementById('content').querySelectorAll('input[data-task]').forEach(el => {
    el.addEventListener('change', () => toggleTask(el.getAttribute('data-phase'), el.getAttribute('data-task')));
  });
  // \u2500\u2500 Canvas interactions (add / delete / drag / pan / zoom / edit) \u2500\u2500
  (function attachCanvasHandlers(){
    const canvas = document.getElementById('web-canvas');
    const viewport = document.getElementById('canvas-viewport');
    if (canvas && viewport) {
      // Add buttons
      const addSticky = document.getElementById('canvas-add-sticky');
      const addImage = document.getElementById('canvas-add-image');
      const addLink = document.getElementById('canvas-add-link');
      const resetView = document.getElementById('canvas-reset-view');
      function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
      function getProject(){ return state.projects.find(x=>x.id===currentProjectId); }
      if (addSticky) addSticky.addEventListener('click', () => {
        const proj = getProject(); if(!proj) return;
        const colors = ['yellow','pink','blue','green','purple'];
        const col = colors[Math.floor(Math.random()*colors.length)];
        const id = genId();
        proj.nodes.push({ id, type: 'sticky', position: { x: 100 + Math.random()*300, y: 100 + Math.random()*200 }, data: { kind: 'sticky', text: '', color: col } });
        addChangeLog('add', id, 'sticky', 'Sticky: empty');
        scheduleSync(); render();
      });
      const imageInput = document.getElementById('canvas-image-input');
      if (addImage) addImage.addEventListener('click', () => {
        if (imageInput) imageInput.click();
        else {
          const url = prompt('Image URL:', 'https://picsum.photos/300/200');
          if (url === null) return;
          const src = url || 'https://picsum.photos/300/200';
          const label = prompt('Label:', 'Image');
          const proj = getProject(); if(!proj) return;
          proj.nodes.push({ id: genId(), type: 'image', position: { x: 120 + Math.random()*300, y: 120 + Math.random()*200 }, data: { kind: 'image', src, label: label||'Image' } });
          scheduleSync(); render();
        }
      });
      if (imageInput) imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please select an image file'); e.target.value=''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = ev.target.result;
          const proj = getProject(); if(!proj) return;
          const id = genId();
          proj.nodes.push({ id, type: 'image', position: { x: 120 + Math.random()*300, y: 120 + Math.random()*200 }, data: { kind: 'image', src, label: file.name } });
          addChangeLog('add', id, 'image', 'Image: ' + file.name);
          scheduleSync(); render();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });
      if (addLink) addLink.addEventListener('click', () => {
        const url = prompt('Link URL:', 'https://');
        if (!url) return;
        const title = prompt('Title:', url);
        const proj = getProject(); if(!proj) return;
        const id = genId();
        proj.nodes.push({ id, type: 'link', position: { x: 140 + Math.random()*300, y: 140 + Math.random()*200 }, data: { kind: 'link', url, title: title||url } });
        addChangeLog('add', id, 'link', 'Link: ' + (title||url));
        scheduleSync(); render();
      });
      if (resetView) resetView.addEventListener('click', () => {
        canvasTx = 0; canvasTy = 0; canvasScale = 1;
        viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
      });
      // Drag & drop image files from device (Documents / Photos) directly onto canvas
      canvas.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; canvas.style.outline = '2px dashed var(--accent)'; });
      canvas.addEventListener('dragleave', () => { canvas.style.outline = 'none'; });
      canvas.addEventListener('drop', (e) => {
        e.preventDefault(); canvas.style.outline = 'none';
        const files = e.dataTransfer.files;
        const proj = getProject(); if(!proj) return;
        // Handle image files
        let added = false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const src = ev.target.result;
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left - canvasTx) / canvasScale + (Math.random()*40-20);
              const y = (e.clientY - rect.top - canvasTy) / canvasScale + (Math.random()*40-20);
              proj.nodes.push({ id: genId(), type: 'image', position: { x, y }, data: { kind: 'image', src, label: file.name } });
              addChangeLog('add', proj.nodes[proj.nodes.length-1].id, 'image', 'Image: ' + file.name);
              scheduleSync(); render();
            };
            reader.readAsDataURL(file);
            added = true;
          }
        }
        if (!added) {
          // Try HTML drag (from web) or text/uri
          const html = e.dataTransfer.getData('text/html');
          const uri = e.dataTransfer.getData('text/uri-list');
          const text = e.dataTransfer.getData('text/plain');
          const rect = canvas.getBoundingClientRect();
          const px = (e.clientX - rect.left - canvasTx) / canvasScale;
          const py = (e.clientY - rect.top - canvasTy) / canvasScale;
          if (html) {
            const m = html.match(/<img[^>]+src=["']([^"']+)["']/);
            if (m) { proj.nodes.push({ id: genId(), type: 'image', position: { x: px, y: py }, data: { kind: 'image', src: m[1], label: 'Image' } }); syncNow(); render(); return; }
          }
          if (uri || (text && (text.startsWith('http://') || text.startsWith('https://')))) {
            const url = uri || text;
            const lower = url.toLowerCase();
            const isImageUrl = ['.png','.jpg','.jpeg','.gif','.webp','.svg'].some(ext => lower.split('?')[0].endsWith(ext));
            if (isImageUrl || html) {
              const _uid = genId(); proj.nodes.push({ id: _uid, type: 'image', position: { x: px, y: py }, data: { kind: 'image', src: url, label: 'Image' } }); addChangeLog('add', _uid, 'image', 'Image: dropped URL');
            } else {
              const title = url.length > 40 ? url.slice(0,40)+'...' : url;
              proj.nodes.push({ id: genId(), type: 'link', position: { x: px, y: py }, data: { kind: 'link', url, title } });
            }
            scheduleSync(); render(); return;
          }
          if (text) {
            const _sid = genId(); proj.nodes.push({ id: _sid, type: 'sticky', position: { x: px, y: py }, data: { kind: 'sticky', text, color: 'yellow' } }); addChangeLog('add', _sid, 'sticky', 'Sticky: ' + (text.slice(0,20)||'empty')); scheduleSync(); render();
          }
        }
      });
      // Delete buttons
      canvas.querySelectorAll('.web-node-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-delete');
          const proj = getProject(); if(!proj) return;
          const target = proj.nodes.find(n=>n.id===id);
          const name = target ? (target.data?.kind==='sticky' ? 'Sticky: ' + ((target.data.text||'').slice(0,20)||'empty') : target.data?.kind==='image' ? 'Image: ' + (target.data.label||'image') : 'Link: ' + (target.data.title||target.data.url||'')) : id;
          const type = target ? target.type : 'unknown';
          proj.nodes = proj.nodes.filter(n=>n.id!==id);
          proj.edges = (proj.edges||[]).filter(ed=>ed.source!==id && ed.target!==id);
          addChangeLog('delete', id, type, name);
          scheduleSync(); render();
        });
      });
      // Edit sticky double-click
      canvas.querySelectorAll('.web-node-text[data-edit]').forEach(el => {
        el.addEventListener('dblclick', () => {
          const id = el.getAttribute('data-edit');
          const proj = getProject(); const node = proj.nodes.find(n=>n.id===id); if(!node) return;
          const cur = node.data?.text || '';
          const ta = document.createElement('textarea');
          ta.value = cur;
          ta.style.width = '100%'; ta.style.minHeight = '60px'; ta.style.font = 'inherit'; ta.style.fontSize = '13px';
          ta.style.border = '1px solid var(--border-separator)'; ta.style.borderRadius = '6px'; ta.style.padding = '6px';
          el.replaceWith(ta); ta.focus();
          let done = false;
          const finish = () => {
            if (done) return; done = true;
            node.data.text = ta.value;
            scheduleSync(); render();
          };
          ta.addEventListener('blur', finish);
          ta.addEventListener('keydown', (ev) => {
            if (ev.key==='Enter' && (ev.metaKey||ev.ctrlKey)) finish();
            if (ev.key==='Escape') { done = true; render(); }
          });
        });
      });
      // Drag nodes
      canvas.querySelectorAll('.web-node').forEach(nodeEl => {
        nodeEl.addEventListener('mousedown', (e) => {
          if (e.target.closest('.web-node-delete') || e.target.closest('textarea')) return;
          const id = nodeEl.getAttribute('data-id');
          const proj = getProject(); const node = proj.nodes.find(n=>n.id===id); if(!node) return;
          _canvasDrag = { id, el: nodeEl, startX: e.clientX, startY: e.clientY, origX: node.position.x, origY: node.position.y };
          nodeEl.style.cursor = 'grabbing'; nodeEl.style.zIndex = '10';
          e.preventDefault();
        });
      });
      // Pan viewport (drag background)
      canvas.addEventListener('mousedown', (e) => {
        if (_canvasDrag) return;
        if (e.target.closest('.web-node')) return;
        _canvasPan = { startX: e.clientX, startY: e.clientY, origTx: canvasTx, origTy: canvasTy };
        canvas.style.cursor = 'grabbing';
      });
      if (!_canvasListenersAttached) {
        _canvasListenersAttached = true;
        window.addEventListener('mousemove', (e) => {
          if (_canvasDrag) {
            const dx = (e.clientX - _canvasDrag.startX) / canvasScale;
            const dy = (e.clientY - _canvasDrag.startY) / canvasScale;
            const proj = state.projects.find(x=>x.id===currentProjectId);
            const node = proj.nodes.find(n=>n.id===_canvasDrag.id);
            if (node) { node.position.x = _canvasDrag.origX + dx; node.position.y = _canvasDrag.origY + dy; }
            _canvasDrag.el.style.left = node.position.x + 'px';
            _canvasDrag.el.style.top = node.position.y + 'px';
            const svg = viewport.querySelector('svg');
            if (svg) {
              const edges = proj.edges||[];
              const nodes = proj.nodes;
              svg.querySelectorAll('line').forEach((line, i) => {
                const ed = edges[i]; if(!ed) return;
                const s = nodes.find(n=>n.id===ed.source), tt = nodes.find(n=>n.id===ed.target);
                if (s&&tt) { line.setAttribute('x1', s.position.x+80); line.setAttribute('y1', s.position.y+48); line.setAttribute('x2', tt.position.x+80); line.setAttribute('y2', tt.position.y+48); }
              });
            }
          } else if (_canvasPan) {
            const dx = e.clientX - _canvasPan.startX;
            const dy = e.clientY - _canvasPan.startY;
            canvasTx = _canvasPan.origTx + dx;
            canvasTy = _canvasPan.origTy + dy;
            viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
            const bgX = canvasTx % 20, bgY = canvasTy % 20;
            canvas.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
          }
        });
        window.addEventListener('mouseup', () => {
          if (_canvasDrag) {
            _canvasDrag.el.style.cursor = 'grab'; _canvasDrag.el.style.zIndex = '';
            const proj = state.projects.find(x=>x.id===currentProjectId);
            const node = proj ? proj.nodes.find(n=>n.id===_canvasDrag.id) : null;
            if (node) addChangeLog('move', node.id, node.type, 'Moved to ' + Math.round(node.position.x) + ',' + Math.round(node.position.y));
            scheduleSync();
            _canvasDrag = null;
          }
          if (_canvasPan) { canvas.style.cursor = ''; _canvasPan = null; }
        });
      }
      // Zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(2, Math.max(0.4, canvasScale * delta));
        // zoom toward mouse
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left - canvasTx;
        const my = e.clientY - rect.top - canvasTy;
        canvasScale = newScale;
        // adjust to keep mouse point stable (optional simple)
        viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
      }, { passive: false });
      // init transform
      viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
    }
  })();
  // \u2500\u2500 Snapshot handlers (web left panel) \u2500\u2500
  (function(){
    const snapBtn = document.getElementById('canvas-add-snapshot');
    if (snapBtn) snapBtn.addEventListener('click', () => {
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      let thumbnail;
      try {
        const c = document.createElement('canvas'); c.width=160; c.height=100;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle='#f8f8f7'; ctx.fillRect(0,0,c.width,c.height);
          const nodes = proj.nodes||[];
          if (nodes.length>0) {
            let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
            nodes.forEach(n=>{ minX=Math.min(minX,n.position.x); minY=Math.min(minY,n.position.y); maxX=Math.max(maxX,n.position.x+160); maxY=Math.max(maxY,n.position.y+96); });
            const w=maxX-minX||800, h=maxY-minY||600; const scale=Math.min(150/w,90/h); const ox=5-minX*scale, oy=5-minY*scale;
            ctx.strokeStyle='#e8e8e6'; ctx.lineWidth=1;
            for(let x=0;x<c.width;x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke(); }
            for(let y=0;y<c.height;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke(); }
            nodes.forEach(n=>{
              const x=n.position.x*scale+ox, y=n.position.y*scale+oy, rw=160*scale, rh=44*scale;
              let col='#ddd6fe';
              if(n.data?.kind==='sticky'){ col=n.data.color==='yellow'?'#fef08a': n.data.color==='pink'?'#fbcfe8': n.data.color==='blue'?'#bfdbfe': n.data.color==='green'?'#bbf7d0':'#ddd6fe'; }
              else if(n.data?.kind==='image') col='#e5e5e3';
              else if(n.data?.kind==='link') col='#e0e7ff';
              ctx.fillStyle=col; ctx.strokeStyle='#e8e8e6'; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,rw,rh,4); else ctx.rect(x,y,rw,rh); ctx.fill(); ctx.stroke();
            });
            thumbnail=c.toDataURL('image/png');
          }
        }
      } catch {}
      if(!proj.snapshots) proj.snapshots=[];
      proj.snapshots.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), name: 'Snapshot '+new Date().toLocaleTimeString(), createdAt: Date.now(), viewport:{x:canvasTx,y:canvasTy,zoom:canvasScale}, nodes: JSON.parse(JSON.stringify(proj.nodes)), edges: JSON.parse(JSON.stringify(proj.edges||[])), thumbnail });
      scheduleSync(); render();
    });
    document.querySelectorAll('[data-restore]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-restore');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return;
        const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return;
        canvasTx=snap.viewport.x; canvasTy=snap.viewport.y; canvasScale=snap.viewport.zoom;
        const viewport=document.getElementById('canvas-viewport');
        const canvasEl=document.getElementById('web-canvas');
        if(viewport) viewport.style.transform='translate('+canvasTx+'px,'+canvasTy+'px) scale('+canvasScale+')';
        if(canvasEl) canvasEl.style.backgroundPosition=(canvasTx%20)+'px '+(canvasTy%20)+'px';
      });
      btn.addEventListener('dblclick', ()=>{
        const id=btn.getAttribute('data-restore');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return;
        const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return;
        if(confirm('Restore snapshot content (nodes/edges) as well? This will overwrite current canvas.')){ proj.nodes=JSON.parse(JSON.stringify(snap.nodes)); proj.edges=JSON.parse(JSON.stringify(snap.edges)); canvasTx=snap.viewport.x; canvasTy=snap.viewport.y; canvasScale=snap.viewport.zoom; scheduleSync(); render(); }
      });
    });
    document.querySelectorAll('[data-delete-snap]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); const id=btn.getAttribute('data-delete-snap'); const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return; proj.snapshots=proj.snapshots.filter(s=>s.id!==id); scheduleSync(); render(); });
    });
    document.querySelectorAll('[data-rename-snap]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); const id=btn.getAttribute('data-rename-snap'); const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return; const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return; const name=prompt('Rename snapshot:', snap.name); if(name&&name.trim()){ snap.name=name.trim(); scheduleSync(); render(); } });
    });
    // Log clear (admin can clear, but anyone on web can clear their view - we allow all, admin in app has full)
    const logClear = document.getElementById('log-clear');
    if (logClear) logClear.addEventListener('click', ()=>{
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      if (isAdminUser() || confirm('Clear activity log for this project?')) {
        proj.changeLog = [];
        scheduleSync(); render();
      }
    });
    // Research handlers
    const qaAddBtn = document.getElementById('research-add-qa');
    const qaForm = document.getElementById('research-qa-form');
    if (qaAddBtn && qaForm) {
      qaAddBtn.addEventListener('click', ()=>{ qaForm.style.display = qaForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('qa-cancel')?.addEventListener('click', ()=>{ qaForm.style.display='none'; });
      document.getElementById('qa-save')?.addEventListener('click', ()=>{
        const q=(document.getElementById('qa-q')).value.trim();
        const a=(document.getElementById('qa-a')).value.trim();
        const speaker=(document.getElementById('qa-speaker')).value.trim();
        if(!q||!a) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.qa.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), question:q, answer:a, speaker: speaker||undefined, createdAt: Date.now() });
        (document.getElementById('qa-q')).value=''; (document.getElementById('qa-a')).value=''; (document.getElementById('qa-speaker')).value='';
        qaForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-qa]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-qa');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.qa=proj.research.qa.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    const webAddBtn=document.getElementById('research-add-web');
    const webForm=document.getElementById('research-web-form');
    if(webAddBtn && webForm){
      webAddBtn.addEventListener('click', ()=>{ webForm.style.display = webForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('web-cancel')?.addEventListener('click', ()=>{ webForm.style.display='none'; });
      document.getElementById('web-save')?.addEventListener('click', ()=>{
        const url=(document.getElementById('web-url')).value.trim();
        const title=(document.getElementById('web-title')).value.trim();
        const notes=(document.getElementById('web-notes')).value.trim();
        if(!url) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.websites.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), url, title: title||url, notes, capturedAt: Date.now() });
        (document.getElementById('web-url')).value=''; (document.getElementById('web-title')).value=''; (document.getElementById('web-notes')).value='';
        webForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-web]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-web');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.websites=proj.research.websites.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    // Form handlers
    let formResponses = [];
    const formAddBtn=document.getElementById('research-add-form');
    const formForm=document.getElementById('research-form-form');
    if(formAddBtn && formForm){
      formAddBtn.addEventListener('click', ()=>{ formForm.style.display = formForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('form-cancel')?.addEventListener('click', ()=>{ formForm.style.display='none'; formResponses=[]; const list=document.getElementById('form-qa-list'); if(list) list.innerHTML=''; });
      document.getElementById('form-add-qa')?.addEventListener('click', ()=>{
        const q=(document.getElementById('form-q')).value.trim();
        const a=(document.getElementById('form-a')).value.trim();
        if(!q||!a) return;
        formResponses.push({question:q, answer:a});
        (document.getElementById('form-q')).value=''; (document.getElementById('form-a')).value='';
        const list=document.getElementById('form-qa-list');
        if(list) list.innerHTML = formResponses.map((r,i)=> '<div style="display:flex; justify-content:space-between; gap:4px; font-size:11px; background:var(--bg-well); padding:4px 6px; border-radius:4px;"><span><b>Q:</b> '+escapeHtml(r.question)+' <b>A:</b> '+escapeHtml(r.answer)+'</span><button data-remove-form-qa="'+i+'" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">\u2715</button></div>').join('') + (formResponses.length? formResponses.map((_,i)=>'').join('') : '');
        // Need to re-attach remove handlers? We'll handle via delegated or re-render not needed
      });
      document.getElementById('form-save')?.addEventListener('click', ()=>{
        const title=(document.getElementById('form-title')).value.trim();
        if(!title || formResponses.length===0) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.forms.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), formTitle: title, responses: [...formResponses], submittedAt: Date.now() });
        (document.getElementById('form-title')).value=''; formResponses=[]; const list=document.getElementById('form-qa-list'); if(list) list.innerHTML=''; formForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-form]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-form');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.forms=proj.research.forms.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    // CAD handlers
    const cadUpload = document.getElementById('cad-upload');
    const cadFileInput = document.getElementById('cad-file-input');
    if(cadUpload && cadFileInput){
      cadUpload.addEventListener('click', ()=> cadFileInput.click());
      cadFileInput.addEventListener('change', (e)=>{
        const file=(e.target).files?.[0]; if(!file) return;
        const reader=new FileReader();
        reader.onload=(ev)=>{
          const src=ev.target?.result;
          const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
          if(!proj.cadDrawings) proj.cadDrawings=[];
          proj.cadDrawings.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), name: file.name, src, type: file.type||'cad', createdAt: Date.now() });
          scheduleSync(); render();
        };
        reader.readAsDataURL(file);
        (e.target).value='';
      });
    }
    document.querySelectorAll('[data-delete-cad]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-cad');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.cadDrawings) return;
        proj.cadDrawings=proj.cadDrawings.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    document.querySelectorAll('[data-select-cad]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const id=el.getAttribute('data-select-cad');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.cadDrawings) return;
        const cad=proj.cadDrawings.find(x=>x.id===id); if(!cad) return;
        // Simple: move to front
        proj.cadDrawings = [cad, ...proj.cadDrawings.filter(x=>x.id!==id)];
        scheduleSync(); render();
      });
    });
    // CAD zoom
    const cadViewer=document.getElementById('cad-viewer');
    const cadZoom=document.getElementById('cad-zoom');
    let cadScale=1;
    document.querySelectorAll('[data-cad-zoom]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const dir=btn.getAttribute('data-cad-zoom');
        if(dir==='in') cadScale=Math.min(3, cadScale*1.2);
        else if(dir==='out') cadScale=Math.max(0.5, cadScale/1.2);
        if(cadZoom) cadZoom.style.transform='scale('+cadScale+')';
        const label=document.getElementById('cad-zoom-label');
        if(label) label.textContent=Math.round(cadScale*100)+'%';
      });
    });
    const cadReset=document.querySelector('[data-cad-reset]');
    if(cadReset) cadReset.addEventListener('click', ()=>{
      cadScale=1;
      if(cadZoom) cadZoom.style.transform='scale(1)';
      const label=document.getElementById('cad-zoom-label');
      if(label) label.textContent='100%';
    });
    if(cadViewer && cadZoom){
      cadViewer.addEventListener('wheel', (e)=>{
        e.preventDefault();
        const delta=e.deltaY>0?0.9:1.1;
        cadScale=Math.min(3, Math.max(0.5, cadScale*delta));
        cadZoom.style.transform='scale('+cadScale+')';
        const label2=document.getElementById('cad-zoom-label');
        if(label2) label2.textContent=Math.round(cadScale*100)+'%';
      });
    }
  })();
  // \u2500\u2500 Document handlers \u2500\u2500
  (function(){
    const docAdd = document.getElementById('doc-add');
    if (docAdd) docAdd.addEventListener('click', () => {
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      const id = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
      if (!proj.documents) proj.documents = [];
      proj.documents.push({id, title: 'Untitled Document', content: null, updatedAt: Date.now()});
      proj.activeDocumentId = id;
      scheduleSync(); render();
    });
    document.querySelectorAll('[data-rename-doc]').forEach(el => {
      const handler = () => {
        const id = el.getAttribute('data-rename-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const v = el.value.trim() || 'Untitled';
        if (doc.title !== v) { doc.title = v; doc.updatedAt = Date.now(); scheduleSync(); }
      };
      el.addEventListener('change', handler);
      el.addEventListener('blur', handler);
    });
    document.querySelectorAll('[data-delete-doc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        proj.documents = (proj.documents||[]).filter(d=>d.id!==id);
        if (proj.activeDocumentId===id) proj.activeDocumentId = (proj.documents[0]&&proj.documents[0].id) || null;
        scheduleSync(); render();
      });
    });
    document.querySelectorAll('[data-activate-doc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-activate-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        proj.activeDocumentId = id;
        scheduleSync(); render();
      });
    });
    const docAddEmpty = document.getElementById('doc-add-empty');
    if (docAddEmpty) docAddEmpty.addEventListener('click', () => {
      const btn = document.getElementById('doc-add');
      if (btn) btn.click();
    });
    document.querySelectorAll('[data-edit-doc]').forEach(ta => {
      let tmr=null;
      const save = () => {
        const id = ta.getAttribute('data-edit-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const text = ta.value;
        if (text) {
          doc.content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
        } else {
          doc.content = null;
        }
        doc.updatedAt = Date.now();
        scheduleSync();
      };
      ta.addEventListener('input', () => { if(tmr) clearTimeout(tmr); tmr=setTimeout(save, 500); });
      ta.addEventListener('blur', save);
    });
    // Doc context menu (right-click on lateral list)
    document.querySelectorAll('[data-activate-doc]').forEach(el => {
      // Avoid duplicate listeners on the main doc items (which are also data-activate-doc)
      // The lateral list items are the ones in the 220px sidebar, but the main doc items also have data-activate-doc
      // We will handle both, but ensure we don't double-attach
      if (el.closest('[data-doc-menu]')) return;
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = el.getAttribute('data-activate-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const menu = document.getElementById('web-doc-menu');
        if(!menu) return;
        menu.innerHTML = '<div style="padding:6px 10px; border-bottom:1px solid var(--border-separator);"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(doc.title) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + new Date(doc.updatedAt).toLocaleDateString() + '</div></div>'
          + '<button data-action="rename" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u270E</span> Rename</button>'
          + '<button data-action="duplicate" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u29C9</span> Duplicate</button>'
          + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
          + '<div style="padding:4px 10px; font-size:10px; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Share</div>'
          + '<button data-action="copy_link" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2197</span> Copy Link</button>'
          + '<button data-action="copy_content" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2398</span> Copy Content</button>'
          + '<button data-action="export" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>\u2B07</span> Export File\u2026</button>'
          + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
          + '<button data-action="delete" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; color:#b12424; display:flex; gap:6px; align-items:center;"><span>\u2715</span> Delete</button>';
        menu.style.display='block';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 300) + 'px';
        const handleDocAction = async (action) => {
          menu.style.display='none';
          if(action==='rename'){
            const name=prompt('Rename text file:', doc.title);
            console.log('doc rename', name, doc.title);
            if(name&&name.trim()){
              const newName=name.trim();
              doc.title=newName; doc.updatedAt=Date.now();
              console.log('doc renamed to', newName);
              fetch('/api/state', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(state) }).catch(e=>console.error(e));
              scheduleSync(); render();
            }
          } else if(action==='duplicate'){
            const newId = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
            const copy = JSON.parse(JSON.stringify(doc));
            copy.id=newId; copy.title=doc.title+' Copy'; copy.updatedAt=Date.now();
            proj.documents.push(copy); proj.activeDocumentId=newId; scheduleSync(); render();
          } else if(action==='copy_link'){
            const link = location.origin + location.pathname + '?project=' + proj.id + '&doc=' + doc.id;
            try{ await navigator.clipboard.writeText(link); alert('Link copied: '+link); }catch{ prompt('Copy link:', link); }
          } else if(action==='copy_content'){
            const text = doc.content ? (typeof doc.content==='string' ? doc.content : JSON.stringify(doc.content,null,2)) : '';
            try{ await navigator.clipboard.writeText(text||doc.title); alert('Content copied'); }catch{ prompt('Copy content:', text.slice(0,4000)); }
          } else if(action==='export'){
            const data=JSON.stringify(doc,null,2);
            const blob=new Blob([data],{type:'application/json'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a'); a.href=url; a.download=(doc.title.replace(/[^a-z0-9]/gi,'_')+'.json'); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
          } else if(action==='delete'){
            if(confirm('Delete "'+doc.title+'"?')){ proj.documents=proj.documents.filter(d=>d.id!==doc.id); if(proj.activeDocumentId===doc.id) proj.activeDocumentId=(proj.documents[0]&&proj.documents[0].id)||null; scheduleSync(); render(); }
          }
        };
        menu.querySelectorAll('button[data-action]').forEach(btn=>{
          btn.addEventListener('click', ()=> handleDocAction(btn.getAttribute('data-action')));
          btn.addEventListener('mouseenter', ()=> btn.style.background='var(--bg-well)');
          btn.addEventListener('mouseleave', ()=> btn.style.background='none');
        });
        const closeDoc = (ev)=>{ if(!menu.contains(ev.target)){ menu.style.display='none'; window.removeEventListener('click', closeDoc); } };
        setTimeout(()=> window.addEventListener('click', closeDoc), 0);
      });
    });
  })();
  // \u2500\u2500 Methodology handlers \u2500\u2500
  (function(){
    document.querySelectorAll('[data-set-phase]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ph = btn.getAttribute('data-set-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        proj.methodology.currentPhase = ph;
        scheduleSync(); render();
      });
    });
    const addTaskBtn = document.getElementById('method-add-task');
    const newTaskInput = document.getElementById('method-new-task');
    const addTask = () => {
      const text = newTaskInput ? newTaskInput.value.trim() : '';
      if (!text) return;
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
      const ph = proj.methodology.currentPhase||'discover';
      if (!proj.methodology.phases[ph]) return;
      proj.methodology.phases[ph].tasks.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), text, done:false });
      if (newTaskInput) newTaskInput.value='';
      scheduleSync(); render();
    };
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (newTaskInput) newTaskInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addTask(); });
    document.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-delete-task');
        const ph = btn.getAttribute('data-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        const phase = proj.methodology.phases[ph]; if(!phase) return;
        phase.tasks = phase.tasks.filter(t=>t.id!==taskId);
        scheduleSync(); render();
      });
    });
    const notes = document.getElementById('method-notes');
    if (notes) {
      let tmr=null;
      const saveNotes = () => {
        const ph = notes.getAttribute('data-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        const phase = proj.methodology.phases[ph]; if(!phase) return;
        phase.notes = notes.value;
        scheduleSync();
      };
      notes.addEventListener('input', ()=>{ if(tmr) clearTimeout(tmr); tmr=setTimeout(saveNotes,500); });
      notes.addEventListener('blur', saveNotes);
    }
  })();
  // \u2500\u2500 Prototype handlers (website / 3d / image) \u2500\u2500
  (function(){
    const fileInput = document.getElementById('viewer-file-input');
    let pendingProtoKind = 'image';
    function addProto(kind, name, src, type){
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      if(!proj.prototypes) proj.prototypes=[];
      // migrate legacy viewerModel if exists
      if (proj.viewerModel && !proj.prototypes.length) {
        const vm = proj.viewerModel;
        const k = (vm.type||'').startsWith('image/') ? 'image' : '3d';
        proj.prototypes.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), kind: k, name: vm.name, src: vm.src, type: vm.type, createdAt: vm.uploadedAt||Date.now() });
        delete proj.viewerModel;
      }
      proj.prototypes.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), kind, name, src, type: type|| (kind==='website'?'text/website': kind==='image'?'image/png':'model/gltf'), createdAt: Date.now() });
      scheduleSync(); render();
    }
    const addWebsiteBtn = document.getElementById('proto-add-website');
    const add3dBtn = document.getElementById('proto-add-3d');
    const addImageBtn = document.getElementById('proto-add-image');
    if (addWebsiteBtn) addWebsiteBtn.addEventListener('click', ()=>{
      const url = prompt('Website prototype URL:', 'https://');
      if(!url) return;
      const name = prompt('Name:', url) || url;
      addProto('website', name, url, 'text/website');
    });
    const triggerProtoFile = (kind)=>{
      pendingProtoKind = kind;
      if(fileInput){
        fileInput.accept = kind==='image' ? 'image/*' : '.obj,.gltf,.glb,image/*';
        fileInput.click();
      }
    };
    if (add3dBtn) add3dBtn.addEventListener('click', ()=> triggerProtoFile('3d'));
    if (addImageBtn) addImageBtn.addEventListener('click', ()=> triggerProtoFile('image'));
    if (fileInput) fileInput.addEventListener('change', (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev)=>{
        const src = ev.target.result;
        let kind = pendingProtoKind;
        if(file.type.startsWith('image/')) kind='image';
        else if(file.name.match(/.(gltf|glb|obj)$/i)) kind='3d';
        addProto(kind, file.name, src, file.type);
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });
    document.querySelectorAll('[data-delete-proto]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-delete-proto');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.prototypes) return;
        proj.prototypes = proj.prototypes.filter(p=>p.id!==id);
        scheduleSync(); render();
      });
    });
    const dropEl = document.getElementById('viewer-drop');
    if (dropEl) {
      dropEl.addEventListener('click', ()=> triggerProtoFile('image'));
      dropEl.addEventListener('dragover', (e)=>{ e.preventDefault(); dropEl.style.borderColor='var(--accent)'; });
      dropEl.addEventListener('dragleave', ()=>{ dropEl.style.borderColor='var(--border-separator)'; });
      dropEl.addEventListener('drop', (e)=>{
        e.preventDefault(); dropEl.style.borderColor='var(--border-separator)';
        const file = e.dataTransfer.files[0];
        if(file){
          const reader = new FileReader();
          reader.onload=(ev)=>{
            const src=ev.target.result;
            let kind='image';
            if(file.type.startsWith('image/')) kind='image';
            else if(file.name.match(/.(gltf|glb|obj)$/i)) kind='3d';
            else kind='image';
            addProto(kind, file.name, src, file.type);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  })();
  document.getElementById('last-sync').textContent = 'Last synced: ' + new Date(state.lastSavedAt || Date.now()).toLocaleTimeString();
    const screenplayTa = document.getElementById('screenplay-textarea');
    if (screenplayTa) {
      screenplayTa.addEventListener('input', () => {
        const val = screenplayTa.value;
        if (p.documents && p.documents[0]) {
          p.documents[0].content = val;
          p.documents[0].updatedAt = Date.now();
        } else {
          if (!p.documents) p.documents = [];
          p.documents.push({ id: 'screenplay-doc', title: 'Screenplay', content: val, updatedAt: Date.now() });
        }
        scheduleSync();
        const prev = document.getElementById('screenplay-preview');
        if (prev) {
          const lines = val.split('
');
          let html = '';
          lines.forEach(l => {
            const trimmed = l.trim();
            if (!trimmed) { html += '<div style="height:12px;"></div>'; return; }
            if (/^(INT|EXT|EST|INT/EXT)\b/i.test(trimmed) || (/^[A-Z0-9s-.,/()]+$/.test(trimmed) && trimmed === trimmed.toUpperCase() && !trimmed.endsWith(':') && trimmed.length < 60)) {
              html += '<div style="font-weight:700; text-transform:uppercase; margin:16px 0 8px 0; letter-spacing:0.05em; color:var(--text-primary);">' + escapeHtml(trimmed) + '</div>';
            } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
              html += '<div style="color:var(--text-tertiary); font-style:italic; text-align:center; margin:2px 0; padding-left:40px;">' + escapeHtml(trimmed) + '</div>';
            } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !/[.?!]$/.test(trimmed)) {
              html += '<div style="font-weight:700; color:var(--accent); text-transform:uppercase; text-align:center; margin:14px 0 2px 0; letter-spacing:0.05em;">' + escapeHtml(trimmed) + '</div>';
            } else {
              html += '<div style="color:var(--text-primary); margin-bottom:8px; line-height:1.5;">' + escapeHtml(trimmed) + '</div>';
            }
          });
          prev.innerHTML = html;
        }
      });
    }
    const screenplayExp = document.getElementById('screenplay-export');
    if (screenplayExp) {
      screenplayExp.addEventListener('click', () => {
        const val = screenplayTa ? screenplayTa.value : '';
        const blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (p.name || 'Screenplay') + '.fountain';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
}
function selectProject(id) { currentProjectId = id; render(); }
function extractText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (content.text) return content.text;
  if (Array.isArray(content.content)) {
    return content.content.map(n => extractText(n)).join(' ');
  }
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(n => {
      if (n.text) return n.text;
      if (n.content) return extractText(n);
      return '';
    }).join(' ').trim();
  }
  return '';
}
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
async function toggleTask(phase, taskId) {
  if (!state) return;
  const p = state.projects.find(x => x.id === currentProjectId);
  if (!p || !p.methodology) return;
  const pd = p.methodology.phases[phase];
  if (!pd) return;
  const task = pd.tasks.find(t => t.id === taskId);
  if (task) task.done = !task.done;
  scheduleSync();
}
async function syncNow() {
  if (!state) return;
  setStatus('syncing');
  try {
    await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
    setStatus('online');
    document.getElementById('last-sync').textContent = 'Last synced: ' + new Date().toLocaleTimeString();
  } catch (e) {
    setStatus('offline');
  }
}
function refresh() { fetchState(); }
ensureUsername();
updateUserDisplay();
heartbeatPresence();
fetchState();
fetchPresence();
updateModeSeg();
showWebSetupIfNeeded();
setInterval(fetchState, 2000);
setInterval(fetchPresence, 3000);
setInterval(heartbeatPresence, 10000);
setInterval(updateUserDisplay, 2000);

// heartbeat on visibility change and after any change
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) heartbeatPresence(); });
</script>
</body>
</html>
`;
var presence = /* @__PURE__ */ new Map();
var PRESENCE_TIMEOUT = 3e4;
function cleanupPresence() {
  const now = Date.now();
  for (const [id, e] of presence.entries()) if (now - e.lastSeen > PRESENCE_TIMEOUT) presence.delete(id);
}
setInterval(cleanupPresence, 1e4);
function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const ifaces of Object.values(nets)) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}
async function ensureCert() {
  const certDir = path2.join(app.getPath("userData"), "canvas-cert");
  const certPath = path2.join(certDir, "cert.pem");
  const keyPath = path2.join(certDir, "key.pem");
  try {
    await fs2.access(certPath);
    await fs2.access(keyPath);
    return;
  } catch {
  }
  try {
    await fs2.mkdir(certDir, { recursive: true });
    const ips = getLocalIPs();
    const san = ["DNS:localhost", "IP:127.0.0.1", ...ips.map((ip) => `IP:${ip}`)].join(",");
    await new Promise((resolve2, reject) => {
      const proc = spawn("openssl", [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-days",
        "365",
        "-nodes",
        "-subj",
        "/CN=localhost",
        "-addext",
        `subjectAltName=${san}`
      ]);
      proc.on("close", (code) => code === 0 ? resolve2() : reject(new Error(`openssl exit ${code}`)));
      proc.on("error", reject);
    });
    logger3.info("sync-service", `Generated self-signed cert at ${certPath} SAN=${san}`);
  } catch (e) {
    logger3.warn("sync-service", "Failed to generate cert", e);
  }
}
async function getHttpsOptions() {
  await ensureCert();
  try {
    const certPath = path2.join(app.getPath("userData"), "canvas-cert", "cert.pem");
    const keyPath = path2.join(app.getPath("userData"), "canvas-cert", "key.pem");
    const [cert, key] = await Promise.all([fs2.readFile(certPath, "utf-8"), fs2.readFile(keyPath, "utf-8")]);
    if (cert && key) return { cert, key };
  } catch {
  }
  try {
    const [cert, key] = await Promise.all([fs2.readFile("/tmp/canvas-cert/cert.pem", "utf-8"), fs2.readFile("/tmp/canvas-cert/key.pem", "utf-8")]);
    if (cert && key) return { cert, key };
  } catch {
  }
  return null;
}
function getNetworkUrls(port2) {
  const ips = getLocalIPs();
  const urls = ips.map((ip) => `http://${ip}:${port2}`);
  urls.unshift(`http://localhost:${port2}`);
  const httpsUrls = ips.map((ip) => `https://${ip}:${port2}`);
  httpsUrls.unshift(`https://localhost:${port2}`);
  return [...urls, ...httpsUrls];
}
var SyncService = class {
  dataPath = null;
  saveQueue = Promise.resolve();
  currentState = null;
  server = null;
  port = 7531;
  publicUrl = null;
  tunnelProcess = null;
  listeners = /* @__PURE__ */ new Set();
  async getDataPath() {
    if (!this.dataPath) {
      const userDataPath = app.getPath("userData");
      await fs2.mkdir(userDataPath, { recursive: true });
      this.dataPath = path2.join(userDataPath, "workspace-state.json");
    }
    return this.dataPath;
  }
  /** Load state from disk. Returns null on first run. */
  async load() {
    try {
      const filePath = await this.getDataPath();
      const raw = await fs2.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "projects" in parsed) {
        this.currentState = parsed;
        return this.currentState;
      }
      throw new Error("workspace-state.json: invalid shape");
    } catch (error) {
      if (!isFileNotFound(error)) {
        logger3.error("sync-service", "Failed to load workspace state", error);
      }
      return null;
    }
  }
  /** Persist state to disk atomically. */
  async save(state) {
    this.currentState = state;
    const snapshot = { ...state };
    const save = this.saveQueue.catch(() => void 0).then(async () => {
      const filePath = await this.getDataPath();
      const tempPath = `${filePath}.${process.pid}.tmp`;
      try {
        await fs2.writeFile(
          tempPath,
          JSON.stringify(snapshot, null, 2),
          "utf-8"
        );
        await fs2.rename(tempPath, filePath);
      } finally {
        await fs2.rm(tempPath, { force: true });
      }
    });
    this.saveQueue = save;
    await save;
  }
  /** Get the current in-memory state (for web API). */
  getState() {
    return this.currentState;
  }
  /** Replace state from an external source (web client). */
  async setState(state) {
    await this.save(state);
    this.notifyListeners();
  }
  /** Subscribe to state changes pushed from external clients. */
  onStateChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notifyListeners() {
    if (this.currentState) {
      for (const listener of this.listeners) {
        listener(this.currentState);
      }
    }
  }
  /** Start the HTTPS server that serves the web client + REST API. */
  async startServer() {
    if (this.server) return this.port;
    const httpsOpts = await getHttpsOptions();
    return new Promise((resolve2, reject) => {
      const handler = async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }
        if (req.url === "/api/state" && req.method === "GET") {
          let state = this.getState();
          if (!state) {
            state = await this.load();
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(state ?? { projects: [], globalStickies: [] }));
          return;
        }
        if (req.url === "/api/info" && req.method === "GET") {
          const urls = getNetworkUrls(this.port);
          const hostname2 = os.hostname();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ port: this.port, urls, hostname: hostname2, ips: getLocalIPs(), publicUrl: this.publicUrl }));
          return;
        }
        if (req.url === "/api/presence" && req.method === "GET") {
          cleanupPresence();
          const list = Array.from(presence.values()).map((v) => ({ id: v.id, user: v.user, isAdmin: v.isAdmin, lastSeen: v.lastSeen, projectId: v.projectId }));
          const byUser = /* @__PURE__ */ new Map();
          for (const e of list) if (!byUser.has(e.user) || e.lastSeen > (byUser.get(e.user)?.lastSeen || 0)) byUser.set(e.user, e);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ users: Array.from(byUser.values()), count: byUser.size, total: list.length }));
          return;
        }
        if (req.url === "/api/presence" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 4096) req.destroy();
          });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              const id = String(data.id || "").slice(0, 64) || "anon-" + Math.random().toString(36).slice(2, 7);
              const user = String(data.user || "Anonymous").slice(0, 24) || "Anonymous";
              const isAdmin = !!data.isAdmin;
              const projectId = data.projectId ? String(data.projectId).slice(0, 64) : void 0;
              presence.set(id, { id, user, isAdmin, lastSeen: Date.now(), projectId });
              cleanupPresence();
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true, id }));
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }
        if (req.url === "/api/state" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 10 * 1024 * 1024) {
              req.destroy();
            }
          });
          req.on("end", async () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "projects" in parsed) {
                const state = parsed;
                state.lastSavedAt = Date.now();
                await this.setState(state);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
              } else {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid state shape" }));
              }
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }
        if (req.url === "/" || req.url === "/index.html") {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(WEB_CLIENT_HTML);
          return;
        }
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      };
      const server = http.createServer(handler);
      if (httpsOpts) {
        try {
          const httpsServer = https.createServer({ cert: httpsOpts.cert, key: httpsOpts.key }, handler);
          httpsServer.listen(port + 1, "0.0.0.0", () => {
            logger3.info("sync-service", `HTTPS also available at https://localhost:${port + 1} (self-signed, Safari may block - use http)`);
          });
          httpsServer.on("error", (e) => logger3.warn("sync-service", "HTTPS server error", e));
        } catch (e) {
          logger3.warn("sync-service", "Failed to start https server", e);
        }
      }
      const onListening = async () => {
        const addr = server.address();
        const actualPort = addr && typeof addr === "object" ? addr.port : this.port;
        this.port = actualPort;
        this.server = server;
        try {
          const loaded = await this.load();
          if (loaded) {
            logger3.info("sync-service", `Loaded workspace-state.json with ${loaded.projects.length} projects`);
          }
        } catch {
        }
        const urls = getNetworkUrls(actualPort);
        logger3.info("sync-service", `Web client available at ${urls.join(", ")}`);
        logger3.info("sync-service", `For access from other networks: allow port ${actualPort} in firewall, or use tunnel: 'npx localtunnel --port ${actualPort}' or Tailscale`);
        this.startTunnel(actualPort).catch((e) => logger3.warn("sync-service", "Tunnel failed to start", e));
        resolve2(actualPort);
      };
      server.on("error", (err) => {
        const code = err?.code;
        if (code === "EADDRINUSE" || code === "EACCES") {
          logger3.warn("sync-service", `Port ${this.port} unavailable (${code}), retrying on random port`);
          server.listen(0, "0.0.0.0", onListening);
        } else {
          logger3.error("sync-service", "HTTP server error", err);
          reject(err);
        }
      });
      server.listen(this.port, "0.0.0.0", onListening);
    });
  }
  /** Stop the HTTP server. */
  async stopServer() {
    await this.stopTunnel();
    if (!this.server) return;
    return new Promise((resolve2) => {
      this.server?.close(() => {
        this.server = null;
        resolve2();
      });
    });
  }
  getServerPort() {
    return this.port;
  }
  getPublicUrl() {
    return this.publicUrl;
  }
  getNetworkInfo() {
    return {
      port: this.port,
      urls: getNetworkUrls(this.port),
      hostname: os.hostname(),
      ips: getLocalIPs(),
      publicUrl: this.publicUrl
    };
  }
  async startTunnel(port2) {
    if (this.tunnelProcess) return this.publicUrl;
    try {
      const { spawn: spawn2 } = __require("node:child_process");
      try {
        const { execSync } = __require("node:child_process");
        execSync("which cloudflared", { stdio: "ignore" });
        return await new Promise((resolve2) => {
          const proc = spawn2("cloudflared", ["tunnel", "--url", `http://localhost:${port2}`], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
          this.tunnelProcess = proc;
          let url = null;
          let output = "";
          const onData = (d) => {
            const text = d.toString();
            output += text;
            const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com[^\s|]*/i);
            if (m && !url) {
              url = m[0];
              this.publicUrl = url;
              logger3.info("sync-service", `Public tunnel (cloudflared) available at ${url} \u2014 share this, no IP prompt`);
              resolve2(url);
            }
            text.split("\n").forEach((l) => {
              if (l.trim()) logger3.info("sync-service", `[cloudflared] ${l.trim()}`);
            });
          };
          proc.stdout?.on("data", onData);
          proc.stderr?.on("data", onData);
          proc.on("error", (err) => {
            logger3.warn("sync-service", "cloudflared spawn error", err);
            this.tunnelProcess = null;
            resolve2(null);
          });
          proc.on("exit", (code) => {
            logger3.warn("sync-service", `cloudflared tunnel exited code=${code} url=${url}`);
            this.tunnelProcess = null;
            if (!url) resolve2(null);
            else {
              this.publicUrl = null;
              if (this.server) setTimeout(() => this.startTunnel(port2).catch(() => {
              }), 5e3);
            }
          });
          setTimeout(() => {
            if (!url) {
              logger3.warn("sync-service", "cloudflared no URL in 20s, output: " + output.slice(0, 1e3));
              resolve2(null);
            }
          }, 2e4);
        });
      } catch {
      }
      let lt;
      try {
        lt = require_localtunnel();
      } catch {
        try {
          lt = __require("localtunnel");
        } catch {
          lt = null;
        }
      }
      if (lt) {
        const fallbackSub = "canvas-" + Math.random().toString(36).slice(2, 8);
        const tunnel = await lt({ port: port2, subdomain: fallbackSub });
        const url = tunnel.url;
        this.publicUrl = url;
        this.tunnelProcess = tunnel;
        const handleClose = () => {
          logger3.warn("sync-service", `Tunnel closed for ${url}, will restart in 5s`);
          this.tunnelProcess = null;
          this.publicUrl = null;
          if (this.server) setTimeout(() => this.startTunnel(port2).catch(() => {
          }), 5e3);
        };
        tunnel.on("close", handleClose);
        tunnel.on("error", (e) => {
          logger3.warn("sync-service", "Tunnel error", e);
          handleClose();
        });
        setTimeout(async () => {
          try {
            const res = await fetch(url + "/api/info").then((r) => r.text()).catch(() => null);
            if (!res || res.includes("Bad Gateway") || res.includes("Tunnel not found") || res.includes("503")) {
              logger3.warn("sync-service", `Tunnel ${url} health check failed, restarting`);
              try {
                tunnel.close();
              } catch {
              }
              handleClose();
            } else {
              logger3.info("sync-service", `Tunnel health ok for ${url}`);
            }
          } catch {
          }
        }, 12e3);
        logger3.info("sync-service", `Public tunnel (fallback) available at ${url}`);
        return url;
      }
    } catch (e) {
      logger3.warn("sync-service", "Tunnel failed", e);
    }
    return null;
  }
  async stopTunnel() {
    if (this.tunnelProcess) {
      try {
        this.tunnelProcess.kill();
      } catch {
      }
      this.tunnelProcess = null;
      this.publicUrl = null;
    }
  }
};
var syncService = new SyncService();

// main/handlers/sync-handlers.ts
function registerSyncHandlers() {
  ipcMain.handle("sync:save", async (_event, state) => {
    try {
      await syncService.save(state);
      return { ok: true };
    } catch (err) {
      logger4.error("sync-handlers", "Failed to save state", err);
      return { ok: false, error: String(err) };
    }
  });
  ipcMain.handle("sync:load", async () => {
    const state = await syncService.load();
    if (!state) return null;
    if (!Array.isArray(state.projects)) return null;
    return state;
  });
  ipcMain.handle("sync:getPort", async () => {
    return syncService.getServerPort();
  });
  ipcMain.handle("sync:getNetworkInfo", async () => {
    return syncService.getNetworkInfo();
  });
  ipcMain.handle("sync:openWeb", async () => {
    const port2 = syncService.getServerPort();
    const url = `http://localhost:${port2}`;
    try {
      await shell.openExternal(url);
      return { ok: true, url };
    } catch (err) {
      logger4.error("sync-handlers", "Failed to open web client", err);
      return { ok: false, error: String(err) };
    }
  });
  syncService.onStateChange((state) => {
    ipcMain.broadcast("sync:stateChanged", state);
  });
  logger4.info("sync-handlers", "\u2713 Sync IPC handlers registered");
}

// main/handlers/index.ts
import { ipcMain as ipcMain2, logger as logger5 } from "@glaze/core/backend";
var __filename = fileURLToPath2(import.meta.url);
var __dirname = path3.dirname(__filename);
function registerHandlers() {
  logger5.info("handlers", "Registering IPC handlers...");
  ipcMain2.handle("app:getInfo", async (_event) => {
    return await appHandlers.getInfo();
  });
  ipcMain2.handle("app:getProjectPath", async () => {
    return path3.join(__dirname, "..", "..");
  });
  ipcMain2.handle("window:openSettings", async (_event) => {
    await openSettingsWindow();
  });
  ipcMain2.handle("window:closeSettings", async (_event) => {
    getSettingsWindow()?.close();
  });
  logger5.info("handlers", "\u2713 IPC handlers registered");
  registerSyncHandlers();
}

// main/index.ts
var __filename2 = fileURLToPath3(import.meta.url);
var __dirname2 = path4.dirname(__filename2);
registerHandlers();
var devHarness = null;
var appAiDevHarness = null;
if (false) {
  devHarness = await null;
  devHarness.applyParityScenarioStartup();
  appAiDevHarness = await null;
}
var mainWindow = null;
async function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    logger6.debug("main", "Main window already exists, skipping creation");
    return;
  }
  const packageJsonPath = path4.join(__dirname2, "..", "..", "package.json");
  const minWindowWidth = 390;
  const minWindowHeight = 456;
  const windowWidth = 1e3;
  const windowHeight = 700;
  let windowTitle = "Glaze App";
  try {
    if (fs3.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await fs3.promises.readFile(packageJsonPath, "utf-8"));
      windowTitle = packageJson.productName || packageJson.appConfig?.displayName || windowTitle;
    }
  } catch {
  }
  const browserWindowStartTime = Date.now();
  logger6.info("main", "\u23F1\uFE0F [COLD_START] Creating BrowserWindow", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  mainWindow = new BrowserWindow2({
    windowKey: "main",
    // Stable key for frame persistence
    width: windowWidth,
    height: windowHeight,
    minWidth: minWindowWidth,
    minHeight: minWindowHeight,
    title: windowTitle,
    show: false,
    // Don't show until WebView is ready (prevents flickering)
    webPreferences: {
      preload: getPreloadPath()
    }
  });
  const browserWindowEndTime = Date.now();
  logger6.info("main", "\u23F1\uFE0F [COLD_START] BrowserWindow constructor completed", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    duration_ms: browserWindowEndTime - browserWindowStartTime
  });
  mainWindow.once("ready-to-show", () => {
    const showStartTime = Date.now();
    logger6.info("main", "\u23F1\uFE0F [COLD_START] ready-to-show event received, showing window", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    mainWindow?.show();
    const showEndTime = Date.now();
    logger6.info("main", "\u23F1\uFE0F [COLD_START] Window shown", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration_ms: showEndTime - showStartTime
    });
  });
  const url = await getWindowUrl("main-window.html");
  logger6.info("main", "Resolved main window URL", { url });
  const loadURLStartTime = Date.now();
  logger6.info("main", "\u23F1\uFE0F [COLD_START] Loading URL in window", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url
  });
  await mainWindow.loadURL(url);
  const loadURLEndTime = Date.now();
  logger6.info("main", "\u23F1\uFE0F [COLD_START] URL loaded in window (waiting for ready-to-show)", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    duration_ms: loadURLEndTime - loadURLStartTime
  });
}
async function setupApplicationMenu() {
  await initDevToolsButtonState();
  const menu = Menu.buildFromTemplate([
    {
      label: "App",
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Settings\u2026",
          icon: "gearshape",
          accelerator: "Command+,",
          click: async () => await openSettingsWindow()
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    { role: "fileMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" }
  ]);
  Menu.setApplicationMenu(menu);
  logger6.info("main", "Application menu configured with Settings");
}
app2.on("window-all-closed", () => {
});
app2.on("activate", (hasVisibleWindows) => {
  logger6.info("main", "App activate event received", {
    hasVisibleWindows,
    mainWindowExists: !!mainWindow,
    mainWindowDestroyed: mainWindow?.isDestroyed() ?? true
  });
  if (!hasVisibleWindows) {
    if (!mainWindow || mainWindow.isDestroyed()) {
      logger6.info("main", "Creating main window due to activate event");
      createMainWindow();
    } else {
      logger6.info("main", "Showing existing main window");
      mainWindow.show();
    }
  } else {
    logger6.info("main", "Has visible windows, no action needed");
  }
});
app2.on("before-quit", () => {
  logger6.info("main", "App before-quit, cleaning up...");
  syncService.stopServer().catch((err) => {
    logger6.error("main", "Failed to stop web server", err);
  });
});
var startTime = Date.now();
logger6.info("main", "\u23F1\uFE0F [COLD_START] Waiting for app ready...", {
  timestamp: (/* @__PURE__ */ new Date()).toISOString()
});
app2.whenReady().then(async () => {
  const windowCreateStartTime = Date.now();
  logger6.info("main", "\u23F1\uFE0F [COLD_START] App ready, creating main window", {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    wait_duration_ms: windowCreateStartTime - startTime
  });
  await devHarness?.runParityAutotestIfRequested();
  await appAiDevHarness?.runAppAiAutotest();
  await setupApplicationMenu();
  try {
    await syncService.startServer();
    logger6.info("main", `Web client running at http://localhost:${syncService.getServerPort()}`);
  } catch (err) {
    logger6.error("main", "Failed to start web server", err);
  }
  createMainWindow().then(() => {
    const windowCreateEndTime = Date.now();
    logger6.info("main", "\u23F1\uFE0F [COLD_START] Main window created successfully", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration_ms: windowCreateEndTime - windowCreateStartTime
    });
  }).catch((error) => {
    logger6.error("main", "Failed to create main window", error);
  });
});
//# sourceMappingURL=index.js.map
