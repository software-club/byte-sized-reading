from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import Book


@override_settings(MEDIA_ROOT="/tmp/test_media")
class BooksViewTest(TestCase):
    @patch("django.core.files.storage.default_storage.save")
    def test_create_book_via_api(self, mock_save):
        mock_save.return_value = "test_books/test.pdf"

        doc = SimpleUploadedFile(
            "test.pdf", b"file content", content_type="application/pdf"
        )
        response = self.client.post(
            "/api/books",
            {
                "name": "Test Book",
                "description": "A test description",
                "author": "Test Author",
                "doc": doc,
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Book.objects.count(), 1)
        book = Book.objects.first()
        assert book is not None
        self.assertEqual(book.name, "Test Book")
        self.assertEqual(book.author, "Test Author")

    def test_get_books_via_api(self):
        Book.objects.create(
            name="Book 1",
            description="Description 1",
            author="Author 1",
        )
        Book.objects.create(
            name="Book 2",
            description="Description 2",
            author="Author 2",
        )

        response = self.client.get("/api/books")

        self.assertEqual(response.status_code, 200)

        books = response.json()

        self.assertEqual(len(books), 2)
        self.assertEqual(books[0]["name"], "Book 1")
        self.assertEqual(books[1]["name"], "Book 2")
