// json explorer

const context = {
  engine: 'jsonpath',
  engines: {
    jsonpath: function (query, json) {
      return query.trim() ? jsonpath.query(json, query) : json;
    },
    xpath: function (query, json) {
      return query.trim() ? defiant.search(json, query) : json;
    }
  },
  json: {},
  query: '',
  ticker: null,
  interval: 300,
  result: {}
};

const template = `
<div class="container">
    <div class="header">
        <select name="engine">
            <option value="jsonpath">JSONPath</option>
            <option value="xpath">XPath</option>
        </select>
        <input name="query" type="text" placeholder="Query">
    </div>

    <div class="code"><pre></pre></div>
</div>`;

function initialize () {
  let pre = document.querySelector('body > pre');
  if (!pre) return false;

  try {
    context.json = window.json = JSON.parse(pre.innerText);
  } catch (e) {
    return false;
  }

  bootstrap();
  highlight(context.json);
}

function bootstrap() {
  let pre = document.querySelector('body > pre');
  pre.style.display = 'none';

  let explorer = document.createElement('div');
  explorer.id = 'json-explorer';
  explorer.innerHTML = template.trim();

  pre.after(explorer);

  document.querySelector('#json-explorer select[name=engine]').addEventListener('change', function () {
    if (!context.engines.hasOwnProperty(this.value)) return;

    context.engine = this.value;
    search(context.query, context.json);
  });

  let changeHandler = function (event) {
    if (event.target.value.trim() === context.query.trim()) return;

    context.query = event.target.value;

    clearTimeout(context.ticker);
    context.ticker = setTimeout(function () { search(context.query, context.json); }, context.interval);
  };

  document.querySelector('#json-explorer input[name=query]').addEventListener('keyup', changeHandler);
  document.querySelector('#json-explorer input[name=query]').addEventListener('change', changeHandler);
}

function _highlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function search(query = context.query, json = context.json) {
  try {
    let result = context.result = context.engines[context.engine](query, json);
    success();
    highlight(result);
  } catch (e) {
    error();
  }
}

function highlight(json) {
  let string = _highlight(JSON.stringify(json, null, 2));

  print(string);
}

function print(input) {
  let pre = document.querySelector('#json-explorer .code > pre');
  pre.innerHTML = input;
}

function success() {
  document.querySelector('#json-explorer .header').classList.remove('error');
}

function error() {
  document.querySelector('#json-explorer .header').classList.add('error');
}

initialize();