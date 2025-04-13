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

      // 更新統計卡片
      const currentCount = counts[counts.length - 1];
      const prevCount = counts[counts.length - 2];
      const maxCount = Math.max(...counts);
      const minCount = Math.min(...counts);
      const avgCount = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);

      // 計算趨勢
      const trendBadge = document.getElementById('trendBadge');
      if (currentCount > prevCount) {
        trendBadge.textContent = '上升中';
        trendBadge.className = 'trend-badge trend-up';
      } else if (currentCount < prevCount) {
        trendBadge.textContent = '下降中';
        trendBadge.className = 'trend-badge trend-down';
      } else {
        trendBadge.textContent = '持平';
        trendBadge.className = 'trend-badge trend-stable';
      }

      document.getElementById('currentCount').textContent = currentCount;
      document.getElementById('maxCount').textContent = maxCount;
      document.getElementById('minCount').textContent = minCount;
      document.getElementById('avgCount').textContent = avgCount;

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
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderWidth: 2
              },
              {
                label: '趨勢線',
                data: trend,
                fill: false,
                tension: 0.3,
                borderColor: 'rgba(33, 150, 243, 0.8)',
                borderDash: [5, 5],
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              title: {
                display: true,
                text: '圖書館人流量趨勢圖',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: '人數'
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: '時間'
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
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
