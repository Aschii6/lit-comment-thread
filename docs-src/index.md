---
layout: page.11ty.cjs
title: <comment-thread> ⌲ Home
---

# &lt;comment-thread>

`<comment-thread>` is an awesome element. It's a great introduction to building web components with LitElement, with nice documentation site as well.

## As easy as HTML

<section class="columns">
  <div>

`<comment-thread>` is just an HTML element. You can it anywhere you can use HTML!

```html
<comment-thread></comment-thread>
```

  </div>
  <div>

<comment-thread></comment-thread>

  </div>
</section>

## Configure with attributes

<section class="columns">
  <div>

`<comment-thread>` can be configured with attributed in plain HTML.

```html
<comment-thread name="HTML"></comment-thread>
```

  </div>
  <div>

<comment-thread name="HTML"></comment-thread>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<comment-thread>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;comment-thread&gt;</h2>
    <comment-thread .name=${name}></comment-thread>
  `,
  document.body
);
```

  </div>
  <div>

<h2>This is a &lt;comment-thread&gt;</h2>
<comment-thread name="lit-html"></comment-thread>

  </div>
</section>
