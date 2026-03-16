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

    .thread-container {
      margin: 8px 0;
    }

    .comments-container {
      display: flex;
      flex-direction: column;
      row-gap: 6px;
      margin: 8px 0;
    }

    .comment {
      display: flex;
      flex-direction: column;
      row-gap: 6px;

      :hover {
      }
    }

    .fold-button {
      padding: 4px 6px;
      border: 2px solid #777;
      border-radius: 8px;
      align-self: start;
    }

    .reply-button {
      padding: 6px 12px;
      border: 2px solid #777;
      border-radius: 8px;
      align-self: start;
    }

    .submit-button {
      padding: 6px 12px;
      border: 2px solid #777;
      border-radius: 8px;
    }

    .comment-input {
      padding: 6px 12px;
      border: 2px solid #777;
      border-radius: 8px;
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
      <div class="thread-container">
        <slot></slot>
        <h2>Discussion</h2>
        ${this.renderCommentInput()}
        ${this.comments.length > 0
          ? html`
              <div class="comments-container">
                ${this.comments.map((comment) =>
                  this.renderComment(comment, 0)
                )}
              </div>
            `
          : html`<h1>Discussion not started yet.</h1>`}
      </div>
    `;
  }

  renderComment(comment: Comment, depth = 0): TemplateResult {
    const defaultFolded = depth > 1;

    if (!this.uiState.has(comment.id)) {
      this.uiState.set(comment.id, {
        folded: defaultFolded,
        inputVisible: false,
      });
    }

    const commUiState = this.uiState.get(comment.id)!;

    return html`
      <div class="comment">
        <div
          style="display: flex; flex-direction: row; column-gap: 6px; align-items: center;"
        >
          ${commUiState.folded
            ? html`
              <button
                class="fold-button"
                @click=${() => {
                  commUiState.folded = !commUiState.folded;
                  this.requestUpdate();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z"
                  />
                </svg>
              </button>`
            : html`
              <button
                class="fold-button"
                @click=${() => {
                  commUiState.folded = !commUiState.folded;
                  this.requestUpdate();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M297.4 201.4C309.9 188.9 330.2 188.9 342.7 201.4L502.7 361.4C515.2 373.9 515.2 394.2 502.7 406.7C490.2 419.2 469.9 419.2 457.4 406.7L320 269.3L182.6 406.6C170.1 419.1 149.8 419.1 137.3 406.6C124.8 394.1 124.8 373.8 137.3 361.3L297.3 201.3z"
                  />
                </svg>
              </button>
            `}
          <p style="margin: 0"><strong>${comment.username}</strong></p>
          <p style="margin: 0;">
              (${this.formatCommentDate(comment.date)}):
          </p>
        </div>
        ${!commUiState.folded
        ? html`
        <p style="margin: 4px">${comment.content}</p>
        <button
          class="reply-button"
          @click=${() => {
            commUiState.inputVisible = !commUiState.inputVisible;
            this.requestUpdate();
          }}
        >
          ${commUiState.inputVisible ? 'Cancel' : 'Reply'}
        </button>
        ${commUiState.inputVisible
          ? this.renderCommentInput(comment.id)
          : ''}
        ${comment.replies.length
          ? html`
            <div class="comments-container"> <!-- Hmm -->
              ${comment.replies.map((reply) =>
                this.renderComment(reply, depth + 1)
              )}
            </div>`
          : ``}
        ` : ``}
      </div>
    `;
  }

  renderCommentInput(parentId?: string): TemplateResult {
    const inputRef = createRef<HTMLInputElement>();

    return html`
      <div class="input-container">
        <input
          class="comment-input"
          ${ref(inputRef)}
          type="text"
          placeholder="Write a comment..."
        />
        <button
          class="submit-button"
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

    this.uiState.set(comment.id, {
      folded: false,
      inputVisible: false,
    });

    this.requestUpdate();
  }

  addCommentToThread = (
    comments: Comment[],
    newComment: Comment,
    parentId?: string
  ) => {
    if (parentId === undefined) {
      comments.unshift(newComment);
      return true;
    }

    for (const comment of comments) {
      if (comment.id === parentId) {
        comment.replies.unshift(newComment);
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
