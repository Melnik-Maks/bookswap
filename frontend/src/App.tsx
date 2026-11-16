import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type Book = {
  id: number;
  title: string;
  author: string;
};

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        const response = await fetch('/api/books', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to load books');
        const data: Book[] = await response.json();
        if (!controller.signal.aborted) setBooks(data);
      } catch {
        if (!controller.signal.aborted) {
          setLoadError('Не вдалося завантажити книги. Оновіть сторінку.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadBooks();
    return () => controller.abort();
  }, []);

  async function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !title.trim() || !author.trim()) return;
    setSaving(true);
    setSaveError('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), author: author.trim() }),
      });
      if (!response.ok) throw new Error('Failed to save book');
      const book: Book = await response.json();
      setBooks((current) => [...current, book]);
      setTitle('');
      setAuthor('');
    } catch {
      setSaveError('Не вдалося додати книгу. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>BookSwap</h1>

      <p>
        Платформа для обміну та оренди книг між користувачами.
      </p>

      <section aria-labelledby="add-book-heading">
        <h2 id="add-book-heading">Додати книгу</h2>
        <form onSubmit={addBook}>
          <label htmlFor="title">Назва книги</label>
          <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} disabled={saving} />

          <label htmlFor="author">Автор</label>
          <input id="author" value={author} onChange={(event) => setAuthor(event.target.value)} required maxLength={255} disabled={saving} />

          <button type="submit" disabled={loading || Boolean(loadError) || saving || !title.trim() || !author.trim()}>
            {saving ? 'Збереження…' : 'Додати книгу'}
          </button>
          {saveError && <p className="error" role="alert">{saveError}</p>}
        </form>
      </section>

      <section aria-labelledby="books-heading" aria-live="polite">
        <h2 id="books-heading">Список книг</h2>
        {loading && <p>Завантаження…</p>}
        {loadError && <p className="error" role="alert">{loadError}</p>}
        {!loading && !loadError && books.length === 0 && <p>Книг поки немає. Додайте першу!</p>}
        <ul className="books">
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong>
              <span>{book.author}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
