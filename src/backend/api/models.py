from django.db import models

# Create your models here.

class Book(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    author = models.CharField(max_length=100)
    doc = models.FileField(upload_to='books')
    
    
    def __str__(self):
        return self.name
