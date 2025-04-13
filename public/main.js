const dateSelect = document.getElementById('dateSelect');
const chartCanvas = document.getElementById('chart');
let chart;

fetch('data/dates.json')
  .then(res => res.json())
  .then(dates => {
    dates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      dateSelect.appendChild(option);
    });
    loadChart(dates[dates.length - 1]);
  });

dateSelect.addEventListener('change', () => {
  loadChart(dateSelect.value);
});

function loadChart(date) {
  fetch(`data/${date}.json`)
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
      const counts = data.map(d => d.count);

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = counts;
        chart.update();
      } else {
        chart = new Chart(chartCanvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: '在館人數',
              data: counts,
              fill: false,
              tension: 0.1
            }]
          }
        });
      }
    });
}
