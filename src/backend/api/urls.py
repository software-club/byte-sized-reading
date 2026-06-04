from django.urls import path
from .views import BooksView, ScheduleJobView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)



urlpatterns = [
    path('books', BooksView.as_view(), name='books'),
    path('books/<int:book_id>/schedule', ScheduleJobView.as_view(), name='schedule_job'),
    path('login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    
]
