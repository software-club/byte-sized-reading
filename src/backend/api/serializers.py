from rest_framework import serializers

from .models import Book, ScheduledJobs
from .next_occurrence import (
    next_occurrence,
    parse_frequency,
    parse_time_of_day,
    parse_timezone,
)


class ScheduleJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledJobs
        exclude = ("sendAt", "status")
        # Both are taken from the URL and the logged in user, never the payload.
        read_only_fields = ("book_id", "user_id")

    def to_internal_value(self, data):
        # The client sends frequency as a list of days; store it comma separated.
        frequency = data.get("frequency")
        if isinstance(frequency, (list, tuple)):
            data = {**data, "frequency": ",".join(str(day) for day in frequency)}

        return super().to_internal_value(data)

    def validate_time(self, value):
        try:
            parse_time_of_day(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error))

        return value

    def validate_timezone(self, value):
        try:
            parse_timezone(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error))

        return value

    def validate_frequency(self, value):
        try:
            days = parse_frequency(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error))

        return ",".join(str(day) for day in days)

    def create(self, validated_data):
        validated_data["status"] = "SCHEDULED"
        validated_data["sendAt"] = next_occurrence(
            time_of_day=validated_data["time"],
            timezone=validated_data["timezone"],
            frequency=validated_data["frequency"],
        )

        return super().create(validated_data)


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"
