import uuid

from django.db import models
from django.utils.timezone import now


def book_file_path(instance, filename):
    ext = filename.split(".")[-1]
    timestamp = now().strftime("%Y%m%d_%H%M%S")
    guid = uuid.uuid4().hex
    return f"books/{timestamp}_{guid}.{ext}"


class Book(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    author = models.CharField(max_length=100)
    doc = models.FileField(upload_to=book_file_path)

    def __str__(self):
        return str(self.name)
