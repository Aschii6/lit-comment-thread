/**
 * @license
 */

import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ref, createRef} from 'lit/directives/ref.js';

type Comment = {
  id: string;
  username: string;
  content: string;
  date: Date;
  replies: Comment[];
};

type CommentUiState = {
  folded: boolean;
  inputVisible: boolean;
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

  @state() uiState: Map<string, CommentUiState> = new Map();

  override render() {
    return html`
      <div>
        <slot></slot>
        <h2>Discussion</h2>
        ${this.renderCommentInput()}
        ${this.comments.length > 0
          ? html`
              ${this.comments.map((comment) => this.renderComment(comment, 0))}
            `
          : html`<h1>Discussion not started yet.</h1>`}
      </div>
    `;
  }

  renderComment(comment: Comment, depth = 0): TemplateResult {
    const commUiState = this.uiState.get(comment.id) || {folded: false, inputVisible: false};

    return html`
      <div
        class="comment"
        style="display: flex; flex-direction: column; row-gap: 6px;"
      >
        <div style="display: flex; flex-direction: row; column-gap: 6px; align-items: center; margin: 0">
          <p style="margin: 2px"><strong>${comment.username}</strong></p>
          <p style="margin: 2px;">(${this.formatCommentDate(comment.date)}):</p>
        </div>
        <p style="margin: 4px 8px">${comment.content}</p>
        <button
          style="padding: 4px; max-width: 100px;"
          @click=${() => {
            this.uiState.set(comment.id, {
              ...commUiState,
              inputVisible: !commUiState.inputVisible,
            });
            this.requestUpdate();
          }}
        >
          ${commUiState.inputVisible ? 'Cancel' : 'Reply'}
        </button>
        ${commUiState.inputVisible ? this.renderCommentInput(comment.id) : ''}
        ${comment.replies.length
          ? html`
            <div class="replies">
              ${comment.replies.map((reply) =>
                this.renderComment(reply, depth + 1)
              )}
            </div>`
          : ``}
      </div>
    `;
  }

  renderCommentInput(parentId?: string): TemplateResult {
    const inputRef = createRef<HTMLInputElement>();

    return html`
      <div class="comment-input">
        <input style="padding: 4px;" ${ref(inputRef)} type="text" placeholder="Write a comment..." />
        <button
          style="padding: 4px;"
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

  handleSubmit(input: HTMLInputElement, parentId?: string) {
    const content = input.value.trim();
    if (content) {
      this.submitComment(content, parentId);
      input.value = '';
    }
  }

  submitComment(content: string, parentId?: string) {
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
    parentId?: string
  ) => {
    if (parentId === undefined) {
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
}

// customElements.define('comment-thread', CommentThread);

declare global {
  interface HTMLElementTagNameMap {
    'comment-thread': CommentThread;
  }
}
