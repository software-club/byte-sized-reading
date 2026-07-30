from admin.logger import logger
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from structlog.contextvars import bind_contextvars, clear_contextvars

from .models import Book, ScheduledJobs
from .serializers import BookSerializer, ScheduleJobSerializer


class BaseAPIView(APIView):
    def initial(self, request, *args, **kwargs):
        clear_contextvars()

        super().initial(request, *args, **kwargs)

        if request.user and request.user.is_authenticated:
            bind_contextvars(
                user_id=request.user.id,
                username=request.user.username,
            )


class ScheduleJobView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        serializer = ScheduleJobSerializer(data=request.data)

        if serializer.is_valid():
            logger.info("Creating schedule for: %s", serializer.validated_data)
            serializer.save(book_id=book, user_id=request.user.id)
            return Response(serializer.data, status=201)

        logger.info("Error when creating schedule as => %s", serializer.errors)
        return Response(serializer.errors, status=400)

    def get(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        schedule = ScheduledJobs.objects.filter(
            book_id=book, user_id=request.user.id
        ).last()

        if schedule is None:
            return Response({"detail": "No schedule for this book."}, status=404)

        return Response(ScheduleJobSerializer(schedule).data)


class BooksView(BaseAPIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)

        logger.info("Getting %d books", len(serializer.data))

        return Response(serializer.data)

    def post(self, request):
        serializer = BookSerializer(data=request.data)

        logger.info("Request to create a book with => %s", serializer.initial_data)

        if serializer.is_valid():
            logger.info("Creating a book => %s", serializer.validated_data)
            serializer.save()
            logger.info("Book created as => %s", serializer.data)
            return Response(serializer.data, status=201)
        logger.info("Error when creating book as => %s", serializer.errors)
        return Response(serializer.errors, status=400)
