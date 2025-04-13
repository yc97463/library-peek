const dateSelect = document.getElementById('dateSelect');
const chartCanvas = document.getElementById('chart');
let chart;

const fetchOptions = {
  cache: 'no-store',  // HTTP no-cache
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

fetch('data/dates.json', fetchOptions)
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
  fetch(`data/${date}.json`, fetchOptions)
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
      const counts = data.map(d => d.count);

      // 計算移動平均趨勢線 (5點移動平均)
      const trend = calculateMovingAverage(counts, 5);

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets = [
          {
            label: '即時人數',
            data: counts,
            fill: false,
            tension: 0.1,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          },
          {
            label: '趨勢線',
            data: trend,
            fill: false,
            tension: 0.3,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderDash: [5, 5],
            pointRadius: 0
          }
        ];
        chart.update();
      } else {
        chart = new Chart(chartCanvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: '即時人數',
                data: counts,
                fill: false,
                tension: 0.1,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)'
              },
              {
                label: '趨勢線',
                data: trend,
                fill: false,
                tension: 0.3,
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderDash: [5, 5],
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              title: {
                display: true,
                text: '圖書館人流量趨勢圖'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: '人數'
                }
              },
              x: {
                title: {
                  display: true,
                  text: '時間'
                }
              }
            }
          }
        });
      }
    });
}

// 計算移動平均
function calculateMovingAverage(data, window) {
  return data.map((val, idx, arr) => {
    const start = Math.max(0, idx - Math.floor(window / 2));
    const end = Math.min(arr.length, start + window);
    const sum = arr.slice(start, end).reduce((a, b) => a + b, 0);
    return sum / (end - start);
  });
}
