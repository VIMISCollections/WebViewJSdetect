// original file:crx_headers\header.js

// Android WebView bridge stubs
// Sources: bridge methods that return sensitive data from the Android side
// Sinks: bridge methods that send data back to the Android side

var bridge = {};
bridge.getName         = function() { return MarkSource(undefined, "webview_name_source"); };
bridge.findName        = function() { return MarkSource(undefined, "webview_name_source"); };
bridge.getContactNames = function() { return MarkSource(undefined, "webview_contact_source"); };
bridge.getLocation     = function() { return MarkSource(undefined, "webview_location_source"); };
bridge.checkTypes      = function() { return MarkSource(undefined, "webview_data_source"); };
bridge.getData         = function() { return MarkSource(undefined, "webview_data_source"); };
bridge.sendName        = function(data) { sink_function(data, "bridge_sendName_sink"); };
bridge.sendMessage     = function(data) { sink_function(data, "bridge_sendMessage_sink"); };
bridge.sendContacts    = function(data) { sink_function(data, "bridge_sendContacts_sink"); };

window.bridge = bridge;

// Android object (addJavascriptInterface)
var Android = {};
Android.getData   = function() { return MarkSource(undefined, "android_data_source"); };
Android.showData  = function(data) { sink_function(data, "android_showData_sink"); };

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\devtools.js

window.addEventListener("load", () => {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "viewport");
  meta.setAttribute("content", "width=device-width, initial-scale=1");
  document.head.prepend(meta);
  const style = document.createElement("style");
  style.innerText = ".filter-bitset-filter { overflow-x: scroll !important; }";
  document.body.prepend(style);
});

class WebSocket extends EventTarget {
  binaryType = "blob"; // Not used for DevTools protectol
  #state;
  #url;
  #payload;
  #pending = [];

  get bufferedAmount() {
    return new Blob(this.#pending).size;
  }
  get extensions() {
    return "";
  }
  get protocol() {
    return "";
  }
  get readyState() {
    return this.#state;
  }
  get url() {
    return this.#url;
  }

  constructor() {
    super();
    this.#state = 0;
    this.#url = arguments[0];
    this.#payload = { targetTabId: this.#url.split("/").pop() };
    ChromeXt.dispatch("websocket", this.#payload);
    ChromeXt.addEventListener("websocket", this.#handler.bind(this));
  }

  #handler(e) {
    const type = Object.keys(e.detail)[0];
    const data = e.detail[type];
    if (type == "message" && !("id" in data) && "params" in data) {
      const targetInfo = data.params.targetInfo;
      if (typeof targetInfo != "undefined" && targetInfo.type != "page") {
        console.info("Ignore inspecting", targetInfo.type, targetInfo.url);
        // To inspect them, we may need to change the targetTabId
        return;
      }
    } else if (type == "close") {
      this.close();
    } else if (type == "open") {
      this.#state = 1;
      // It would be better if the target is attached,
      // but there is no way to do so, neither to replay the pending message later.
    }
    const event = new MessageEvent(type, { data });
    try {
      this["on" + type](event);
    } catch {
      this.dispatchEvent(event);
    }
  }

  send(msg) {
    if (typeof msg == "string") {
      this.#pending.push(msg);
    } else {
      throw Error("Invalid message", msg);
    }
    if (this.#state == 1) {
      this.#pending.forEach((msg) => {
        this.#payload.message = msg;
        ChromeXt.dispatch("websocket", this.#payload);
      });
      this.#pending.length = 0;
    }
  }

  close() {
    this.#state = 2;
    const event = new MessageEvent("close");
    if (typeof this.onclose == "function") {
      this.onclose(event);
    } else {
      this.dispatchEvent(event);
    }
    this.#state = 3;
  }
}

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\editor.js

const isSandboxed = [
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
].includes(location.hostname);

async function installScript(force = false) {
  const dialog = document.querySelector("dialog#confirm");
  if (!force) {
    dialog.showModal();
  } else {
    dialog.close();
    const script = document.body.innerText;
    Symbol.ChromeXt.dispatch("installScript", script);
  }
}

function renderEditor(code, alertEncoding) {
  let scriptMeta = document.querySelector("#meta");
  if (scriptMeta) return;
  const separator = "==/UserScript==\n";
  const script = code.innerHTML.split(separator);
  if (separator.length == 1) return;
  let html = (script.shift() + separator).replace(
    "GM.ChromeXt",
    "<em>GM.ChromeXt</em>"
  );
  for (const api of ["GM_notification", "GM_setClipboard", "GM_cookie"]) {
    html = html.replace(api, `<span>${api}</span>`);
  }
  scriptMeta = document.createElement("pre");
  scriptMeta.innerHTML = html;
  code.innerHTML = script.join(separator);
  code.id = "code";
  code.removeAttribute("style");
  scriptMeta.id = "meta";
  document.body.prepend(scriptMeta);

  if (alertEncoding) {
    const msg =
      "Current script may contain badly encoded text.\n\nTo fix possible issues, you can download this script and open it locally.";
    createDialog(msg, false);
  } else {
    const msg =
      "Code editor is blocked on this page.\n\nPlease use the menu to install this UserScript, or reload the page to solve this problem.";
    createDialog(msg);
    setTimeout(fixDialog);
    // setTimeout is not working in sandboxed pages, and thus can be used for detecting sandboxed pages
  }

  scriptMeta.setAttribute("contenteditable", true);
  code.setAttribute("contenteditable", true);
  scriptMeta.setAttribute("spellcheck", false);
  code.setAttribute("spellcheck", false);
  // Too many nodes heavily slow down the event-loop, should be improved
  import("https://unpkg.com/@speed-highlight/core/dist/index.js").then(
    (imports) => {
      imports.highlightElement(code, "js", "multiline", {
        hideLineNumbers: true,
      });
    }
  );
}

function createDialog(msg) {
  const dialog = document.createElement("dialog");
  dialog.id = "confirm";
  dialog.textContent = msg;
  document.body.prepend(dialog);
  dialog.show();
}

function fixDialog() {
  const dialog = document.querySelector("dialog#confirm");
  if (dialog.textContent == "") return;
  dialog.close();
  dialog.textContent = "";
  const text = document.createElement("p");
  text.textContent = "Confirm ChromeXt to install this UserScript?";
  const div = document.createElement("div");
  div.id = "interaction";
  const yes = document.createElement("button");
  yes.textContent = "Confirm";
  yes.addEventListener("click", () => installScript(true));
  const no = document.createElement("button");
  no.addEventListener("click", () => {
    dialog.close();
    setTimeout(() => dialog.show(), 30000);
  });
  no.textContent = "Ask 30s later";
  div.append(yes);
  div.append(no);
  dialog.append(text);
  const askChromeXt = document.querySelector("#meta > em") != undefined;
  if (askChromeXt) {
    const alert = document.createElement("p");
    alert.id = "alert";
    alert.textContent = "ATTENTION: GM.ChromeXt is declared";
    dialog.append(alert);
  }
  dialog.append(div);
  installScript();
}

async function prepareDOM() {
  if (Symbol.ChromeXt == undefined) return;
  if (document.querySelector("script,div,p") != null) return;
  const meta = document.createElement("meta");
  const style = document.createElement("style");

  style.setAttribute("type", "text/css");
  meta.setAttribute("name", "viewport");
  meta.setAttribute(
    "content",
    "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
  );
  style.textContent = _editor_style;

  const code = document.querySelector("body > pre");
  if (document.readyState == "loading") {
    if (isSandboxed) {
      return prepareDOM();
      // EventListeners are unavailable in sandboxed pages
    } else {
      return document.addEventListener("DOMContentLoaded", prepareDOM);
    }
  }
  Symbol.installScript = installScript;
  document.head.appendChild(meta);
  document.head.appendChild(style);

  const alertEncoding = !(await fixEncoding(true, true, code));
  renderEditor(code, alertEncoding);
}

prepareDOM();

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\encoding.js

const invalidChar = "�";

class Encoding {
  #name;
  decoder = new TextDecoder();
  get encoding() {
    return this.#name;
  }
  map = () => [];
  constructor(name = "utf-8") {
    this.#name = name.toLowerCase();
  }
  defaultOnError(_input, result) {
    result.push(0xff);
  }
  defaultOnAlloc = (data) => new Uint8Array(data);
  static generateTable() {
    return new Map();
  }
  encode(input, opt = {}) {
    if (!(this.table instanceof Map))
      Object.defineProperty(this, "table", {
        value: new Map([
          ...this.constructor.generateTable(this.decode.bind(this)),
          ...this.map(),
        ]),
      });
    if (this.encoding == "utf-8") return new TextEncoder().encode(input);
    const onError = opt.onError || this.defaultOnError.bind(this);
    const onAlloc = opt.onAlloc || this.defaultOnAlloc.bind(this);
    const result = [];
    [...input].forEach((str) => {
      let codePoint = str.codePointAt(0);
      if (0x00 <= codePoint && codePoint < 0x80) {
        result.push[codePoint];
        return;
      }
      if (this.table.has(codePoint)) {
        result.push(this.table.get(codePoint));
      } else if (str == invalidChar) {
        const ret = onError(input, result);
        if (ret === -1) {
          throw Error("Stop decoding", input);
        }
      }
    });
    return new Uint8Array(onAlloc(result).buffer).filter((c) => c != 0x00);
  }
  decode(uint8) {
    return new TextDecoder(this.#name).decode(uint8);
  }
  convert(text) {
    return this.decoder.decode(this.encode(text));
  }
}

class SingleByte extends Encoding {
  static generateTable(decode, start = 0x80, end = 0xff) {
    const range = [...Array(end - start + 1).keys()];
    const charCodes = new Uint8Array(range.map((x) => x + start));
    const str = decode(charCodes);
    console.assert(str.length == charCodes.length);
    return new Map(range.map((i) => [str.codePointAt(i), charCodes[i]]));
  }
}

class TwoBytes extends Encoding {
  static intervals = [[0x81, 0xfe, 0x40, 0xfe]];
  static generateTable(decode) {
    const map = [];
    this.intervals.forEach(([b1Begin, b1End, b2Begin, b2End]) => {
      for (let b1 = b1Begin; b1 <= b1End; b1++) {
        for (let b2 = b2Begin; b2 <= b2End; b2++) {
          const charCode = (b2 << 8) | b1;
          const str = decode(new Uint16Array([charCode]));
          if (!str.includes(invalidChar))
            map.push([str.codePointAt(0), charCode]);
        }
      }
    });
    return map;
  }
  defaultOnAlloc = (data) => new Uint16Array(data);
}

class GBK extends TwoBytes {
  // https://en.wikipedia.org/wiki/GBK_(character_encoding)
  map = () => [["€".codePointAt(0), 0x80]];
}

class SJIS extends TwoBytes {
  // https://en.wikipedia.org/wiki/Shift_JIS
  map = () => SingleByte.generateTable(this.decode.bind(this), 0xa1, 0xdf);
}

function preferUTF8(
  text,
  utf8,
  encoding = document.characterSet.toLowerCase()
) {
  // Check if text with given encoding is properly encodes;
  // The argmuent utf8 is the same data encoded with UTF-8;
  // Return true if we should discard given encoding and use UTF-8 encoding instead
  if (encoding == "utf-8") return false;
  const encoded = new TextDecoder(encoding).decode(
    new TextEncoder().encode(utf8)
  );
  const length = Math.min(text.length, encoded.length);
  const result = text.slice(0, length) == encoded.slice(0, length);
  const msg = "The declared encoding is " + (result ? "incorrect" : "correct");
  console.debug(msg);
  return result;
}

function fixEncoding(tryPart = false, tryFetch = true, node) {
  // return false if failed
  node = node || document.querySelector("body > pre");
  const url = window.location.href;
  if (!node) return false;
  const text = node.textContent;
  const encoding = document.characterSet.toLowerCase();
  if (
    url.startsWith("file://") ||
    document.characterSet == "UTF-8" ||
    /^[\p{ASCII}]*$/u.test(text)
  )
    return true;
  if (window.content) {
    if (!window.content.fixed) {
      const utf8 = window.content["utf-8"];
      if (preferUTF8(text, utf8, encoding)) node.textContent = utf8;
    }
    window.content.fixed = true;
    return true;
  }
  let converter = () => invalidChar;
  let encoder = null;
  if (
    encoding.startsWith("windows") ||
    encoding.startsWith("iso-8859") ||
    encoding.startsWith("koi") ||
    encoding.startsWith("ibm") ||
    encoding.includes("mac")
  ) {
    encoder = new SingleByte(encoding);
  } else if (encoding.startsWith("gb")) {
    encoder = new GBK(encoding);
  } else if (encoding == "shift_jis") {
    encoder = new SJIS(encoding);
  } else {
    encoder = new TwoBytes(encoding);
  }
  if (encoder !== null) converter = encoder.convert.bind(encoder);
  let failed, converted;
  if (!tryPart && text.includes(invalidChar)) {
    failed = true;
  } else {
    converted = text.replace(/[^\p{ASCII}]+/gu, converter);
    failed = converted.includes(invalidChar);
  }
  if (!failed || tryPart) node.textContent = converted;
  if (tryFetch && failed) {
    return new Promise((resolve, _reject) => {
      fetch(url, { cache: "force-cache", mode: "same-origin" })
        .then((res) => res.text())
        .then((utf8) => {
          node.textContent = preferUTF8(text, utf8, encoding) ? utf8 : text;
          resolve(true);
        })
        .catch((_e) => resolve(false));
    });
  } else {
    return !failed;
  }
}

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\eruda.js

const ChromeXt = Symbol.ChromeXt.unlock(ChromeXtUnlockKeyForEruda, false);

eruda._inLocalPage =
  ["content://", "file://"].includes(location.origin) ||
  location.pathname.endsWith(".txt");

eruda._initDevTools = new Proxy(eruda._initDevTools, {
  getHeight(node, prop) {
    return Number(getComputedStyle(node)[prop].slice(0, -2));
  },
  eruda_h: 5,
  fixTop() {
    const btn_t = this.getHeight(eruda._entryBtn._$el[0], "top");
    if (window.innerHeight - btn_t < 150) return -2;
    if (this.eruda_h < btn_t + 100) {
      return btn_t + 100 - this.eruda_h;
    } else {
      return 0;
    }
  },
  hookToggle(devTools) {
    const _show = devTools.show;
    devTools.show = (...args) => {
      if (this.eruda_h == 5) return _show.apply(devTools, args);
      const el = devTools._$el[0];
      const resizer = devTools._$el.find(".eruda-resizer")[0];
      const top = this.fixTop();
      if (top > -1 && top + this.eruda_h / 2 < window.innerHeight / 2) {
        el.style.bottom = "";
        el.style.top = top + "px";
        resizer.style.height = "";
      } else {
        el.style.top = "";
        resizer.style.height = "10px";
        if (top > 0 && top < window.innerHeight) {
          el.style.bottom = window.innerHeight - top - this.eruda_h + "px";
        } else {
          el.style.bottom = "";
        }
      }
      return _show.apply(devTools, args);
    };
    const _hide = devTools.hide;
    devTools.hide = (...args) => {
      const el = devTools._$el[0];
      this.eruda_h = this.getHeight(el, "height");
      return _hide.apply(devTools, args);
    };
  },
  typesHooked: false,
  bypassTrustedTypes() {
    if (this.typesHooked) return;
    let stubHTMLPolicy;
    try {
      stubHTMLPolicy = trustedTypes.createPolicy("eruda", {
        createHTML: (s) => s,
      });
    } catch {
      if (typeof Element.prototype.setHTML != "function") return;
    }
    const _insertAdjacentHTML = HTMLElement.prototype.insertAdjacentHTML;
    HTMLDivElement.prototype.insertAdjacentHTML = function (p, t) {
      if (stubHTMLPolicy != undefined) {
        return _insertAdjacentHTML.apply(this, [
          p,
          stubHTMLPolicy.createHTML(t),
        ]);
      } else {
        const div = document.createElement("div");
        div.setHTML(t);
        return this.insertAdjacentElement(p, div.children[0]);
      }
    };
    const _html = eruda._$el.__proto__.html;
    eruda._$el.__proto__.html = function (t) {
      if (stubHTMLPolicy != undefined) {
        return _html.apply(this, [stubHTMLPolicy.createHTML(t)]);
      } else {
        for (const node of this) node.setHTML(t);
      }
    };
    this.typesHooked = true;
    const _enable = eruda.chobitsu.domain("Overlay").enable;
    eruda.chobitsu.domain("Overlay").enable = function () {
      if (_enable.enabled) return;
      _enable.enabled = true;
      _enable.apply(this, arguments);
      const overlay =
        eruda._container.parentNode.querySelector(
          ".__chobitsu-hide__"
        ).shadowRoot;
      const tooltip = overlay.querySelector("div.luna-dom-highlighter > div");
      Object.defineProperty(tooltip, "innerHTML", {
        set(value) {
          if (this.innerHTML == value) return true;
          try {
            this.setHTML(value);
          } catch {
            this.textContent = value;
          }
          return true;
        },
      });
    };
  },
  apply(target, thisArg, args) {
    this.bypassTrustedTypes();
    const result = target.apply(thisArg, args);
    this.hookToggle(eruda._devTools);
    return result;
  },
});

eruda._initStyle = new Proxy(eruda._initStyle, {
  addStyle(id, content) {
    const erudaRoot = eruda._shadowRoot;
    if (erudaRoot.querySelector("style#" + id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.setAttribute("type", "text/css");
    style.textContent = content;
    erudaRoot.append(style);
  },
  apply(target, thisArg, args) {
    let meta = document.querySelector("meta[name='viewport']");
    if (eruda._inLocalPage && !meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "initial-scale=1");
      document.head.prepend(meta);
    }
    const result = target.apply(thisArg, args);
    this.addStyle("new_icons", eruda._styles[1]);
    this.addStyle("dom_fix", eruda._styles[2]);
    this.addStyle("plugin", eruda._styles[3]);
    if (typeof eruda._replaceFont == "undefined") {
      const catchCSP = (e) => {
        if (!e.sourceFile.endsWith("eruda.js")) return;
        e.stopImmediatePropagation();
        if (e.blockedURI == "data" && e.violatedDirective == "font-src") {
          eruda._replaceFont = true;
          this.addStyle("font_fix", eruda._styles[0]);
          document.removeEventListener("securitypolicyviolation", catchCSP);
        } else if (e.blockedURI == "inline" && e.target == eruda._container) {
          document.removeEventListener("securitypolicyviolation", catchCSP);
          throw new Error(
            "Eruda blocked by " + e.effectiveDirective + " " + e.originalPolicy
          );
        }
      };
      eruda._replaceFont = false;
      document.addEventListener("securitypolicyviolation", catchCSP);
    } else if (eruda._replaceFont) {
      this.addStyle("font_fix", eruda._styles[0]);
    }
    return result;
  },
});

class Filter {
  constructor(selector) {
    this._$el = selector;
  }
  #filter = new Array(...ChromeXt.filters);
  #write() {
    ChromeXt.filters.sync(this.#filter);
  }
  add(rule) {
    if (typeof rule == "string") {
      rule = rule.trim();
      if (rule != "" && !this.#filter.includes(rule)) {
        this.#filter.push(rule);
        ChromeXt.filters.push(rule);
      }
    }
  }
  get() {
    return this.#filter;
  }
  remove(rule) {
    this.#filter = this.#filter.filter((item) => item.trim() !== rule);
  }
  new() {
    this.#filter.push("");
  }
  save() {
    this.#filter = [];
    Array.from(this._$el.find(".eruda-filter-item")).forEach((it) =>
      this.#filter.push(it.innerText.trim())
    );
    this.remove("");
    this.#write();
  }
}

function c(str) {
  const prefix = `eruda-`;
  return str
    .trim()
    .split(/\s+/)
    .map((singleClass) => {
      if (singleClass.includes(prefix)) {
        return singleClass;
      }
      return singleClass.replace(/[\w-]+/, (match) => `${prefix}${match}`);
    })
    .join(" ");
}

const s = (spans) =>
  spans
    .map((e) => `<span class="${c("icon-" + e + " " + e)}"></span>`)
    .join("");

eruda.Elements = class extends eruda.Elements {
  constructor() {
    super();
    this._deleteNode = () => {
      const node = this._curNode;
      const selector = this.getSelector(node);
      this._container.get("resources")._filter.add(selector);
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }
  getSelector(el, useSilbling = true) {
    if (document.documentElement === el) return "html";
    let str = el.tagName.toLowerCase();
    if (el.id != "") return str + "#" + el.id;
    let classes = Array.from(el.classList);
    if (classes.length > 0) str += "." + classes.join(".");
    if (classes.length > 1) return str;
    let prev = el.previousSibling;
    if (useSilbling) {
      while (prev instanceof Text) prev = prev.previousSibling;
      if (
        prev instanceof HTMLElement &&
        prev.tagName &&
        (prev.classList.length > 0 || prev.id != "")
      )
        return this.getSelector(prev, false) + " + " + str;
    }
    return this.getSelector(el.parentNode, useSilbling) + " > " + str;
  }
};

eruda.Sources = class extends eruda.Sources {
  _renderDef() {
    if (this._html && this._data) {
      return this._render();
    }
    if (eruda._inLocalPage) {
      this._html = document.body.innerText;
      this._data = { type: "raw", val: this._html };
      return this._renderDef();
    }
    if (this._isGettingHtml) return;
    this._isGettingHtml = true;

    const setData = () => {
      this._data = { type: "html", val: this._html };
      this._isGettingHtml = false;
      return this._renderDef();
    };
    fetch(location.href, { cache: "force-cache", mode: "same-origin" })
      .then((res) => res.text())
      .then((text) => {
        this._html = text;
        setData();
      })
      .catch((e) => {
        console.error(e);
        this._html = "Sorry, unable to fetch source code:(";
        setData();
      });
  }
};

eruda.Resources = class extends eruda.Resources {
  _initTpl() {
    super._initTpl();
    this._$el.prepend(`<div class="${c("section commands")}"></div>`);
    this._$el.prepend(`<div class="${c("section filters")}"></div>`);
    this._$filter = this._$el.find(".eruda-filters.eruda-section");
    this._$command = this._$el.find(".eruda-commands.eruda-section");
    this._filter = new Filter(this._$filter);
  }
  _bindEvent() {
    super._bindEvent();
    this._$el
      .on("click", ".eruda-delete-filter", (e) => {
        const rule = e.curTarget.previousSibling.textContent;
        this._filter.remove(rule);
        this.refreshFilter();
      })
      .on("click", ".eruda-add-filter", () => {
        this._filter.new();
        this.refreshFilter();
        this._$filter.find(".eruda-filter-item").last()[0].focus();
      })
      .on("click", ".eruda-save-filter", () => {
        this._filter.save();
        this.refreshFilter();
        this._container.notify("Filter Saved");
      })
      .on("click", ".eruda-command", (e) => {
        const index = e.curTarget.dataset.index;
        const hide = this._command[index].listener(e);
        if (hide !== false) eruda.hide();
        this.refreshCommand();
      });
  }
  refresh() {
    return super.refresh().refreshFilter().refreshCommand();
  }
  refreshCommand() {
    this._command = ChromeXt.commands.filter((m) => m.enabled);
    const commands = this._command
      .map(function (cmd, index) {
        let title = cmd.title.toString();
        if (typeof cmd.title == "function") {
          title = cmd.title(index);
        }
        return `<span data-index=${index} class="${c("command")}">${title}</span>`;
      })
      .join("");
    this._$command.html(
      `<h2 class="${c("title")}">UserScript Commands</h2>` +
        `<div class="${c("commands")}">${commands}</div>`
    );
    return this;
  }
  refreshFilter() {
    let filterHtml = "<li></li>";
    const filters = this._filter.get();
    const spanItem = `span contenteditable="true" class="${c("filter-item")}"`;
    const spanDel = `span class="${c("icon-delete delete-filter")}"`;
    if (filters.length > 0) {
      filterHtml = filters
        .map((key) => `<li><${spanItem}>${key}</span><${spanDel}></span></li>`)
        .join("");
    }
    const div = (e) =>
      `<div class="${c("btn " + e + "-filter")}">${s([e])}</div>`;
    this._$filter.html(
      `<h2 class="${c("title")}">Cosmetic Filters` +
        div("save") +
        div("add") +
        `</h2><ul>${filterHtml}</ul>`
    );
    return this;
  }
};

eruda.Info = class extends eruda.Info {
  add(name, val, cls = { span: ["copy"] }) {
    if (!Array.isArray(this._infos)) {
      this._infos[name] = { val, cls };
    } else {
      this._infos.push({ name, val, cls });
      this._render();
    }
  }
  _addDefInfo() {
    this._infos = {};
    this.add(
      "UserScripts",
      '<input type="file" multiple id="new_script" accept="text/javascript,application/javascript" style="display:none"/>',
      { li: "userscripts", span: ["add", "eye"] }
    );
    const spanScript = `span class="${c("script")}"`;
    this._infos["UserScripts"].val += ChromeXt.scripts
      .map(
        ({ script }, index) =>
          `<${spanScript} data-index=${index}>${script.name}</span>`
      )
      .join("");
    this.add(
      "User CSP rules",
      ChromeXt.cspRules.length > 0 ? ChromeXt.cspRules.join(" | ") + " | " : "",
      {
        li: "csp-rules",
        span: [ChromeXt.cspRules.length == 0 ? "add" : "save"],
      }
    );
    super._addDefInfo();
    delete this._infos["Backers"];
    this._infos["User Agent"].cls = {
      li: "user-agent",
      span: ["save", "reset"],
    };
    this._infos["About"].val = `<div class="${c("check-update")}">Eruda v${
      eruda.version
    }</div>`;
    this._infos = Object.entries(this._infos).map(([k, v]) => {
      return { name: k, ...v };
    });
    this._infos.splice(2, 2, this._infos[3], this._infos[2]);
    this._render();
    if (ChromeXt.cspRules.length > 0)
      this._$el.find(".eruda-csp-rules > div")[0].contentEditable = true;
  }
  _render() {
    const infos = [];
    this._infos.forEach(({ name, val, cls }) => {
      val = typeof val == "function" ? val() : val;
      let html = {};
      html.li = cls.li ? "li class='" + c(cls.li) + "'" : "li";
      html.h2 = name + s(cls.span);
      infos.push({ name, val, html });
    });
    const html = infos
      .map(
        (info) =>
          `<${info.html.li}><h2 class="${c("title")}">${info.html.h2}</h2>` +
          `<div class="${c("content")}">${info.val}</div></li>`
      )
      .join("");
    this._renderHtml("<ul>" + html + "</ul>");
  }
  _bindEvent() {
    super._bindEvent();
    this._$el.find(".eruda-user-agent > div")[0].contentEditable = true;
    this._$el
      .on("click", ".eruda-user-agent .eruda-icon-save", (e) => {
        this._container.notify("User-Agent config saved");
        e.stopPropagation();
        ChromeXt.dispatch("syncData", {
          origin: window.location.origin,
          name: "userAgent",
          data: this._$el.find(".eruda-user-agent > div").text(),
        });
      })
      .on("click", ".eruda-user-agent .eruda-icon-reset", (_e) => {
        this._container.notify("User-Agent restored");
        ChromeXt.dispatch("syncData", {
          origin: window.location.origin,
          name: "userAgent",
        });
      })
      .on("click", ".eruda-csp-rules .eruda-icon-add", (_e) => {
        this._$el.find(".eruda-csp-rules > h2 > span")[0].className =
          c("icon-save save");
        const editor = this._$el.find(".eruda-csp-rules > div")[0];
        editor.contentEditable = true;
        editor.focus();
      })
      .on("click", ".eruda-csp-rules .eruda-icon-save", (e) => {
        this._container.notify("CSP Rules config saved");
        e.stopPropagation();
        const rules = this._$el.find(".eruda-csp-rules > div").text() || "";
        ChromeXt.cspRules.sync(rules.split(" | ").filter((r) => r.length > 0));
      })
      .on("click", ".eruda-userscripts .eruda-script", (e) => {
        const sources = this._container.get("sources");
        if (!sources) return;
        const index = e.curTarget.dataset.index;
        sources.set("object", ChromeXt.scripts[index].script);
        this._container.showTool("sources");
      })
      .on("click", ".eruda-userscripts .eruda-add", (_e) => {
        this._$el.find("#new_script")[0].click();
      })
      .on("click", ".eruda-userscripts .eruda-icon-eye", (_e) => {
        window.open("https://jingmatrix.github.io/ChromeXt/");
      })
      .on("click", ".eruda-check-update", (_e) => {
        ChromeXt.dispatch("updateEruda");
      })
      .on("change", "#new_script", (e) => {
        Array.from(e.curTarget.files).forEach((f) => {
          if (f.name.endsWith(".user.js")) {
            f.text().then((s) => {
              ChromeXt.dispatch("installScript", s);
              this._container.notify("Installing " + f.name);
            });
          } else {
            this._container.notify(f.name + " is not a UserScript file.");
          }
        });
      });
  }
};

if (typeof define == "function" && define.amd === false) define.amd = true;
eruda.init();
eruda.show();

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\extension.js

extension.tabUrl == extension.tabUrl ||
  "https://jingmatrix.github.io/ChromeXt/";
const StubChrome = extension.tabUrl + "StubChrome.js";

const imports = await import(StubChrome);
globalThis.chrome = imports.chrome;

class ChromeEvent extends imports.StubEvent {
  #listeners = [];
  constructor(target, event) {
    super();
    this.target = target;
    this.event = event;
  }
  addListener(f) {
    const l = (e) => f(e.detail);
    this.#listeners.push([f, l]);
    this.target.addEventListener(this.event, l);
  }
  removeListener(f) {
    const index = this.#listeners.findIndex((i) => i[0] == f);
    if (index != -1) {
      const l = this.#listeners[index][1];
      this.#listeners.splice(index, 1);
      this.target.removeEventListener(this.event, l);
    }
  }
  hasListener(f) {
    const index = this.#listeners.findIndex((i) => i[0] == f);
    return index != -1;
  }
  dispatch(detail) {
    this.target.dispatchEvent(new CustomEvent(this.event, { detail }));
  }
}

Object.keys(chrome).forEach((key) => {
  const domain = chrome[key];
  const keys = Object.keys(domain);
  const events = keys
    .filter((k) => domain[k].__proto__.constructor == imports.StubEvent)
    .map((k) => k.substring(2));
  const properties = keys
    .filter((k) => k.startsWith("set"))
    .map((k) => k.substring(3));
  if (events.length > 0) {
    chrome[key] = new EventTarget();
    const t = chrome[key];
    Object.assign(t, domain);
    events.forEach((e) => {
      t["on" + e] = new ChromeEvent(t, e);
    });
  }
  if (properties.length > 0) {
    chrome[key]._props = new Map();
    const props = chrome[key]._props;
    properties.forEach((k) => {
      chrome[key]["set" + k] = (v) => props.set(k, v);
      chrome[key]["get" + k] = () => props.get(k);
    });
  }
});

chrome.runtime.getManifest = () => extension;
chrome.runtime.id = extension.id;
chrome.runtime.getURL = (path) => location.origin + "/" + path;

async function fetch_locale(locales) {
  while (locales.length > 0) {
    const locale = locales.pop();
    try {
      const res = await fetch("/_locales/" + locale + "/messages.json");
      chrome.i18n.locale = locale;
      chrome.i18n.messages = await res.json();
      break;
    } catch {}
  }
}
await fetch_locale([
  extension.default_locale,
  navigator.language.substring(0, 2),
  navigator.language,
]);

chrome.i18n.getMessage = (name) => chrome.i18n.messages[name] || "";

// Restore the original HTML elements
const parser = new DOMParser();
const doc = parser.parseFromString(extension.html, "text/html");
const inFrame = typeof Symbol.ChromeXt == "undefined";
document.head.remove();
document.documentElement.prepend(doc.head);
doc.querySelectorAll("script").forEach((node) => {
  const script = document.createElement("script");
  script.src = node.src;
  if (typeof node.type == "string") {
    script.type = node.type;
  }
  document.body.append(script);
});

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\GM.js

const globalThis = GM.globalThis;
const window = GM.globalThis;
const self = GM.globalThis;
const parent = GM.globalThis;
const frames = GM.globalThis;
const top = GM.globalThis;
delete GM.globalThis;
// Override possible references to the original window object.
// Note that from the DevTools console, these objects are undefined if they are not used in the script debugging context.
// However, one can break this jail using setTimeout or Function.
delete GM_info.script.code;
delete GM_info.script.sync_code;
delete GM.key;
delete GM.name;
Object.freeze(GM_info.script);
const ChromeXt = GM.ChromeXt;
if (typeof GM_xmlhttpRequest == "function" && !GM_xmlhttpRequest.strict) {
  GM_xmlhttpRequest.addCookie = GM_info.script.grants.includes("GM_cookie");
  Object.defineProperty(GM_xmlhttpRequest, "strict", { value: true });
}
// Kotlin separator

function GM_addStyle(css) {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.textContent = css;
  try {
    (document.head || document.documentElement).appendChild(style);
  } catch {
    setTimeout(() => {
      document.head.appendChild(style);
    });
  }
  return style;
}
// Kotlin separator

const unsafeWindow = window;
// Kotlin separator

const GM_log = console.info.bind(
  console,
  GM_info.script.id.split(":").at(-1) + ":"
);
// Kotlin separator

function GM_notification(details, ondone) {
  let payload = {};
  if (typeof details == "object") {
    payload = { ...details, ondone };
  } else {
    const props = ["text", "title", "image", "onclick", "timeout", "ondone"];
    props.splice(arguments.length, props.length);
    props.forEach((prop, index) => (payload[prop] = arguments[index]));
  }
  const ChromeXt = LockedChromeXt.unlock(key);
  if (Number.isInteger(payload.timeout)) {
    setTimeout(() => {
      if (typeof payload.ondone == "function") payload.ondone("timeout");
      if (typeof listener == "function")
        ChromeXt.removeEventListener("notification", listener);
    }, payload.timeout);
  } else {
    payload.timeout = 10000;
  }
  if (!("text" in payload || payload.highlight))
    throw TypeError("Parameter text not given");
  let onclick;
  if (typeof payload.onclick == "function") {
    onclick = payload.onclick.bind(
      typeof details == "object" ? details : payload
    );
    payload.onclick = true;
  } else {
    delete payload.onclick;
  }
  payload.id = GM_info.script.id;
  payload.uuid = Math.floor(Math.random() * 2 ** 16);
  if (payload.onclick || typeof payload.ondone == "function") {
    function listener(e) {
      const data = e.detail;
      if (!(e.type == "notification" && data.id == payload.id)) return;
      if (data.uuid == payload.uuid) {
        e.stopImmediatePropagation();
        ChromeXt.removeEventListener("notification", listener);
        if (payload.onclick) onclick();
        if (typeof payload.ondone == "function") {
          payload.ondone("click");
          delete payload.ondone;
        }
      }
    }
    ChromeXt.addEventListener("notification", listener);
  }
  ChromeXt.dispatch("notification", payload);
}
// Kotlin separator

const GM_cookie = new (class CookieManager {
  #cache = [];
  get store() {
    return this.#cache;
  }
  #command(method, params) {
    const uuid = Math.random();
    const payload = { method, params, uuid, id: GM_info.script.id };
    const ChromeXt = LockedChromeXt.unlock(key);
    const self = this;
    return new Promise((resolve, reject) => {
      function listener(e) {
        const data = e.detail;
        if (!(e.type == "cookie" && data.id == payload.id)) return;
        const response = data.response.find((r) => r.id === 2);
        if (data.method == "Network.getCookies" && "result" in response)
          self.#cache = response.result.cookies.map(
            (it) => new CookieParam(it)
          );
        if (data.uuid == uuid) {
          if (typeof response != "object")
            reject(new TypeError(`Response not found for ${data.method}`));
          if ("error" in response)
            reject(new TypeError("CDP Error: " + response.error.message));
          ChromeXt.removeEventListener("cookie", listener);
          resolve(response.result);
        }
      }
      ChromeXt.addEventListener("cookie", listener);
      ChromeXt.dispatch("cookie", payload);
    });
  }
  export(url = location.origin, store, httpOnly = false) {
    const cookies = store || this.store;
    if (!Array.isArray(cookies)) return;
    if (typeof url == "string") {
      url = new URL(url);
    } else if (!(url instanceof URL)) {
      return;
    }
    if (cookies == this.store && url.origin != location.origin) return;
    return cookies
      .map((it) => (it instanceof CookieParam ? it : new CookieParam(it)))
      .filter((it) => it.match(url, httpOnly))
      .map((cookie) => cookie.toHeader());
  }
  async list(details = { url: window.origin }, callback) {
    let cookies, error;
    try {
      if (typeof details != "object") throw TypeError("Invalid parameters");
      await this.#command("Network.getCookies", [
        details.url || location.origin,
      ]);
      const props = ["domain", "name", "path"].filter((key) => key in details);
      if (props.length == 0) {
        cookies = this.#cache;
      } else {
        cookies = this.#cache.filter((item) => {
          for (const prop of props) {
            if (item[prop] !== details[prop]) return false;
          }
          return true;
        });
      }
    } catch (e) {
      error = e;
    }
    if (typeof callback == "function") callback(cookies, error?.message);
    if (error instanceof Error) throw error;
    return cookies;
  }
  async #dispatch(method, details, callback) {
    if (typeof callback == "function") {
      let error, result;
      try {
        result = await this.#command(method, details);
      } catch (e) {
        error = e;
      }
      callback(error?.message);
      if (error instanceof Error) throw error;
      return result;
    } else {
      return this.#command(method, details);
    }
  }
  set(details, callback) {
    let cookies = details;
    if (!Array.isArray(cookies)) cookies = [details];
    for (const cookie of cookies) {
      if (typeof cookie.expirationDate == "number") {
        cookie.expires = cookie.expirationDate;
        delete cookie.expirationDate;
      }
      if (cookie.domain == undefined) cookie.domain = window.location.hostname;
    }
    return this.#dispatch("Network.setCookies", { cookies }, callback);
  }
  delete(details, callback) {
    if (details.domain == undefined && details.url == undefined)
      details.domain = window.location.hostname;
    return this.#dispatch("Network.deleteCookies", details, callback);
  }
})();

class CookieParam {
  #header;
  constructor(data) {
    if (
      typeof data == "object" &&
      typeof data.name == "string" &&
      "value" in data
    ) {
      Object.assign(this, data);
      if (typeof this.header == "string") {
        this.#header = this.header;
        delete this.header;
      }
    } else {
      throw TypeError("Invalid parameters for cookie");
    }
  }
  static fromHeader(str, url) {
    const props = str
      .split(";")
      .map((it) => it.trim())
      .filter((it) => it.length > 0);
    const defn = props.shift().split("=");
    if (defn.length < 2) return;
    const cookie = new CookieParam({
      name: defn.shift(),
      value: defn.join("="),
      header: str,
    });
    props.forEach((prop) => {
      const parts = prop.split("=");
      const key = parts.shift().toLowerCase();
      var value = parts.join("=");
      if (key === "expires") {
        cookie.expires = new Date(value).getTime() / 1000;
      } else if (key === "max-age") {
        cookie.maxAge = Number(value);
        cookie.expires = cookie.maxAge + new Date().getTime() / 1000;
      } else if (key === "secure") {
        cookie.secure = true;
      } else if (key === "httponly") {
        cookie.httpOnly = true;
      } else {
        cookie[key] = value;
      }
    });
    cookie.url = url;
    cookie.session = cookie.expires == -1;
    return cookie;
  }
  /** @param {URL} url */
  set url(url) {
    if (!(url instanceof URL)) url = new URL(url || location.origin);
    this.domain = this.domain || url.hostname;
    if (url.port.length != 0) {
      this.sourcePort = Number(url.port);
    } else if (url.protocol == "https:") {
      this.sourcePort = 443;
    } else if (url.protocol == "http:") {
      this.sourcePort = 80;
    }
    if (url.protocol.endsWith("s:")) this.sourceScheme = "Secure";
  }
  httpOnly = false;
  path = "/";
  secure = false;
  expires = -1;
  priority = "Medium";
  sourceScheme = "NonSecure";
  capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
  }
  toHeader() {
    if (typeof this.#header == "string") return this.#header;
    let header = [this.name + "=" + this.value];
    header.push(`Domain=${this.domain}`);
    if (Number.isFinite(this.maxAge) && this.maxAge > 0) {
      header.push(`Max-Age=${this.maxAge}`);
    }
    if (Number.isFinite(this.expires) && this.expires != -1) {
      const date = new Date();
      date.setTime(this.expires * 1000);
      header.push(`expires=${date.toUTCString()}`);
    }
    const props = ["path", "sameSite", "httpOnly", "secure"];
    for (const prop of props) {
      if (!(prop in this)) continue;
      const val = this[prop];
      if (typeof val == "string" && val.length != 0) {
        header.push(this.capitalize(prop) + `=${this.capitalize(val)}`);
      } else if (val === true) {
        header.push(this.capitalize(prop));
      }
    }
    return header.join("; ");
  }
  match(url, httpOnly) {
    if (!(url instanceof URL)) url = new URL(url);
    if (httpOnly && this.httpOnly !== true) return false;
    if ("path" in this && !url.pathname.startsWith(this.path)) return false;
    if ("domain" in this) {
      let domain = this.domain;
      if (domain.startsWith(".")) domain = domain.slice(1);
      if (!url.hostname.endsWith(domain)) return false;
    }
    const expires = this.expirationDate || this.expires;
    if (expires > 0) return expires * 1000 > new Date().getTime();
    return true;
  }
}
// Kotlin separator

function GM_setClipboard(text, info = { type: "text" }) {
  const type = info?.mimetype || info?.type || info;
  if (typeof info != "object" && typeof type == "string") info = { type };
  info.type = info.type || info.mimetype;
  info.text = text;
  info.label = `GM_setClipboard by ${GM_info.script.id}`;
  if (info.type == "html" && !("htmlText" in info)) info.htmlText = info.text;
  LockedChromeXt.unlock(key).dispatch("copy", info);
}
// Kotlin separator

function GM_removeValueChangeListener(index) {
  GM_info.valueListener[index].enabled = false;
}
// Kotlin separator

function GM_unregisterMenuCommand(index) {
  LockedChromeXt.unlock(key).commands[index].enabled = false;
}
// Kotlin separator

function GM_addElement() {
  // arguments: parent_node, tag_name, attributes
  if (arguments.length == 2) {
    arguments = [document.head, arguments[0], arguments[1]];
  }
  if (arguments.length != 3) {
    return;
  }
  const element = document.createElement(arguments[1]);
  for (const [key, value] of Object.entries(arguments[2])) {
    if (key != "textContent") {
      element.setAttribute(key, value);
    } else {
      element.textContent = value;
    }
  }
  try {
    arguments[0].appendChild(element);
  } catch {
    setTimeout(() => {
      document.head.appendChild(element);
    }, 0);
  }
  return element;
}
// Kotlin separator

function GM_download(details) {
  if (arguments.length == 2) {
    details = { url: arguments[0], name: arguments[1] };
  }
  return GM_xmlhttpRequest({
    ...details,
    responseType: "blob",
    onload: (res) => {
      if (res.status !== 200)
        return console.error("Error loading: ", details.url, res);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(res.response);
      link.download =
        details.name ||
        details.url.split("#").shift().split("?").shift().split("/").pop();
      link.dispatchEvent(new MouseEvent("click"));
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    },
  });
}
// Kotlin separator

function GM_openInTab(url, options = true) {
  let target = "GM_openInTab";
  if (typeof options == "boolean") {
    options = { active: !options };
  }
  if (options.setParent) target = "_self";
  const gm_window = window.open(url, target);
  if (!gm_window) return window;
  if (options.active) {
    gm_window.focus();
  } else {
    gm_window.blur();
    window.focus();
  }
  return gm_window;
}
// Kotlin separator

function GM_registerMenuCommand(title, listener, _accessKey = "Dummy") {
  const ChromeXt = LockedChromeXt.unlock(key);
  const index = ChromeXt.commands.findIndex(
    (e) => e.id == GM_info.script.id && e.title == title
  );
  if (index != -1) {
    ChromeXt.commands[index].listener = listener;
    return index;
  }
  ChromeXt.commands.push({
    id: GM_info.script.id,
    title,
    listener,
    enabled: true,
  });
  return ChromeXt.commands.length - 1;
}
// Kotlin separator

function GM_addValueChangeListener(key, listener) {
  const index = GM_info.valueListener.findIndex(
    (e) => e.key == key && e.listener == listener
  );
  if (index != -1) {
    GM_info.valueListener[index].enabled = true;
    return index;
  }
  GM_info.valueListener.push({ key, listener, enabled: true });
  return GM_info.valueListener.length - 1;
}
// Kotlin separator

function GM_setValue(key, value) {
  GM_info.storage[key] = value;
}
// Kotlin separator

function GM_deleteValue(key) {
  delete GM_info.storage[key];
}
// Kotlin separator

function GM_getValue(key, default_value) {
  return key in GM_info.storage ? GM_info.storage[key] : default_value;
}
// Kotlin separator

function GM_listValues() {
  return Object.keys(GM_info.storage);
}
// Kotlin separator

function GM_getResourceText(name) {
  return (
    GM_info.script.resources.find((it) => it.name == name).content ||
    "ChromeXt failed to find resource " + name
  );
}
// Kotlin separator

function GM_getResourceURL(name) {
  return (
    GM_info.script.resources.find((it) => it.name == name).url ||
    "ChromeXt failed to find resource " + name
  );
}
// Kotlin separator

function GM_xmlhttpRequest(details) {
  if (typeof details == "string") {
    details = new Request(...arguments);
    if (arguments.length == 2) details.data = arguments[1].body;
  }
  if (details instanceof Request) {
    details.fetch = true;
  }

  if (!details.url) {
    throw new Error("GM_xmlhttpRequest requires a URL.");
  } else if (GM_xmlhttpRequest.strict) {
    const domain = new URL(details.url).hostname;
    const connects = GM_info.script.connects;
    let allowed = location.hostname == domain && connects.includes("self");
    if (!allowed && connects.includes("*")) allowed = true;
    if (!allowed) {
      connects.forEach((it) => {
        if (domain.endsWith(it)) allowed = true;
      });
    }
    if (!allowed) {
      console.error("Connection to", domain, "is not declared using @connect");
      return;
    }
  }
  const uuid = Math.random();
  const fallback_method = typeof details.data == "undefined" ? "GET" : "POST";
  details.method = details.method
    ? details.method.toUpperCase()
    : fallback_method;
  if (["GET", "HEAD"].includes(details.method)) {
    delete details.data;
    delete details.body;
  }

  let useJSFetch = true;
  if (typeof details.forceCORS == "boolean") useJSFetch = !details.forceCORS;
  details.headers = new Headers(details.headers || {});

  async function prepare(details) {
    if (details instanceof Request && details.method != "GET") {
      details.data = details.data || (await details.blob());
    }

    if (details.data instanceof FormData) {
      if (details.binary !== true)
        for (const value of details.data.values())
          if (value instanceof Blob) {
            details.binary = true;
            break;
          }
      if (!details.binary) {
        const form = Array.from(details.data.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join("&");
        if (details.method == "GET") {
          if (!details.url.includes("?"))
            details.url += "?" + encodeURIComponent(form);
        } else {
          details.headers.set(
            "Content-Type",
            "application/x-www-form-urlencoded"
          );
          details.data = form;
        }
      } else {
        const parts = [];
        const formboundary =
          "------WebKitFormBoundary" +
          Math.random().toString(36).slice(2, 10).toUpperCase() +
          Math.random().toString(36).slice(2, 10).toUpperCase();
        details.headers.set(
          "Content-Type",
          "multipart/form-data; boundary=" + formboundary.slice(2)
        );
        for (const [k, v] of details.data.entries()) {
          parts.push(formboundary);
          let disposition = `Content-Disposition: form-data; name="${k}"`;
          if (v instanceof Blob) {
            details.binary = true;
            const name = v.name || "blob";
            const type = v.type || "unknown";
            disposition += `; filename="${name}"`;
            parts.push(disposition);
            parts.push(`Content-Type: ${type}`);
            parts.push("");
            const binary = new Uint8Array(await v.arrayBuffer());
            parts.push(binary);
          } else {
            parts.push(disposition);
            parts.push("");
            parts.push(v);
          }
        }
        parts.push(formboundary + "--");
        const blob = [];
        parts.forEach((d) => blob.push(d, "\r\n"));
        details.data = new Blob(blob);
      }
    }

    if (
      details.data &&
      typeof details.data != "string" &&
      details.method != "GET" &&
      details.binary !== true
    ) {
      details.binary = true;
    }

    if ("data" in details && details.binary === true) {
      if (Array.isArray(details.data)) details.data = new Blob(details.data);
      switch (details.data.constructor) {
        case DataView:
          details.data = new Blob([details.data]);
        case File:
        case Blob:
          details.data = await details.data.arrayBuffer();
        case ArrayBuffer:
          details.data = new Uint8Array(details.data);
        case Uint8Array:
          details.data = btoa(
            Array.from(details.data, (x) => String.fromCodePoint(x)).join("")
          );
          break;
      }
    }

    if (
      details.headers instanceof Headers &&
      !details.headers.has("User-Agent")
    ) {
      details.headers.set("User-Agent", window.navigator.userAgent);
    }

    const buffersize = details.buffersize;
    if (Number.isInteger(buffersize) && buffersize > 0 && buffersize < 256) {
      details.buffersize = buffersize;
    } else {
      details.buffersize = 8;
    }
  }

  const ChromeXt = LockedChromeXt.unlock(key);
  function revoke(listener) {
    ChromeXt.removeEventListener("xmlhttpRequest", listener);
  }

  const xhrHandler = {
    target: new EventTarget(),
    get() {
      const prop = arguments[1];
      if (prop in Promise.prototype && this.promise instanceof Promise) {
        return this.promise[prop].bind(this.promise);
      } else if (prop in EventTarget.prototype) {
        return this.target[prop].bind(this.target);
      } else if (
        prop.startsWith("on") ||
        [
          "responseType",
          "overrideMimeType",
          "url",
          "timeout",
          "fetch",
        ].includes(prop)
      ) {
        return details[prop];
      } else {
        return Reflect.get(...arguments);
      }
    },
    set(target, prop, value) {
      if (
        prop == "responseHandler" &&
        !(this.promise instanceof Promise) &&
        typeof value == "function"
      ) {
        this.promise = target;
        value(this.resolve, this.reject);
        return true;
      }
      if (prop in Promise.prototype || prop in EventTarget.prototype)
        return false;
      target[prop] = value;
      if (prop == "readyState")
        this.target.dispatchEvent(new Event("readystatechange"));
      return true;
    },
  };
  const xhr = new Proxy(
    new Promise((resolve, reject) => {
      xhrHandler.resolve = resolve;
      xhrHandler.reject = reject;
    }),
    xhrHandler
  );

  xhr.responseHandler = async (resolve, reject) => {
    const sink = new ResponseSink(xhr);

    function listener(e) {
      let data, type;
      if (arguments.length > 1) {
        data = arguments[0];
        type = arguments[1];
      } else if (e.detail.id == GM_info.script.id && e.detail.uuid == uuid) {
        e.stopImmediatePropagation();
        data = e.detail.data;
        type = e.detail.type;
      } else {
        return;
      }
      sink.parse(data);
      if (type == "progress") {
        sink.writer.write(data);
      } else if (type == "redirect" && xhr.redirect == "error") {
        xhr.error = new Error("Redirection not allowed");
        sink.dispatch("error");
        xhr.abort("redirect");
      } else if (type == "load") {
        sink.writer
          .close()
          .then(() => resolve(xhr.response))
          .catch((error) => {
            // error might be caused by abort
            if (error instanceof Error) {
              reject(
                new TypeError("Fail to parse response data: " + error.message, {
                  cause: error,
                })
              );
            }
          });
      } else if (["timeout", "error"].includes(type)) {
        const writer = sink.writer; // To dispatch loadstart event
        const cause = new Error(data.message);
        cause.stack = data.stack;
        const error = new Error(
          [data.status, data.statusText].filter((e) => e).join(", "),
          {
            cause,
          }
        );
        error.name = data.type;
        xhr.error = error;
        xhr.response = data.error;
        delete xhr.stack;
        delete xhr.type;
        if (xhr.response != undefined) {
          writer
            .close()
            .then(() => xhr.abort(type))
            .catch((e) => reject(e));
        } else {
          xhr.abort(type);
        }
      }
    }

    xhr.abort = (type = "abort") => {
      ChromeXt.dispatch("xmlhttpRequest", {
        uuid,
        abort: true,
      });
      revoke(listener);
      if (xhr.error instanceof Error) reject(xhr.error);
      sink.writer.abort(type);
    };

    let request = details;
    if (
      !details.signal &&
      Number.isInteger(details.timeout) &&
      details.timeout > 0
    ) {
      details.signal = AbortSignal.timeout(details.timeout);
    }
    if (details instanceof Request) {
      request = details;
    } else if (useJSFetch) {
      request = new Request(details.url, {
        cache: "force-cache",
        body: details.data,
        ...details,
        credentials: details.anonymous == true ? "omit" : "include",
        headers: {},
      });
      for (const p of details.headers) {
        request.headers.set(...p);
        if (request.headers.get(p[0]) !== p[1]) {
          useJSFetch = false;
          break;
        }
      }
    }

    xhr.binaryType = ["arraybuffer", "blob", "stream"].includes(
      xhr.responseType
    );
    xhr.readyState = 1;

    if (useJSFetch) {
      request.signal.addEventListener("abort", xhr.abort);
      await fetch(request)
        .then(async (response) => {
          const teedOff = response.body.tee();
          const res = new Response(teedOff[0], response);
          const localRes = new Response(teedOff[1], response);
          if (xhr.fetch) {
            sink.dispatch("loadstart", res);
            sink.dispatch("progress", res);
            let type = xhr.responseType || "text";
            if (type == "arraybuffer") type = "arrayBuffer";
            if (type in localRes) {
              resolve(await localRes[type]());
            } else {
              resolve(res);
            }
            sink.dispatch("load", res);
            sink.dispatch("loadend", res);
            return;
          }
          res.binary = xhr.binaryType;
          if (!res.binary) {
            res.chunk = await localRes.text();
            listener(res, "progress");
          } else {
            const reader = localRes.body.getReader();
            while (true) {
              const result = await reader.read();
              if (result.done) break;
              res.chunk = result.value;
              listener(res, "progress");
            }
            reader.cancel();
          }
          listener(res, "load");
        })
        .catch((e) => {
          if (!(e instanceof TypeError)) {
            sink.writer.abort("error");
            reject(e);
          } else {
            useJSFetch = false;
          }
        });
    }

    if (!useJSFetch) {
      await prepare(details);
      if (details instanceof Request) {
        request = {};
        for (const key in details) request[key] = details[key];
      } else {
        request = details;
      }
      if (details.headers instanceof Headers)
        request.headers = Object.fromEntries(details.headers);

      const origin = new URL(details.url).origin;
      if (
        location.origin == origin &&
        GM_xmlhttpRequest.addCookie &&
        !("cookie" in details) &&
        details.anonymous !== true
      ) {
        if (GM_cookie.store.length == 0) {
          await GM_cookie.list();
        }
        request.cookie = GM_cookie.export(details.url);
        GM_xmlhttpRequest.addCookie = false;
      }
      if (typeof request.cookie == "string") {
        request.cookie = request.cookie.split("; ");
      }

      if (!Array.isArray(request.cookie)) delete request.cookie;
      if (request.method == "HEAD") request.redirect = "manual";
      ChromeXt.dispatch("xmlhttpRequest", {
        id: GM_info.script.id,
        request,
        uuid,
      });
      ChromeXt.addEventListener("xmlhttpRequest", listener);
    }
  };

  return xhr;
}

class ResponseSink {
  #writer;
  xhr;
  get writer() {
    if (!this.#writer) this.#writer = new WritableStream(this).getWriter();
    return this.#writer;
  }
  constructor(xhr) {
    this.xhr = xhr;
    // this.xhr.readyState = 0;
    this.xhr.status = 0;
  }
  dispatch(type, data) {
    const event = new ProgressEvent(type, this.xhr);
    this.xhr.dispatchEvent(event);
    if (typeof this.xhr["on" + type] == "function") {
      this.xhr["on" + type](data || { ...this.xhr });
    }
  }
  static async prepare(type, data) {
    if ([101, 204, 205, 304].includes(data.status)) {
      data.response = null;
    }
    if (data.binaryType) {
      if (typeof data.response == "string") data.response = [data.response];
      const blob = new Blob(data.response, { type });
      switch (data.responseType) {
        case "arraybuffer":
          data.response = await blob.arrayBuffer();
          break;
        case "blob":
          data.response = blob;
          break;
        case "stream":
          data.response = blob.stream();
          break;
      }
    } else {
      if (Array.isArray(data.response)) {
        let charset = type.split(";").filter((it) => it.includes("charset="));
        if (charset.length != 0) {
          charset = charset[0].trim().substring(8).toLowerCase();
        } else {
          charset = "utf-8";
        }
        const decoder = new TextDecoder(charset);
        const blob = new Blob(data.response);
        data.response = decoder.decode(await blob.arrayBuffer());
      }
      data.responseText = data.response;
      if (data.responseType == "json") {
        data.response = JSON.parse(data.responseText);
      } else if (data.responseType == "document") {
        const parser = new DOMParser();
        data.response = parser.parseFromString(
          data.responseText,
          type == "text/xml" ? "text/xml" : "text/html"
        );
        data.responseXML = data.response;
      }
    }
    if (data.fetch) data.response = new Response(data.response, data);
  }
  parse(data) {
    if (typeof data != "object") return;
    for (const prop in data) {
      if (prop == "headers" || prop == "status") continue;
      const val = data[prop];
      if (typeof val == "function") continue;
      this.xhr[prop] = val;
    }
    if (this.xhr.status == data.status) return;
    // status change if there are redirections

    this.xhr.status = data.status;

    let headers = data.headers;
    if (!(headers instanceof Headers)) {
      const entries = Object.entries(headers);
      headers = new Headers();
      entries.forEach(([k, vs]) => {
        for (const v of vs) headers.append(k, v);
      });
    }
    this.xhr.headers = headers;
    this.xhr.readyState = 2;
    const responseHeaders = Object.entries(Object.fromEntries(headers))
      .map(([k, v]) => k.toLowerCase() + ": " + v)
      .join("\r\n");
    this.xhr.responseHeaders = responseHeaders;
    this.xhr.getAllResponseHeaders = () => responseHeaders;
    this.xhr.getResponseHeader = (headerName) => headers.get(headerName);
    this.xhr.finalUrl = headers.get("Location") || this.xhr.url;
    this.xhr.responseURL = this.xhr.finalUrl;
    this.xhr.total = headers.get("Content-Length");
    if (this.xhr.total !== null) {
      this.xhr.lengthComputable = true;
      this.xhr.total = Number(this.xhr.total);
    }
    if (this.xhr.finalUrl != this.xhr.url && this.xhr.redirect != "error")
      this.dispatch("redirect", { ...this.xhr });
    if (data instanceof Response) return;
    const encoding = headers.get("Content-Encoding");
    if (encoding != null) {
      try {
        this.ds = new DecompressionStream(encoding.toLowerCase());
      } catch {
        this.xhr.abort();
      }
    }
  }
  start(_controller) {
    this.dispatch("loadstart");
    if (this.xhr.readyState == 2) this.xhr.readyState = 3;
    this.xhr.response = this.xhr.binary ? [] : "";
    this.xhr.loaded = 0;
  }
  write(data, _controller) {
    let chunk = data.chunk;
    if (chunk == undefined) return;
    if (this.xhr.binary) {
      if (!(data instanceof Response) && typeof chunk == "string")
        chunk = Uint8Array.from(atob(chunk), (m) => m.codePointAt(0));
      this.xhr.response.push(chunk);
    } else {
      this.xhr.response += chunk;
    }
    this.xhr.loaded += data.bytes || chunk.length;
    this.dispatch("progress");
  }
  async close(_controller) {
    if (this.#writer == undefined) return;
    const type =
      this.xhr.overrideMimeType ||
      this.xhr.headers.get("Content-Type") ||
      "text/xml";
    if (
      Array.isArray(this.xhr.response) &&
      this.xhr.response.length != 0 &&
      this.ds instanceof DecompressionStream
    ) {
      const stream = new Blob(this.xhr.response, { type })
        .stream()
        .pipeThrough(this.ds);
      this.xhr.response = [];
      const reader = stream.getReader();
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        this.xhr.response.push(result.value);
      }
      reader.cancel();
    }
    this.xhr.readyState = 4;
    let parseError;
    try {
      await ResponseSink.prepare(type, this.xhr);
    } catch (e) {
      this.xhr.error = e;
      parseError = e;
    }
    this.dispatch("load");
    this.dispatch("loadend");
    if (parseError instanceof Error) throw parseError;
  }
  abort(reason) {
    this.dispatch(reason);
    this.dispatch("loadend");
  }
}
// Kotlin separator

GM.bootstrap = () => {
  delete GM.bootstrap;
  const ChromeXt = LockedChromeXt.unlock(key);
  if (ChromeXt.scripts.findIndex((e) => e.script.id == GM_info.script.id) != -1)
    return;

  const row = /\/\/\s+@(\S+)\s+(.+)/g;
  const meta = GM_info.script;
  if (typeof meta.code != "function" && typeof ChromeXt != "undefined") {
    return;
  }
  let match;
  while ((match = row.exec(GM_info.scriptMetaStr.trim())) !== null) {
    if (meta[match[1]]) {
      if (typeof meta[match[1]] == "string") meta[match[1]] = [meta[match[1]]];
      meta[match[1]].push(match[2]);
    } else meta[match[1]] = match[2];
  }
  for (const it of [
    "include",
    "match",
    "exlcude",
    "require",
    "grant",
    "connect",
    "resource",
  ]) {
    const plural = it.endsWith("h") ? it + "es" : it + "s";
    meta[plural] = typeof meta[it] == "string" ? [meta[it]] : meta[it] || [];
    if (it != "resource") Object.freeze(meta[plural]);
    delete meta[it];
  }
  meta.resources = meta.resources.map((res) => {
    const split = res.split(/\s+/).filter((it) => it.length > 0);
    const data = { name: split[0], url: split[1] };
    const integrity = data.url.split("#");
    if (integrity.length > 1) data.url = integrity[0];
    return data;
  });

  meta["run-at"] = Array.isArray(meta["run-at"])
    ? meta["run-at"][0]
    : meta["run-at"] || "document-idle";

  const grants = meta.grants;

  if (meta["inject-into"] == "page" || grants.includes("none")) {
    GM.globalThis = window;
    if (grants.includes("window.close")) {
      // The page may abuse window.close
      window.close = () => ChromeXt.dispatch("close");
    }
  } else {
    const handler = {
      // A handler to block access to globalThis
      window: { GM },
      libLoading: meta.requires.length > 0,
      keys: Array.from(ChromeXt.globalKeys),
      deleteProperty(_target, prop) {
        if (this.libLoading && prop == "__loading__") {
          this.libLoading = false;
          if (prop in this.window) return;
        }
        return delete this.window[prop];
      },
      set(target, prop, value) {
        if (target[prop] != value || target.propertyIsEnumerable(prop)) {
          // Avoid redefining global non-enumerable classes, though they are accessible to the getter
          this.window[prop] = value;
        }
        if (this.libLoading) Reflect.set(...arguments);
        return true;
      },
      get(target, prop, receiver) {
        if (target[prop] == target) return receiver;
        // Block possible jail break
        if (prop == "close" && grants.includes("window.close")) {
          return () => ChromeXt.dispatch("close");
        } else if (this.keys.includes(prop)) {
          const val = target[prop];
          return typeof val == "function" ? val.bind(target) : val;
        } else if (
          typeof target[prop] != "undefined" &&
          !target.propertyIsEnumerable(prop)
        ) {
          // Should never change the binding property of global non-enumerable classes
          return Reflect.get(...arguments);
        } else {
          return this.window[prop];
        }
      },
    };
    if (grants.includes("unsafeWindow"))
      handler.window.unsafeWindow = unsafeWindow;
    GM.globalThis = new Proxy(window, handler);
  }

  GM_info.uuid = Math.random();
  const storageHandler = {
    storage: GM_info.storage || {},
    broadcast: grants.includes("GM_addValueChangeListener"),
    payload: {
      id: meta.id,
      uuid: GM_info.uuid,
    },
    cache: new Set(),
    sync(data) {
      let broadcast = this.broadcast;
      if ("broadcast" in data && !data.broadcast) {
        broadcast = false;
        delete data.broadcast;
      }
      const payload = { data, broadcast, ...this.payload };
      if (broadcast) {
        ChromeXt.post("scriptStorage", payload);
      }
      ChromeXt.dispatch("scriptStorage", payload);
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      this.sync({ key });
      return result;
    },
    set(target, key, value) {
      target[key] = value;
      this.sync({ key, value });
      return true;
    },
    async_get(key, default_value) {
      if (!this.cache.has(key)) {
        this.cache.add(key);
        const value = this.storage[key];
        return new Promise((resolve) =>
          resolve(value != undefined ? value : default_value)
        );
      }
      const id = Math.random();
      this.sync({ key, id, broadcast: false });
      return promiseListenerFactory(
        "scriptSyncValue",
        GM_info.uuid,
        meta.id,
        (data, resolve, _reject) => {
          if (data.value == undefined) data.value = default_value;
          this.storage[key] = data.value;
          resolve(data.value);
        },
        (data) => data.id == id && data.key == key
      );
    },
  };

  if (grants.includes("GM.getValue") || grants.includes("GM_getValue")) {
    GM.getValue = storageHandler.async_get.bind(storageHandler);
    ChromeXt.addEventListener("scriptStorage", (e) => {
      if (e.detail.id != GM_info.script.id) return;
      e.stopImmediatePropagation();
      const data = e.detail.data;
      if ("key" in data && data.key in GM_info.storage) {
        if (e.detail.uuid == GM_info.uuid && e.detail.broadcast !== true)
          return;
        GM_info.valueListener.forEach((v) => {
          if (v.enabled == true && v.key == data.key) {
            v.listener(
              GM_info.storage[data.key] || null,
              data.value,
              e.detail.uuid != GM_info.uuid
            );
          }
        });
      }
      storageHandler.storage[data.key] = data.value;
    });
    GM_info.valueListener = [];
  }

  grants.forEach((p) => {
    if (!p.startsWith("GM.")) return;
    const name = p.substring(3);
    if (typeof GM[name] != "object") return;
    const sync = GM[name].sync;
    if (typeof sync == "function") {
      GM[name] = function () {
        const result = sync.apply(null, arguments);
        if (name == "xmlHttpRequest") {
          return new Promise(async (resolve) => {
            await result;
            resolve({ ...result });
          });
        }
        if (result instanceof Promise) return result;
        return new Promise(async (resolve) => {
          resolve(await result);
        });
      };
    } else if (typeof sync == "undefined") {
      delete GM[name];
    } else {
      GM[name] = sync;
    }
  });

  if (grants.includes("GM.ChromeXt")) {
    GM.ChromeXt = ChromeXt;
  }

  runScript(meta);

  function promiseListenerFactory(
    event,
    uuid,
    id = meta.id,
    listener = (_data, resolve, _reject) => resolve(true),
    closeCondition = () => true
  ) {
    return new Promise((resolve, reject) => {
      const tmpListener = (e) => {
        if (e.detail.id == id && e.detail.uuid == uuid) {
          e.stopImmediatePropagation();
          const data = e.detail.data || null;
          if (closeCondition(data)) {
            ChromeXt.removeEventListener(event, tmpListener);
            listener(data, resolve, reject);
          }
        }
      };
      ChromeXt.addEventListener(event, tmpListener);
    });
  }

  function runScript(meta) {
    Object.freeze(storageHandler);
    GM_info.storage = new Proxy(storageHandler.storage, storageHandler);
    if (typeof GM_xmlhttpRequest == "function" && meta.resources.length > 0) {
      meta.sync_code = meta.code;
      meta.code = async () => {
        for (const data of meta.resources) {
          data.content = await GM_xmlhttpRequest({ url: data.url });
        }
        return meta.sync_code();
      };
    }

    switch (meta["run-at"]) {
      case "document-start":
        meta.code();
        break;
      case "document-end":
        if (document.readyState != "loading") {
          meta.code();
        } else {
          window.addEventListener("DOMContentLoaded", meta.code);
        }
        break;
      default:
        if (document.readyState == "complete") {
          meta.code();
        } else {
          window.addEventListener("load", meta.code);
        }
    }

    GM_info.scriptHandler = "ChromeXt";
    GM_info.version = "3.8.2";
    Object.freeze(GM_info);
    ChromeXt.scripts.push(GM_info);
  }
};

const key = Symbol("key");
GM.ChromeXtLock = class {
  #key = key;
  #ChromeXt;
  constructor(GM) {
    if (
      typeof GM.key == "number" &&
      typeof GM.name == "string" &&
      Symbol[GM.name].isLocked()
    ) {
      this.#ChromeXt = Symbol[GM.name].unlock(GM.key, false);
    } else {
      throw new Error("Invalid key to construct a lock");
    }
    Object.defineProperty(this, "unlock", {
      value: (key) => {
        if (key == this.#key) {
          return this.#ChromeXt;
        } else {
          throw new Error("Fail to unlock ChromeXtLock");
        }
      },
    });
  }
};
const LockedChromeXt = new GM.ChromeXtLock(GM);
delete GM.ChromeXtLock;

// original file:C:\Projects\School_Projects\Tools\WebViewJSdetect\extracted\ChromeXt-signed\assets\scripts.js

"use strict";

if (typeof Symbol.ChromeXt == "undefined") {
  const initKey = ChromeXtUnlockKeyForInit;
  // Used to lock and unlock ChromeXt;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible")
      ChromeXt.dispatch("focus", { requestFocus: false }, initKey);
  });
  // update current active tab

  const props = {
    Array: Object.getOwnPropertyNames(Array.prototype),
    ChromeXt: ["commands", "cspRules", "filters", "scripts"],
    EventTarget: Object.getOwnPropertyNames(EventTarget.prototype),
    global: Object.keys(window),
    // Drop user-defined props in the global context
  };

  props.EventTarget.pop(); // Remove the prop `constructor`
  props.global.push(...props.EventTarget);

  const backup = {
    // Store some variables to avoid being hooked
    Error: Error,
    Event: CustomEvent,
    confirm: confirm.bind(window),
    parse: JSON.parse.bind(JSON),
    stringify: JSON.stringify.bind(JSON),
    setTimeout: setTimeout.bind(window),
  };

  const SyncMethods = ["fill", "pop", "push", "splice"];
  class SyncArray extends Array {
    #freeze;
    #ChromeXt = null; // Used to validate the sync method
    #name;
    #sync;

    constructor(name, sync = true, freeze = false) {
      super();
      this.#name = name;
      this.#sync = sync;
      this.#freeze = freeze;

      const toVerify = ["fill", "push"];
      const hook = (args, method) => {
        if (toVerify.includes(method) && this.#freeze) {
          let n = 0;
          if (method == "push") {
            n = args.length;
          } else if (method == "fill") {
            n = 1;
          }
          for (let i = 0; i < n; i++) {
            if (!Object.isFrozen(args[i]))
              throw new backup.Error(`Element ${args[i]} is not frozen`);
          }
        }
        const result = super[method](...args);
        ChromeXt.isLocked() && this.sync();
        return result;
      };

      this.proxy = (target, prop) => {
        // Getter for methods of super
        const value = target[prop];
        if (SyncMethods.includes(prop) && typeof value == "function") {
          return (...args) => hook(args, prop);
        } else {
          return value;
        }
      };
    }

    sync(data = this) {
      const LocalChromeXt = this.#ChromeXt || ChromeXt;
      LocalChromeXt.isLocked(true);
      this.#ChromeXt = null; // Must be re-validate each time
      if (this.#sync && typeof this.#name == "string") {
        const payload = {
          origin: window.location.origin,
          name: this.#name,
        };
        if (typeof data == "object" && Array.isArray(data)) {
          if (this.#freeze) data = data.filter((it) => Object.isFrozen(it));
          data = [...new Set(data)];
          if (data.length > 0) payload.data = data;
        }
        LocalChromeXt.dispatch("syncData", payload);
      }
    }

    /** @param {ChromeXtTarget} target */
    set ChromeXt(target) {
      this.#ChromeXt = target;
      backup.setTimeout(() => (this.#ChromeXt = null));
    }
  }

  const trustedDomains = [
    "greasyfork.org",
    "raw.githubusercontent.com",
    "gist.githubusercontent.com",
  ];
  // Verified sources of UserScripts

  let secure = Symbol("secure"); // Secure states of ChromeXt context

  class ChromeXtTarget {
    #debug;
    #locked; // Whether ChromeXt is available
    #security; // State of ChromeXt context
    #target;

    #store = {}; // SyncArrays with names in props.ChromeXt

    constructor(security, debug, target) {
      if (typeof debug == "function" && target instanceof EventTarget) {
        this.#debug = debug;
        this.#target = target;
      } else {
        this.#target = new EventTarget();
        this.#debug = console.debug.bind(console);
      }

      this.#check(security);

      props.EventTarget.forEach((m) => {
        const method = this.#target[m].bind(this.#target);
        this[m] = (...args) => {
          if (!this.isLocked(true)) return method(...args);
        };
      });

      if (secure.description == "secure" && this.#security == secure) {
        props.ChromeXt.forEach((p) => {
          const sync = p != "scripts" && p != "commands";
          const v = new SyncArray(p, sync, p == "scripts");
          this.#store[p] = v;
          this[p] = new Proxy(v, { get: v.proxy });
          delete v.proxy;
        });
      }
    }

    get globalKeys() {
      return props.global;
    }

    /** @param {any | Error} prop */
    set security(prop) {
      if (this.#security == secure) return;
      if (prop != secure && this.#security instanceof backup.Error) return;

      if (prop == secure) {
        if (typeof backup.debug == "function") console.debug = backup.debug;
        delete backup.debug;
      } else if (prop instanceof backup.Error) {
        this.dispatch("block");
        console.warn(
          `Url ${location.href} is not verified for`,
          `ChromeXt security level ${this.#security} due to`,
          prop
        );
      } else {
        this.#patchConsole();
      }

      this.#security = prop;
    }

    #check(security) {
      if (security != secure) throw backup.Error("Invalid constructor");
      // Block access to the ChromeXtTarget constructor from outside
      if (
        secure.description != "verified" &&
        location.protocol.startsWith("http") &&
        location.pathname.endsWith(".user.js") &&
        typeof installScript == "function" &&
        !trustedDomains.includes(location.hostname)
      ) {
        this.security = "userscript";
        // Not a secure context since the page might not be a UserScript

        fetch(location.href, { cache: "only-if-cached", mode: "same-origin" })
          // Local pages are always cached before shown
          .then((res) => {
            const type = res.headers.get("Content-Type").trim();
            if (
              type.startsWith("text/javascript") ||
              type.startsWith("application/javascript") ||
              type.startsWith("text/plain")
            ) {
              this.security = secure;
            } else {
              throw TypeError(`Incompatible content-type: ${type}`);
            }
          })
          .catch((e) => (this.security = e));
      } else {
        this.security = security;
      }
    }

    #confirmAction(action) {
      const msg = [
        "Current environment is not verified by ChromeXt.",
        `Please confirm (each time) to trust current page for the action: ${action}.`,
        "",
        "See details in https://github.com/JingMatrix/ChromeXt/issues/100.",
      ];
      return backup.confirm(msg.join("\n"));
    }

    #patchConsole() {
      if (this.#security == secure || backup.debug !== undefined) return;
      backup.debug = console.debug;
      console.debug = new Proxy(this.#debug, {
        apply(_target, _this, args) {
          try {
            const data = backup.parse(args.join(""));
            if ("action" in data) console.warn("Attacks to ChromeXt defended");
          } catch {}
          return Reflect.apply(...arguments);
        },
      });
    }

    dispatch(action, payload, key) {
      this.isLocked(key != initKey);
      if (action != "block" && this.#security != secure) {
        const error = new backup.Error(
          `ChromeXt called with security level: ${this.#security}`,
          { cause: this.#security }
        );
        if (this.#security instanceof backup.Error) throw error;
        if (!this.#confirmAction(action)) throw error;
      }
      // Kotlin anchor
      this.#debug(backup.stringify({ action, payload, key: initKey }));
    }
    isLocked(throwError = false) {
      const locked = this.#locked === true && secure.description == "verified";
      if (throwError && locked) throw new backup.Error("ChromeXt locked");
      return locked;
    }
    lock(token, name) {
      if (secure.description == "verified")
        throw backup.Error("ChromeXt was already locked once before");
      if (!this.isLocked() && name.length > 16 && token === initKey) {
        this.#locked = true;
        secure = Symbol("verified"); // Context is verified by the provided token
        delete Symbol.ChromeXt;
        Symbol = new Proxy(Symbol, {
          get(_target, prop) {
            if (prop == name) {
              return ChromeXt;
            } else {
              return Reflect.get(...arguments);
            }
          },
        });
        if (typeof userDefinedChromeXt != "undefined") {
          Symbol.ChromeXt = userDefinedChromeXt;
        }
        this.security = secure;
      }
    }
    post(event, detail) {
      if (!this.isLocked(true))
        this.dispatchEvent(new backup.Event(event, { detail }));
    }
    unlock(token, apiOnly = true) {
      if (!this.isLocked()) {
        if (!["content://", "file://"].includes(location.origin))
          throw backup.Error("ChromeXt is not locked");
        return this;
      }
      if (token == initKey) {
        const UnLocked = new ChromeXtTarget(
          this.#security,
          this.#debug,
          this.#target
        );
        if (!apiOnly) {
          // Allow to use SyncMethods
          props.ChromeXt.forEach((k) => {
            const array = this.#store[k];
            UnLocked[k] = new Proxy(this[k], {
              get(target, prop) {
                let value = target[prop];
                if (prop == "sync" || SyncMethods.includes(prop)) {
                  array.ChromeXt = UnLocked; // Unlock sync methods of SyncArray
                  if (prop == "sync") value = value.bind(array);
                }
                return value;
              },
            });
          });
        }
        return UnLocked;
      } else {
        throw new backup.Error("Failed to unlock ChromeXtTarget");
      }
    }
  }

  Object.freeze(ChromeXtTarget.prototype);
  Object.freeze(SyncArray.prototype);
  const ChromeXt = new ChromeXtTarget(secure);
  const userDefinedChromeXt = Symbol.ChromeXt;
  Object.freeze(ChromeXt);
  Symbol.ChromeXt = ChromeXt;
} else {
  throw Error("ChromeXt is already defined, cancel initialization");
}
// Kotlin separator

try {
  if (eruda._isInit) {
    eruda.hide();
    eruda.destroy();
  } else {
    eruda.init();
    eruda.show();
  }
} catch (e) {
  if (typeof define == "function") define.amd = false;
  Symbol.ChromeXt.unlock(ChromeXtUnlockKeyForEruda).dispatch("loadEruda");
}
// Kotlin separator

if (Symbol.ChromeXt.cspRules.length > 0) {
  Symbol.ChromeXt.cspRules.forEach((rule) => {
    if (rule.length == 0) return;
    // Skip empty cspRules
    const meta = document.createElement("meta");
    meta.setAttribute("http-equiv", "Content-Security-Policy");
    meta.setAttribute("content", rule);
    try {
      document.head.append(meta);
    } catch {
      setTimeout(() => {
        document.head.append(meta);
      }, 0);
    }
  });
}
// Kotlin separator

if (Symbol.ChromeXt.filters.length > 0) {
  const filter = Symbol.ChromeXt.filters.join(", ");
  let GM_addStyle = (css) => {
    const style = document.createElement("style");
    style.textContent = css;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      setTimeout(() => document.head.appendChild(style));
    }
  };
  GM_addStyle(filter + " {display: none !important;}");
  window.addEventListener("load", () => {
    document.querySelectorAll(filter).forEach((node) => {
      node.hidden = true;
      node.style.display = "none";
    });
  });
  const amp = "amp-ad,amp-embed,amp-sticky-ad,amp-analytics,amp-auto-ads";
  document.querySelectorAll(amp).forEach((node) => node.remove());
}

