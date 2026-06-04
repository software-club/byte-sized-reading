import uuid

from django.db import models
from django.utils.timezone import now


def book_file_path(instance, filename):
    ext = filename.split(".")[-1]
    timestamp = now().strftime("%Y%m%d_%H%M%S")
    guid = uuid.uuid4().hex
    return f"books/{timestamp}_{guid}.{ext}"

SCHEDULE_JOB_STATUS = {
    "UNKNOWN": "UNKNOWN",
    "SCHEDULED": "SCHEDULED",
    "SENDING": "SENDING",
    "CANCELLED":"CANCELLED",
    "FINISHED":"FINISHED"
}




class Book(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    author = models.CharField(max_length=100)
    doc = models.FileField(upload_to=book_file_path)

    def __str__(self):
        return str(self.name)



class ScheduledJobs(models.Model):
    status = models.CharField(max_length=10, choices=SCHEDULE_JOB_STATUS)
    sendAt = models.DateTimeField()
    time = models.CharField(max_length=5)
    frequency = models.CharField(max_length=15)
    timezone = models.CharField(max_length=50)
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)
    user_id = models.IntegerField()
