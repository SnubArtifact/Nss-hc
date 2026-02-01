export const combineDateTime = (dateString: string, timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(dateString);
  if (hours && minutes) {
    date.setHours(hours, minutes, 0, 0);
  } else {
    throw new Error("Error in date time conversion");
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
