from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Book, ScheduledJobs
from .next_occurrence import (
    next_occurrence,
    parse_frequency,
    parse_time_of_day,
    parse_timezone,
)


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


LONDON = ZoneInfo("Europe/London")

# 2026-03-02 is a Monday, so weekday 0 through 6 runs to Sunday 2026-03-08.
MONDAY_MORNING = datetime(2026, 3, 2, 8, 0, tzinfo=LONDON)


class ParseTimeOfDayTest(TestCase):
    def test_parses_a_24_hour_time(self):
        self.assertEqual(parse_time_of_day("09:05"), (9, 5))
        self.assertEqual(parse_time_of_day("00:00"), (0, 0))
        self.assertEqual(parse_time_of_day("23:59"), (23, 59))

    def test_rejects_times_outside_the_clock(self):
        for value in ["24:00", "23:60", "-1:00"]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_time_of_day(value)

    def test_rejects_malformed_times(self):
        for value in ["9:05", "0905", "09:05:00", "", "nine", None]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_time_of_day(value)


class ParseFrequencyTest(TestCase):
    def test_parses_a_comma_separated_string(self):
        self.assertEqual(parse_frequency("0,2,4"), [0, 2, 4])

    def test_parses_a_list(self):
        self.assertEqual(parse_frequency([0, 2, 4]), [0, 2, 4])

    def test_sorts_and_de_duplicates(self):
        self.assertEqual(parse_frequency("4,0,4,2"), [0, 2, 4])

    def test_rejects_an_empty_frequency(self):
        for value in ["", " ", ",", []]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_frequency(value)

    def test_rejects_days_outside_the_week(self):
        for value in ["7", "-1", "0,7"]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_frequency(value)

    def test_rejects_non_numeric_days(self):
        with self.assertRaises(ValueError):
            parse_frequency("monday")


class ParseTimezoneTest(TestCase):
    def test_parses_an_iana_name(self):
        self.assertEqual(parse_timezone("Europe/London"), LONDON)

    def test_rejects_an_unknown_name(self):
        for value in ["Not/AZone", "", "GMT+1", None]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_timezone(value)


class NextOccurrenceTest(TestCase):
    def test_returns_todays_slot_when_it_is_still_ahead(self):
        self.assertEqual(
            next_occurrence("09:00", "Europe/London", "0", now=MONDAY_MORNING),
            datetime(2026, 3, 2, 9, 0, tzinfo=LONDON),
        )

    def test_rolls_to_next_week_when_todays_slot_has_passed(self):
        now = MONDAY_MORNING.replace(hour=10)

        self.assertEqual(
            next_occurrence("09:00", "Europe/London", "0", now=now),
            datetime(2026, 3, 9, 9, 0, tzinfo=LONDON),
        )

    def test_rolls_forward_when_the_slot_is_exactly_now(self):
        now = MONDAY_MORNING.replace(hour=9, minute=0)

        self.assertEqual(
            next_occurrence("09:00", "Europe/London", "0", now=now),
            datetime(2026, 3, 9, 9, 0, tzinfo=LONDON),
        )

    def test_picks_the_soonest_of_several_days(self):
        # Wednesday and Friday, from a Monday.
        self.assertEqual(
            next_occurrence("09:00", "Europe/London", "2,4", now=MONDAY_MORNING),
            datetime(2026, 3, 4, 9, 0, tzinfo=LONDON),
        )

    def test_converts_now_into_the_schedules_timezone(self):
        # 23:00 UTC on Monday is already 08:00 Tuesday in Tokyo.
        now = datetime(2026, 3, 2, 23, 0, tzinfo=ZoneInfo("UTC"))

        self.assertEqual(
            next_occurrence("09:00", "Asia/Tokyo", "1", now=now),
            datetime(2026, 3, 3, 9, 0, tzinfo=ZoneInfo("Asia/Tokyo")),
        )

    def test_keeps_the_local_wall_clock_time_across_a_dst_change(self):
        # UK clocks go forward on Sunday 2026-03-29.
        now = datetime(2026, 3, 28, 8, 0, tzinfo=LONDON)

        occurrence = next_occurrence("09:00", "Europe/London", "6", now=now)

        self.assertEqual(occurrence.date().isoformat(), "2026-03-29")
        self.assertEqual(occurrence.hour, 9)
        self.assertEqual(occurrence.utcoffset().total_seconds(), 3600)

    def test_rejects_invalid_input(self):
        for time_of_day, timezone, frequency in [
            ("09:00", "Not/AZone", "0"),
            ("nope", "Europe/London", "0"),
            ("09:00", "Europe/London", "7"),
            ("09:00", "Europe/London", ""),
        ]:
            with self.subTest(time=time_of_day, timezone=timezone, freq=frequency):
                with self.assertRaises(ValueError):
                    next_occurrence(
                        time_of_day, timezone, frequency, now=MONDAY_MORNING
                    )


class ScheduleJobViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="reader", password="secret")
        self.book = Book.objects.create(
            name="Test Book",
            description="A test description",
            author="Test Author",
        )
        self.url = f"/api/books/{self.book.id}/schedule"
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def payload(self, **overrides):
        return {
            "time": "09:00",
            "timezone": "Europe/London",
            "frequency": [0, 2],
            **overrides,
        }

    def create_schedule(self, book=None, user=None, **overrides):
        return ScheduledJobs.objects.create(
            **{
                "status": "SCHEDULED",
                "sendAt": datetime(2026, 3, 2, 9, 0, tzinfo=LONDON),
                "time": "09:00",
                "timezone": "Europe/London",
                "frequency": "0,2",
                "book_id": book or self.book,
                "user_id": (user or self.user).id,
                **overrides,
            }
        )

    def test_creates_a_schedule(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ScheduledJobs.objects.count(), 1)

        schedule = ScheduledJobs.objects.get()
        self.assertEqual(schedule.status, "SCHEDULED")
        self.assertEqual(schedule.time, "09:00")
        self.assertEqual(schedule.timezone, "Europe/London")
        self.assertEqual(schedule.frequency, "0,2")
        self.assertEqual(schedule.book_id, self.book)
        self.assertEqual(schedule.user_id, self.user.id)

    def test_sets_send_at_to_the_next_occurrence(self):
        response = self.client.post(self.url, self.payload(), format="json")

        self.assertEqual(response.status_code, 201)

        schedule = ScheduledJobs.objects.get()
        expected = next_occurrence("09:00", "Europe/London", "0,2")
        self.assertEqual(schedule.sendAt, expected)

    def test_stores_frequency_sorted_and_de_duplicated(self):
        response = self.client.post(
            self.url, self.payload(frequency=[4, 0, 4]), format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ScheduledJobs.objects.get().frequency, "0,4")

    def test_accepts_frequency_as_a_comma_separated_string(self):
        response = self.client.post(
            self.url, self.payload(frequency="0,2"), format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ScheduledJobs.objects.get().frequency, "0,2")

    def test_rejects_an_unknown_timezone(self):
        response = self.client.post(
            self.url, self.payload(timezone="Not/AZone"), format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("timezone", response.json())
        self.assertEqual(ScheduledJobs.objects.count(), 0)

    def test_rejects_a_malformed_time(self):
        response = self.client.post(self.url, self.payload(time="9am"), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("time", response.json())
        self.assertEqual(ScheduledJobs.objects.count(), 0)

    def test_rejects_an_invalid_frequency(self):
        for frequency in [[], [7], "monday"]:
            with self.subTest(frequency=frequency):
                response = self.client.post(
                    self.url, self.payload(frequency=frequency), format="json"
                )

                self.assertEqual(response.status_code, 400)
                self.assertIn("frequency", response.json())

        self.assertEqual(ScheduledJobs.objects.count(), 0)

    def test_rejects_a_missing_frequency(self):
        payload = self.payload()
        del payload["frequency"]

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("frequency", response.json())

    def test_ignores_a_book_and_user_supplied_in_the_payload(self):
        other_user = User.objects.create_user(username="someone-else", password="x")
        other_book = Book.objects.create(
            name="Other Book", description="Other", author="Other"
        )

        response = self.client.post(
            self.url,
            self.payload(book_id=other_book.id, user_id=other_user.id),
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        schedule = ScheduledJobs.objects.get()
        self.assertEqual(schedule.book_id, self.book)
        self.assertEqual(schedule.user_id, self.user.id)

    def test_returns_404_for_an_unknown_book(self):
        response = self.client.post(
            "/api/books/999999/schedule", self.payload(), format="json"
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(ScheduledJobs.objects.count(), 0)

    def test_requires_authentication(self):
        anonymous = APIClient()

        self.assertEqual(
            anonymous.post(self.url, self.payload(), format="json").status_code, 401
        )
        self.assertEqual(anonymous.get(self.url).status_code, 401)

    def test_returns_the_latest_schedule(self):
        self.create_schedule(time="07:00")
        self.create_schedule(time="20:30")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["time"], "20:30")

    def test_returns_404_when_the_book_has_no_schedule(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)

    def test_does_not_return_another_users_schedule(self):
        other_user = User.objects.create_user(username="someone-else", password="x")
        self.create_schedule(user=other_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)
