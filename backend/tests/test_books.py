import pytest


def test_new_database_has_no_books(client):
    response = client.get("/books")
    assert response.status_code == 200
    assert response.json() == []


def test_create_and_list_books(client):
    assert client.get("/books").json() == []
    response = client.post(
        "/books", json={"title": "  Кобзар  ", "author": "Тарас Шевченко"}
    )
    assert response.status_code == 201
    book = response.json()
    assert isinstance(book["id"], int)
    assert book == {"id": book["id"], "title": "Кобзар", "author": "Тарас Шевченко"}

    second = client.post("/books", json={"title": "Лісова пісня", "author": "Леся Українка"})
    assert second.status_code == 201
    assert second.json()["id"] != book["id"]
    listing = client.get("/books")
    assert listing.status_code == 200
    assert listing.json() == [book, second.json()]


@pytest.mark.parametrize("payload", [
    {"title": "", "author": "Автор"},
    {"title": "   ", "author": "Автор"},
    {"title": "Книга", "author": ""},
    {"title": "Книга", "author": "   "},
    {"title": "Книга"},
    {"author": "Автор"},
    {},
    {"title": None, "author": "Автор"},
    {"title": "Книга", "author": None},
    {"title": "а" * 256, "author": "Автор"},
    {"title": "Книга", "author": "а" * 256},
])
def test_invalid_book_is_not_saved(client, payload):
    assert client.post("/books", json=payload).status_code == 422
    assert client.get("/books").json() == []


def test_maximum_length_fields_are_accepted(client):
    payload = {"title": "К" * 255, "author": "А" * 255}
    response = client.post("/books", json=payload)

    assert response.status_code == 201
    book = response.json()
    assert book["title"] == payload["title"]
    assert book["author"] == payload["author"]
    assert client.get("/books").json() == [book]


def test_invalid_request_does_not_change_existing_books(client):
    book = client.post(
        "/books", json={"title": "Кобзар", "author": "Тарас Шевченко"}
    ).json()

    assert client.post("/books", json={"title": "", "author": "Автор"}).status_code == 422
    assert client.get("/books").json() == [book]
