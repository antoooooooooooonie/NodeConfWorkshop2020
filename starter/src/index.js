/*
 ** Copyright 2020 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */
import { Temporal } from "proposal-temporal";
import { Record, Tuple, Box } from "@bloomberg/record-tuple-polyfill";

//const now = Temporal.now.absolute()
//const oneTwoThreeNow = #[1, 2, 3, Box(now)];

//console.log(oneTwoThreeNow.slice(0, 3));
//console.log(oneTwoThreeNow[3].unbox().toString());

const timeZones = [];

const table = document.querySelector('#meeting-planner');
const form = document.querySelector('form');
form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const name = form.elements['name'].value;
    const tz = Temporal.TimeZone.from(form.elements['timezone'].value)
    timeZones.push({name, tz});
    console.log(timeZones);

    table.innerHTML = '';
    renderTable();
    getPreferredTimes();
})

console.log(table)

const renderTable = () => {
    const here = Temporal.now.timeZone();
    const now = Temporal.now.instant();

    const calendarNow = now.toZonedDateTimeISO(here);
    const startTime = calendarNow.with({ hour: 0, minute: 0, second: 0})
    .round({ smallestUnit: "second"})
    .toInstant(here);

    timeZones.forEach(({name, tz}) => {
        const tr = document.createElement("tr");
        const title = document.createElement("td");

        title.textContent = name;
        tr.append(title);

        Array.from(Array(24)).forEach((x, i) => {
            const cell = document.createElement('td');
            const dt = startTime.add({ hours: i }).toZonedDateTimeISO(tz);
            cell.className = `time-${dt.hour}`;

            cell.textContent = dt.hour.toString();
            tr.appendChild(cell);
          });

          table.appendChild(tr);
    })
}

const getPreferredTimes = () => {
    // Display local time zone and three others
    const here = Temporal.now.timeZone();
    const now = Temporal.now.instant();
  
    // Start the table at midnight local time
    const calendarNow = now.toZonedDateTimeISO(here);
    const startTime = calendarNow.with({ hour: 0, minute: 0, second: 0})
    .round({ smallestUnit: "second"})
    .toInstant(here);

    // Start with an array representing each hour of the day
    const referenceHours = new Array(24).fill(0);
  
    timeZones.forEach(({ tz }) => {
      for (let hours = 0; hours < 24; hours++) {
        const dt = startTime.add({ hours }).toZonedDateTimeISO(tz);
        // Set null all the hours this timezone cannot do
        referenceHours[hours] = referenceHours[hours] += getHourScore(dt);
      }
    });
    const result = referenceHours.reduce(
      (acc, v, i) => {
        if (v > acc.score) {
          return { idx: i, score: v };
        }
        return acc;
      },
      { idx: 0, score: 0 }
    );
  
    setBorder(result.idx);
  };
  

const setBorder = (idx) => {
    const cells = document.querySelectorAll(`td:nth-child(${idx + 2})`)
    cells.forEach((cell) => {
        cell.classList.add("best-time");
    })
}

const getHourScore = (dt) => {
    const hour = dt.hour;
    if (hour < 22 && hour > 18 ) {
        return 1;
    } else if (hour < 8 || hour > 22) {
        return 0;
    } else {
        return 2;
    }
}