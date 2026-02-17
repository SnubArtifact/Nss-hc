export const combineDateTime = (
  dateInput: string | Date,
  timeString: string
) => {
  const date = new Date(dateInput);
  const timeParts = timeString.split(":");

  if (timeParts.length >= 2) {
    const h = parseInt(timeParts[0]!, 10);
    const m = parseInt(timeParts[1]!, 10);

    if (!isNaN(h) && !isNaN(m)) {
      date.setHours(h, m, 0, 0);
    } else {
      throw new Error("Error in date time conversion");
    }
  } else {
    throw new Error("Invalid time format");
  }
  return date;
};

export const separateDateTime = (dateTimeObject: string) => {
  const date = new Date(dateTimeObject);

  const padTo2Digits = (num: number) => num.toString().padStart(2, "0");

  const dateString = [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");

  const timeString = [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(":");

  return { date: dateString, time: timeString };
};
