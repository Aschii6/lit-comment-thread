---
layout: example.11ty.cjs
title: <comment-thread> Basic Examples
tags: [example]
name: Basic
description: A basic example
---

<style>
  comment-thread p {
    border: solid 1px blue;
    padding: 8px;
  }
</style>
<comment-thread>
  <p>This is child content</p>
</comment-thread>

<h3>CSS</h3>

```css
p {
  border: solid 1px blue;
  padding: 8px;
}
```

<h3>HTML</h3>

```html
<comment-thread>
  <p>This is child content</p>
</comment-thread>
```
