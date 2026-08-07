import { getBookSchedule, handleScheduleBook } from "@/api/books";
import { ScheduleModal } from "@/components/ScheduleModal";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import dayjs from "dayjs";
import * as React from "react";

jest.mock("@/api/books", () => ({
  getBookSchedule: jest.fn(),
  handleScheduleBook: jest.fn(),
}));

const mockGetBookSchedule = getBookSchedule as jest.MockedFunction<
  typeof getBookSchedule
>;
const mockHandleScheduleBook = handleScheduleBook as jest.MockedFunction<
  typeof handleScheduleBook
>;

const book = {
  id: "1",
  name: "Test Book",
  author: "Test Author",
  createdAt: "2026-03-02T09:00:00Z",
};

const renderModal = (props: Partial<React.ComponentProps<typeof ScheduleModal>> = {}) =>
  render(
    <ScheduleModal
      visible
      item={book}
      onClose={jest.fn()}
      onSuccess={jest.fn()}
      {...props}
    />,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(dayjs.tz, "guess").mockReturnValue("Europe/London");
  mockGetBookSchedule.mockResolvedValue(null);
  mockHandleScheduleBook.mockResolvedValue({
    id: 1,
    time: "08:30",
    timezone: "Europe/London",
    frequency: "0,2",
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ScheduleModal", () => {
  it("renders nothing without a book", () => {
    const { toJSON } = renderModal({ item: null });

    expect(toJSON()).toBeNull();
    expect(mockGetBookSchedule).not.toHaveBeenCalled();
  });

  it("survives going from no book to a book", async () => {
    // The hooks have to run in the same order either way, so this must not
    // throw "rendered more hooks than during the previous render".
    const { rerender } = renderModal({ item: null });

    rerender(
      <ScheduleModal
        visible
        item={book}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );

    expect(await screen.findByText("Test Book (Test Author)")).toBeTruthy();
  });

  it("defaults to the device's time zone when there is no schedule yet", async () => {
    renderModal();

    expect(await screen.findByText(/Europe\/London/)).toBeTruthy();
    expect(screen.getByText("Detected from your device")).toBeTruthy();
    expect(screen.getByText("No days selected")).toBeTruthy();
  });

  it("falls back to UTC when the device time zone can't be read", async () => {
    jest.spyOn(dayjs.tz, "guess").mockImplementation(() => {
      throw new Error("Intl unavailable");
    });

    renderModal();

    expect(await screen.findByText(/UTC/)).toBeTruthy();
  });

  it("pre-fills an existing schedule", async () => {
    mockGetBookSchedule.mockResolvedValue({
      id: 1,
      time: "20:30",
      timezone: "Asia/Tokyo",
      frequency: "4,0,2",
    });

    renderModal();

    expect(await screen.findByDisplayValue("20:30")).toBeTruthy();
    expect(screen.getByText(/Asia\/Tokyo/)).toBeTruthy();
    expect(screen.getByText("Mon, Wed, Fri")).toBeTruthy();
    expect(screen.queryByText("Detected from your device")).toBeNull();
  });

  it("replaces a stored time zone that is no longer valid", async () => {
    mockGetBookSchedule.mockResolvedValue({
      id: 1,
      time: "20:30",
      timezone: "Not/AZone",
      frequency: "0",
    });

    renderModal();

    expect(await screen.findByText(/Europe\/London/)).toBeTruthy();
  });

  it("submits the selected time, zone and days", async () => {
    const onClose = jest.fn();
    const onSuccess = jest.fn();
    renderModal({ onClose, onSuccess });

    fireEvent.changeText(await screen.findByPlaceholderText("08:30"), "08:30");
    fireEvent.press(screen.getByLabelText("Wed"));
    fireEvent.press(screen.getByLabelText("Mon"));
    fireEvent.press(screen.getByText("Schedule"));

    await waitFor(() =>
      expect(mockHandleScheduleBook).toHaveBeenCalledWith({
        book_id: "1",
        time: "08:30",
        timezone: "Europe/London",
        frequency: [0, 2],
      }),
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("de-selects a day that is pressed twice", async () => {
    renderModal();

    const wednesday = await screen.findByLabelText("Wed");

    fireEvent.press(wednesday);
    fireEvent.press(screen.getByLabelText("Fri"));
    expect(await screen.findByText("Wed, Fri")).toBeTruthy();

    fireEvent.press(wednesday);
    fireEvent.press(screen.getByLabelText("Fri"));
    expect(await screen.findByText("No days selected")).toBeTruthy();
  });

  it("rejects a malformed time", async () => {
    renderModal();

    fireEvent.changeText(await screen.findByPlaceholderText("08:30"), "8am");
    fireEvent.press(screen.getByLabelText("Mon"));
    fireEvent.press(screen.getByText("Schedule"));

    expect(
      await screen.findByText("Use a 24 hour time, e.g. 08:30"),
    ).toBeTruthy();
    expect(mockHandleScheduleBook).not.toHaveBeenCalled();
  });

  it("requires at least one day", async () => {
    renderModal();

    fireEvent.changeText(await screen.findByPlaceholderText("08:30"), "08:30");
    fireEvent.press(screen.getByText("Schedule"));

    expect(await screen.findByText("Pick at least one day")).toBeTruthy();
    expect(mockHandleScheduleBook).not.toHaveBeenCalled();
  });

  it("keeps the modal open and reports the problem when saving fails", async () => {
    const onClose = jest.fn();
    mockHandleScheduleBook.mockRejectedValue(new Error("Network error"));
    renderModal({ onClose });

    fireEvent.changeText(await screen.findByPlaceholderText("08:30"), "08:30");
    fireEvent.press(screen.getByLabelText("Mon"));
    fireEvent.press(screen.getByText("Schedule"));

    expect(await screen.findByText("Network error")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("lets the user pick a different time zone from the list", async () => {
    renderModal();

    fireEvent.press(await screen.findByLabelText("Time zone"));

    fireEvent.changeText(
      await screen.findByPlaceholderText("Search time zones"),
      "Tokyo",
    );
    fireEvent.press(await screen.findByText(/Asia\/Tokyo/));

    fireEvent.changeText(screen.getByPlaceholderText("08:30"), "08:30");
    fireEvent.press(screen.getByLabelText("Mon"));
    fireEvent.press(screen.getByText("Schedule"));

    await waitFor(() =>
      expect(mockHandleScheduleBook).toHaveBeenCalledWith(
        expect.objectContaining({ timezone: "Asia/Tokyo" }),
      ),
    );
  });
});
