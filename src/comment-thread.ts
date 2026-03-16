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
    }

    .content {
      padding-bottom: 6px;
      margin-left: 6px;
      padding-left: 12px;
      border-left: 2px solid #777;
      border-bottom-left-radius: 6px;

      display: flex;
      flex-direction: column;
      row-gap: 6px;
    }
    
    .content::after {
      content: '';
      width: 16px;
      height: 4px;
      border-bottom: 2px solid #777;
      border-bottom-left-radius: 6px;
      position: relative;
      left: -12px;
      bottom: -7px;
    }

    .content p {
      margin: 0;
    }

    .fold-button {
      padding: 4px 6px 2px;
      border: 2px solid #777;
      border-radius: 8px;
      align-self: start;
    }

    .fold-button:hover {
      cursor: pointer;
    }

    .reply-button {
      padding: 6px 7px 4px 8px;
      border: 2px solid #777;
      border-radius: 8px;
      align-self: start;
    }
    
    .reply-button:hover {
      cursor: pointer;
    }

    .submit-button {
      padding: 4px 10px;
      border: 2px solid #777;
      border-radius: 8px;
    }
    
    .submit-button:hover {
      cursor: pointer;
    }

    .comment-input {
      padding: 6px 12px;
      border: 2px solid #777;
      border-radius: 8px;
    }

    .replies {
      margin-left: 12px;
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
            ? html` <button
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
          <p style="margin: 0;">(${this.formatCommentDate(comment.date)}):</p>
        </div>
        ${!commUiState.folded
          ? html`
              <div class="content">
                <p>${comment.content}</p>
                <div
                  style="display: flex; flex-direction: row; column-gap: 6px; align-items: center;"
                >
                  <button
                    class="reply-button"
                    @click=${() => {
                      commUiState.inputVisible = !commUiState.inputVisible;
                      this.requestUpdate();
                    }}
                  >
                    ${commUiState.inputVisible
                      ? html`
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path
                              d="M576 304C576 436.5 461.4 544 320 544C282.9 544 247.7 536.6 215.9 523.3L97.5 574.1C88.1 578.1 77.3 575.8 70.4 568.3C63.5 560.8 62 549.8 66.8 540.8L115.6 448.6C83.2 408.3 64 358.3 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304z"
                            />
                          </svg>
                        `
                      : html`
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path
                              d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
                            />
                          </svg>
                        `}
                  </button>
                  ${commUiState.inputVisible
                    ? this.renderCommentInput(comment.id)
                    : ''}
                </div>
                ${comment.replies.length
                  ? html` <div class="comments-container replies">
                      ${comment.replies.map((reply) =>
                        this.renderComment(reply, depth + 1)
                      )}
                    </div>`
                  : ``}
              </div>
            `
          : ``}
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
