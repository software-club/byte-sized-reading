import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Days are stored the way datetime.weekday() reports them: 0=Monday ... 6=Sunday.
MONDAY = 0
SUNDAY = 6
DAYS_IN_WEEK = 7

TIME_OF_DAY_PATTERN = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def parse_timezone(timezone: str) -> ZoneInfo:
    """Return the ZoneInfo for an IANA timezone name, or raise ValueError."""
    try:
        return ZoneInfo(timezone)
    except (KeyError, ValueError, TypeError):
        raise ValueError(f"Unknown timezone: {timezone!r}")


def parse_time_of_day(time_of_day: str) -> tuple[int, int]:
    """Return (hour, minute) for a 24 hour HH:MM string, or raise ValueError."""
    if not isinstance(time_of_day, str) or not TIME_OF_DAY_PATTERN.match(time_of_day):
        raise ValueError(f"Time must be in 24 hour HH:MM format, got {time_of_day!r}")

    hour, minute = time_of_day.split(":")
    return int(hour), int(minute)


def parse_frequency(frequency) -> list[int]:
    """Return a sorted, de-duplicated list of weekdays, or raise ValueError.

    Accepts either a list of days or the comma separated string they are
    stored as, e.g. [0, 2] or "0,2".
    """
    if isinstance(frequency, (list, tuple)):
        parts = [str(part).strip() for part in frequency]
    else:
        parts = [part.strip() for part in str(frequency).split(",")]

    days: list[int] = []
    for part in parts:
        if not part:
            continue
        if not part.isdigit() or not MONDAY <= int(part) <= SUNDAY:
            raise ValueError(
                f"Frequency must be days between {MONDAY} (Monday) and "
                f"{SUNDAY} (Sunday), got {part!r}"
            )
        days.append(int(part))

    if not days:
        raise ValueError("Frequency must contain at least one day of the week")

    return sorted(set(days))


def next_occurrence(
    time_of_day: str,
    timezone: str,
    frequency,
    now: datetime | None = None,
) -> datetime:
    """Return the next datetime the schedule is due, in its own timezone."""
    tz = parse_timezone(timezone)
    hour, minute = parse_time_of_day(time_of_day)
    days = parse_frequency(frequency)

    now = now.astimezone(tz) if now is not None else datetime.now(tz)

    # A weekday always comes round within a week. Look one week ahead plus
    # today, so a slot that has already passed today rolls to the same
    # weekday next week.
    for days_ahead in range(DAYS_IN_WEEK + 1):
        candidate_date = now.date() + timedelta(days=days_ahead)

        if candidate_date.weekday() not in days:
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
