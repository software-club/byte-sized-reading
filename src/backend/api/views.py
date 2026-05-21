from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
from admin.logger import logger

class BooksView(APIView):
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
