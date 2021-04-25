describe('ESM for browsers', () => {
  it('exports the hibp namespace', () => {
    cy.visit('/test/index.html');

    // N.B. Some assertions are on the page itself (in the <script> block). If
    // any of them fail, they will throw an error and prevent the final line of
    // the script from setting the results message, causing the test to fail.

    cy.get('#results').should('have.text', 'success');
  });
});
