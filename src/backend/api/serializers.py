from admin.logger import logger
from rest_framework import serializers

from .models import Book, ScheduledJobs
from .next_occurrence import next_occurrence


class ScheduleJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledJobs
        # fields = "__all__"
        exclude = ("sendAt", "status")

    def create(self, validated_data):
        validated_data["status"] = "SCHEDULED"
        validated_data["sendAt"] = next_occurrence(
            time_of_day=validated_data["time"],
            timezone=validated_data["timezone"],
            frequency=validated_data["frequency"],
        )

        return super().create(validated_data)

class NotifyJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledJobs
        fields = '__all__'

    
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"
