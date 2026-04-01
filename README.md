# Comment Thread

A Comment Thread Web Component made using Lit.

[GitHub Repo](https://github.com/Aschii6/lit-comment-thread)

## Overview
A simple web component for a Comment Thread, with minimalistic styling.

Comments can be folded/unfolded.

You can add a comment directly to the discussion, or reply to another comment - by using its reply button, toggling the input on/off.

<img width="75%" alt="Comment Thread Screenshot" src="https://github.com/user-attachments/assets/4ed56fa1-7541-4162-9221-f24620938417" />

## Installation
Download `comment-thread.bundled.js` from the [latest release](https://github.com/Aschii6/lit-comment-thread/releases/latest).

Or install from [NPM](https://www.npmjs.com/package/@aschii6/comment-thread).
```shell
npm i @aschii6/comment-thread
```

## Usage
Import the script.
```html
<script type="module" src="comment-thread.bundled.js"></script>
```

Add it to your web page.
```html
<comment-thread></comment-thread>
```

See docs for how to use the comment thread.

> [!NOTE]
> An example of using comment-thread in plain HTML and JS can be found at [dev/index.html](dev/index.html).

## Docs
### Properties
#### Comments
The list of comments to be rendered.
```html
<comment-thread id="thread"></comment-thread>

<script>
  const thread = document.getElementById('thread');
  thread.comments = [ ... ];
</script>
```

A comment is:
```ts
type Comment = {
  id: string;
  username: string;
  content: string;
  date: Date;
  replies: Comment[];
}
```

#### Fold Depth
The depth after which comments are folded by default (their contents and replies are not visible).
```js
thread.foldDepth = 3;
```
By default, the value is 2.

### Adding comments
The person using the comment thread will type out their comment and press submit. The component will then dispatch an event `'submit-comment'` with the content, and optionally parentId (missing if the comment is not a reply to any comment).
```ts
thread.addEventListener('submit-comment', (event) => {
  const {content, parentId} = event.detail; // content: string, parentId?: string
  // ...
});
```

At this point the dev is expected to validate the comment, maybe do some calls to their APIs, and create a comment including the content, username, date, and replies.

Example:
```js
const newComment = {
  id: (nextId++).toString(),
  username: currentUsername,
  content,
  date: new Date(),
  replies: [],
};
```

Lastly, for the comment to come back to the thread, and be added, the user needs to dispatch an event `'add-comment'`, with the comment and parentId.

Example:
```js
dispatchEvent(
  new CustomEvent('add-comment', {
    detail: {
      comment: newComment,
      parentId,
    },
  })
);
```

## Expanding the comment-thread
Feel free to clone this repository, add any changes you wish for the component to undergo, build it using `rollup`, and use it.
