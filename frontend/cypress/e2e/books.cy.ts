describe('BookSwap: real backend and PostgreSQL', () => {
  it('creates a book through the form and reads it again after reload', () => {
    const title = `Кобзар E2E ${Date.now()}`
    cy.intercept('GET', '/api/books').as('loadBooks')
    cy.intercept('POST', '/api/books').as('createBook')

    cy.visit('/')
    cy.wait('@loadBooks').its('response.statusCode').should('eq', 200)
    cy.get('h1').should('have.text', 'BookSwap')
    cy.get('#title').type(title)
    cy.get('#author').type('Тарас Шевченко')
    cy.get('button[type="submit"]').click()

    cy.wait('@createBook').then(({ response }) => {
      expect(response?.statusCode).to.eq(201)
      expect(response?.body.title).to.eq(title)
      expect(response?.body.author).to.eq('Тарас Шевченко')
    })
    cy.contains('.books li', title).should('contain.text', 'Тарас Шевченко')
    cy.get('#title').should('have.value', '')
    cy.get('#author').should('have.value', '')

    cy.reload()
    cy.wait('@loadBooks')
    cy.contains('.books li', title).should('contain.text', 'Тарас Шевченко')
    cy.request('/api/books').its('body').should((books: { title: string }[]) => {
      expect(books.some((book) => book.title === title)).to.eq(true)
    })
  })
})

describe('BookSwap: form states and API errors', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/books', { statusCode: 200, body: [] }).as('loadBooks')
  })

  it('shows the empty catalogue and prevents an incomplete submission', () => {
    cy.visit('/')
    cy.wait('@loadBooks')
    cy.contains('Книг поки немає. Додайте першу!').should('be.visible')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('#title').type('Кобзар')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('#author').type('   ')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('#author').clear().type('Тарас Шевченко')
    cy.get('button[type="submit"]').should('be.enabled')
    cy.get('#title').should('have.attr', 'maxlength', '255')
    cy.get('#author').should('have.attr', 'maxlength', '255')
  })

  it('renders an existing book returned by the API', () => {
    cy.intercept('GET', '/api/books', {
      statusCode: 200,
      body: [{ id: 1, title: 'Лісова пісня', author: 'Леся Українка' }],
    })
    cy.visit('/')
    cy.contains('.books li', 'Лісова пісня').should('contain.text', 'Леся Українка')
  })

  it('shows a load error and disables adding books', () => {
    cy.intercept('GET', '/api/books', { statusCode: 503, body: {} })
    cy.visit('/')
    cy.get('[role="alert"]').should('contain.text', 'Не вдалося завантажити книги')
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('.books li').should('not.exist')
  })

  it('keeps entered values after a save error and allows a retry', () => {
    cy.intercept('POST', '/api/books', { statusCode: 503, body: {} }).as('failedSave')
    cy.visit('/')
    cy.wait('@loadBooks')
    cy.get('#title').type('Кобзар')
    cy.get('#author').type('Тарас Шевченко')
    cy.get('button[type="submit"]').click()
    cy.wait('@failedSave')
    cy.get('[role="alert"]').should('contain.text', 'Не вдалося додати книгу')
    cy.get('#title').should('have.value', 'Кобзар')
    cy.get('#author').should('have.value', 'Тарас Шевченко')
    cy.get('.books li').should('not.exist')

    cy.intercept('POST', '/api/books', {
      statusCode: 201,
      body: { id: 1, title: 'Кобзар', author: 'Тарас Шевченко' },
    }).as('successfulSave')
    cy.get('button[type="submit"]').click()
    cy.wait('@successfulSave')
    cy.contains('.books li', 'Кобзар').should('be.visible')
    cy.get('[role="alert"]').should('not.exist')
  })
})
