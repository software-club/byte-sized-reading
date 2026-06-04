from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Book, ScheduledJobs
from .serializers import BookSerializer, ScheduleJobSerializer
from admin.logger import logger
from structlog.contextvars import bind_contextvars, clear_contextvars

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
    def post(self, request, book_id):
        serializer = ScheduleJobSerializer(data=request.data)
        logger.info("Scheduled job => %s", serializer.initial_data)
        serializer.initial_data['book_id'] = book_id
        serializer.initial_data['user_id'] = request.user.id
        serializer.initial_data['frequency'] = ','.join(map(str, (request.data['frequency'])))    
        if serializer.is_valid():
            logger.info("Creating schedule for: %s", serializer.validated_data)
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request, book_id):
        scheduled_jobs = ScheduledJobs.objects.all()
        serializer = ScheduleJobSerializer(scheduled_jobs, many=True)
        return Response(serializer.data)
            
class BooksView(BaseAPIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)

        logger.info("Getting books => %s", serializer.data)

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

