import moment from 'moment';

export const getHumanTime = name => {
  let humanTime = '';
  const currentTime = moment();

  const morning = moment('04:30', 'HH:mm');
  const noon = moment('12:00', 'HH:mm');
  const evening = moment('06:00', 'HH:mm');
  const night = moment('09:00', 'HH:mm');

  if (currentTime.isBetween(morning, noon)) {
    humanTime = `Good morning, ${name}`;
  } else if (currentTime.isBetween(noon, evening)) {
    humanTime = `Good afternoon, ${name}`;
  } else if (currentTime.isBetween(evening, night)) {
    humanTime = `Good evening, ${name}`;
  } else {
    humanTime = `Welcome back, ${name}`;
  }

  return humanTime;
};
