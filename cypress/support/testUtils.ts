import { sep } from 'path';

import { ExecutionMode } from './utils';

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

export function submitMessage(message: string) {
  cy.get(`#chat-input`).should('not.be.disabled').type(`${message}`);
  cy.get(`#chat-submit`).should('not.be.disabled').click();
}

export function submitMessageCopilot(message: string) {
  cy.get(`#chat-input`, { includeShadowDom: true })
    .should('be.visible')
    .should('have.attr', 'contenteditable', 'plaintext-only')
    .should('not.be.disabled')
    .then(($el) => {
      cy.wrap($el).click().type(`${message}{enter}`, {
        scrollBehavior: false
      });
    });
}

export function openHistory() {
  cy.get(`#chat-input`).should('not.be.disabled').type(`{upArrow}`);
}

export function closeHistory() {
  cy.get(`body`).click();
}

export function getCopilotThreadId() {
  return cy.window().then((win) => {
    // @ts-expect-error is not a valid prop
    return win.getChainlitCopilotThreadId();
  });
}

export function clearCopilotThreadId(newThreadId?: string) {
  return cy.window().then((win) => {
    // @ts-expect-error is not a valid prop
    win.clearChainlitCopilotThreadId(newThreadId);
  });
}

export function runTestServer(
  mode: ExecutionMode = undefined,
  env?: Record<string, string>
) {
  const pathItems = Cypress.spec.absolute.split(sep);
  const testName = pathItems[pathItems.length - 2];
  cy.exec(`pnpm exec ts-node ./cypress/support/run.ts ${testName} ${mode}`, {
    env
  });
  cy.visit('/');
}

export function describeSyncAsync(
  title: string,
  callback: (mode: ExecutionMode) => void
) {
  describe(`[sync] ${title}`, () => callback(ExecutionMode.Sync));
  describe(`[async] ${title}`, () => callback(ExecutionMode.Async));
}
