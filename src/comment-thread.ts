/**
 * @license
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

type Comment = {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

type Thread = {
  comments: Comment[];
}

/**
 * A comment thread component.
 *
 * @slot - This element has a slot
 */
@customElement('comment-thread')
export class CommentThread extends LitElement {
  static override styles = css`
    :host {
      width: 100%;
      box-sizing: border-box;
      display: block;
      border: solid 1px gray;
      padding: 16px;
    }
  `;

  @property()
  thread: Thread = { comments: [] };

  override render() {

    return html`
      <!--<slot></slot>-->
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'comment-thread': CommentThread;
  }
}
