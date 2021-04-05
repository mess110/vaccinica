#!/usr/bin/env node

const today = new Date();
const todayTimestamp = today.getTime();
const yesterdayTimestamp = todayTimestamp - (24*3600*1000);
const yesterday = new Date(yesterdayTimestamp);

const yesterdayDateString = '' + yesterday.getDate() + '.' + yesterday.getMonth() + '.' + yesterday.getFullYear();
console.log(yesterdayDateString);
