// 時間設定
var timeElement = document.getElementById("time");

function updateTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var ampm = hours >= 12 ? '下午' : '上午';

    hours = hours % 12;
    hours = hours ? hours : 12;

    var formattedTime = ampm + ' ' + hours + ':' +
        (minutes < 10 ? "0" : "") + minutes + ':' +
        (seconds < 10 ? "0" : "") + seconds;
    timeElement.textContent = formattedTime;
}
// 每秒更新
updateTime();
setInterval(updateTime, 1000);
// 開啟曲線視窗
function openModal(area) {
    document.getElementById('myModal').style.display = 'block';
    fetch('/data/fetch')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => new Date(a.time) - new Date(b.time));
        
            const labels = data.map(item => item.time);
            const pmValues = data.map(item => item.pm);
            const sensorValues = data.map(item => item.sensor);
        
            const ctx = document.getElementById('dataChart').getContext('2d');
            if (window.myChart instanceof Chart) {
                window.myChart.destroy(); 
            }
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'PM Value',
                            backgroundColor: 'rgb(255, 99, 132)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: pmValues,
                            fill: false, 
                        },

                        {
                            label: 'Sensor Value (°C)',
                            backgroundColor: 'rgb(132, 99, 255)',
                            borderColor: 'rgb(132, 99, 255)',
                            data: sensorValues,
                            fill: false,
                        },
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
        
}


// 關閉曲線視窗
window.onclick = function(event) {
    var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none"; 
    }
}

// 更新風扇狀態
function updateFanStatus() {
    fetch('/data/fetch/fan/latest')
    .then(response => response.json())
    .then(data => {
        const fanStatus = data.fan; 
        const fanElement = document.getElementById('fan2');
        if (fanStatus === 1) {
            fanElement.style.backgroundColor = "rgba(0, 255, 0, 0.795)";
        } else if (fanStatus === 0) {
            fanElement.style.backgroundColor = "rgba(255, 0, 0, 0.795)";
        }
    })
    .catch(error => console.error('Error fetching latest fan status:', error));
}
document.addEventListener('DOMContentLoaded', function() {
    updateFanStatus();

});

// 每5秒檢查一次
setInterval(updateFanStatus, 5000);
// 更新PM狀態
function updatePM2_5Status() {
    fetch('/data/fetch/pm/latest')
    .then(response => response.json())
    .then(data => {
        const pm2_5Value = data.pm;
        const pm2Element = document.getElementById('pm2');
        // 修改範圍
        if (pm2_5Value <2050) {
            // 綠燈
            pm2Element.style.backgroundColor = "rgba(0, 255, 0, 0.795)";
        } else if (pm2_5Value >= 2050 && pm2_5Value < 3000) {
            // 黃燈
            pm2Element.style.backgroundColor = "rgb(255, 238, 0)";
        } else if (pm2_5Value >= 3000) {
            // 紅燈
            pm2Element.style.backgroundColor = "rgba(255, 0, 0, 0.795)";
        }
    })
    .catch(error => console.error('Error fetching latest PM2.5 status:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    updatePM2_5Status();
});
每五秒檢查PM狀態
setInterval(updatePM2_5Status, 5000);
