/**
 * @license
 */

import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ref, createRef} from 'lit/directives/ref.js';

type Comment = {
  id: number;
  username: string;
  content: string;
  date: Date;
  replies: Comment[];
};

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
    }

    .comment {
      padding-block: 8px;
    }

    .replies {
      padding-inline-start: 16px;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();

    window.addEventListener('add-comment', (event: Event) =>
      this.handleCommentAdded(event as CustomEvent)
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('add-comment', (event: Event) =>
      this.handleCommentAdded(event as CustomEvent)
    );
  }

  @property({attribute: false}) comments: Comment[] = [];

  override render() {
    return html`
      <div>
        <h2>Comments</h2>
        ${this.renderCommentInput(0)}
        ${this.comments.length > 0
          ? html`
              ${this.comments.map((comment) => this.renderComment(comment, 0))}
            `
          : html`<h1>Discussion not started yet.</h1>`}
        <!--<slot></slot>-->
      </div>
    `;
  }

  renderCommentInput(parentId?: number): TemplateResult {
    const inputRef = createRef<HTMLInputElement>();

    return html`
      <div class="comment-input">
        <input ${ref(inputRef)} type="text" placeholder="Write a comment..." />
        <button
          @click=${() => {
            if (inputRef.value) {
              this.handleSubmit(inputRef.value, parentId);
            }
          }}
        >
          Submit
        </button>
      </div>
    `;
  }

  handleSubmit(input: HTMLInputElement, parentId?: number) {
    const content = input.value.trim();
    if (content) {
      this.submitComment(content, parentId);
      input.value = '';
    }
  }

  submitComment(content: string, parentId?: number) {
    this.dispatchEvent(
      new CustomEvent('submit-comment', {
        detail: {content, parentId},
        bubbles: true,
        composed: true,
      })
    );
  }

  handleCommentAdded(event: CustomEvent) {
    const {comment, parentId} = event.detail;
    this.addCommentToThread(this.comments, comment, parentId);
    this.requestUpdate();
  }

  addCommentToThread = (
    comments: Comment[],
    newComment: Comment,
    parentId: number | undefined
  ) => {
    if (parentId === null || parentId === 0) {
      comments.push(newComment);
      return true;
    }

    for (const comment of comments) {
      if (comment.id === parentId) {
        comment.replies.push(newComment);
        return true;
      }
      if (this.addCommentToThread(comment.replies, newComment, parentId)) {
        return true;
      }
    }
    return false;
  };

  private formatCommentDate(date: Date): string {
    return Number.isNaN(date.getTime())
      ? 'Invalid date'
      : date.toLocaleString();
  }

  renderComment(comment: Comment, depth = 0): TemplateResult {
    return html`
      <div class="comment" data-depth=${depth}>
        <strong>${comment.username}</strong>
        (${this.formatCommentDate(comment.date)}):
        <p>${comment.content}</p>
        ${comment.replies.length
          ? html`<div class="replies">
              ${comment.replies.map((reply) =>
                this.renderComment(reply, depth + 1)
              )}
            </div>`
          : ``}
      </div>
    `;
  }
}

// customElements.define('comment-thread', CommentThread);

declare global {
  interface HTMLElementTagNameMap {
    'comment-thread': CommentThread;
  }
}
