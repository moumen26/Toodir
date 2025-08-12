import moment from "moment";

export const formatDate = (dateString) => {
  const outputFormat = "D-MM-YYYY [at] HH:mm:ss";

  // Create moment instance with English locale without changing global locale
  const date = moment(dateString);
  
  return date.format(outputFormat);
};
