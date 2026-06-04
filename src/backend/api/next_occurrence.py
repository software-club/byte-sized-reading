from datetime import datetime, timedelta
from zoneinfo import ZoneInfo


def next_occurrence(
    time_of_day: str,
    timezone: str,
    frequency: str,  # 0=Monday ... 6=Sunday
) -> datetime:
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)

    hour, minute = map(int, time_of_day.split(":"))
    frequency = [int(x) for x in frequency.split(',')]
    print(frequency)
    for days_ahead in range(8):  # max one week lookahead
        candidate_date = now.date() + timedelta(days=days_ahead)

        if candidate_date.weekday() not in frequency:
            continue

        candidate = datetime(
            candidate_date.year,
            candidate_date.month,
            candidate_date.day,
            hour,
            minute,
            tzinfo=tz,
        )

        if candidate > now:
            return candidate

    raise ValueError("No matching occurrence found")
