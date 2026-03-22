/* ================================================
   ELITE WALL STREET - Charts System
   ================================================ */

const Charts = (function() {

    // Chart instances storage
    let chartInstances = {};

    // Default Chart Configuration
    const defaultConfig = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#b0b0b0',
                borderColor: 'rgba(255, 0, 51, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                displayColors: false,
                titleFont: {
                    family: "'Orbitron', sans-serif",
                    size: 12,
                    weight: 'bold'
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        return '$' + context.parsed.y.toLocaleString();
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#707070',
                    font: {
                        family: "'Rajdhani', sans-serif",
                        size: 11
                    },
                    maxRotation: 0
                }
            },
            y: {
                display: true,
                position: 'right',
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#707070',
                    font: {
                        family: "'Rajdhani', sans-serif",
                        size: 11
                    },
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    // Color Schemes
    const colors = {
        primary: '#ff0033',
        primaryLight: '#ff3366',
        primaryGlow: 'rgba(255, 0, 51, 0.5)',
        success: '#00ff88',
        successDark: '#00cc6a',
        danger: '#ff4444',
        dangerDark: '#cc3333',
        gradient: {
            start: 'rgba(255, 0, 51, 0.3)',
            end: 'rgba(255, 0, 51, 0)'
        }
    };

    // Create Gradient
    function createGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // Initialize Chart
    function init(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.warn('Chart canvas not found:', canvasId);
            return null;
        }

        // Destroy existing chart if any
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const ctx = canvas.getContext('2d');
        const mergedOptions = mergeOptions(defaultConfig, options);

        const chart = new Chart(ctx, {
            type: type,
            data: data,
            options: mergedOptions
        });

        chartInstances[canvasId] = chart;
        
        Utils.log('Chart Initialized: ' + canvasId, 'success');
        return chart;
    }

    // Merge Options Deep
    function mergeOptions(defaults, custom) {
        const result = JSON.parse(JSON.stringify(defaults));
        
        function merge(target, source) {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        if (!target[key]) target[key] = {};
                        merge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
        
        merge(result, custom);
        return result;
    }

    // Create Line Chart
    function createLineChart(canvasId, labels, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const gradient = createGradient(ctx, colors.gradient.start, colors.gradient.end);

        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: colors.primary,
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.primary,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        };

        return init(canvasId, 'line', chartData, options);
    }

    // Create Area Chart
    function createAreaChart(canvasId, labels, data, isPositive = true, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const color = isPositive ? colors.success : colors.danger;
        const gradientStart = isPositive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
        const gradientEnd = isPositive ? 'rgba(0, 255, 136, 0)' : 'rgba(255, 68, 68, 0)';
        const gradient = createGradient(ctx, gradientStart, gradientEnd);

        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        };

        return init(canvasId, 'line', chartData, options);
    }

    // Create Candlestick Chart (using bar chart simulation)
    function createCandlestickChart(canvasId, ohlcData, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        // Process OHLC data
        const labels = [];
        const dataUp = [];
        const dataDown = [];

        ohlcData.forEach(function(item, index) {
            const timestamp = item[0];
            const open = item[1];
            const high = item[2];
            const low = item[3];
            const close = item[4];

            const date = new Date(timestamp);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const isUp = close >= open;
            
            if (isUp) {
                dataUp.push({
                    x: index,
                    y: [open, close],
                    high: high,
                    low: low
                });
                dataDown.push(null);
            } else {
                dataDown.push({
                    x: index,
                    y: [close, open],
                    high: high,
                    low: low
                });
                dataUp.push(null);
            }
        });

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Up',
                    data: dataUp.map(function(d) { return d ? d.y[1] - d.y[0] : 0; }),
                    backgroundColor: colors.success,
                    borderColor: colors.success,
                    borderWidth: 1
                },
                {
                    label: 'Down',
                    data: dataDown.map(function(d) { return d ? d.y[1] - d.y[0] : 0; }),
                    backgroundColor: colors.danger,
                    borderColor: colors.danger,
                    borderWidth: 1
                }
            ]
        };

        const candleOptions = {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: false,
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        };

        return init(canvasId, 'bar', chartData, mergeOptions(candleOptions, options));
    }

    // Create Bar Chart
    function createBarChart(canvasId, labels, data, options = {}) {
        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: data.map(function(value) {
                    return value >= 0 ? colors.success : colors.danger;
                }),
                borderColor: data.map(function(value) {
                    return value >= 0 ? colors.successDark : colors.dangerDark;
                }),
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        const barOptions = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        return init(canvasId, 'bar', chartData, mergeOptions(barOptions, options));
    }

    // Create Doughnut Chart
    function createDoughnutChart(canvasId, labels, data, chartColors = null, options = {}) {
        const defaultColors = [
            '#ff0033', '#00ff88', '#ffaa00', '#00aaff', '#ff66cc',
            '#66ff66', '#ff9933', '#9966ff', '#ff6666', '#66ffff'
        ];

        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors || defaultColors.slice(0, data.length),
                borderColor: 'rgba(0, 0, 0, 0.5)',
                borderWidth: 2,
                hoverOffset: 10
            }]
        };

        const doughnutOptions = {
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#b0b0b0',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return context.label + ': ' + percentage + '%';
                        }
                    }
                }
            }
        };

        return init(canvasId, 'doughnut', chartData, mergeOptions(doughnutOptions, options));
    }

    // Create Mini Sparkline Chart
    function createSparkline(canvasId, data, isPositive = true, options = {}) {
        const color = isPositive ? colors.success : colors.danger;

        const chartData = {
            labels: data.map(function(_, i) { return i; }),
            datasets: [{
                data: data,
                borderColor: color,
                borderWidth: 1.5,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        };

        const sparklineOptions = {
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: {
                    borderCapStyle: 'round'
                }
            }
        };

        return init(canvasId, 'line', chartData, mergeOptions(sparklineOptions, options));
    }

    // Create Hero Chart (For Landing Page) - ✅ FIXED
    function createHeroChart(canvasId, hours) {
        // Default to 4 hours if not provided
        hours = hours || 4;
        
        // Generate data based on timeframe
        var labels = [];
        var data = [];
        var price = 65000;
        var points, intervalHours, labelFormat;

        // Set points and interval based on timeframe
        if (hours === 1) {
            points = 12;
            intervalHours = 0.083;
            labelFormat = { hour: '2-digit', minute: '2-digit' };
        } else if (hours === 4) {
            points = 24;
            intervalHours = 0.167;
            labelFormat = { hour: '2-digit', minute: '2-digit' };
        } else if (hours === 24) {
            points = 24;
            intervalHours = 1;
            labelFormat = { hour: '2-digit', minute: '2-digit' };
        } else if (hours === 168) {
            points = 28;
            intervalHours = 6;
            labelFormat = { month: 'short', day: 'numeric', hour: '2-digit' };
        } else {
            points = 24;
            intervalHours = 0.167;
            labelFormat = { hour: '2-digit', minute: '2-digit' };
        }

        // Generate labels and data
        for (var i = points; i >= 0; i--) {
            var date = new Date();
            date.setHours(date.getHours() - (i * intervalHours));
            labels.push(date.toLocaleTimeString('en-US', labelFormat));
            
            var volatility = hours === 1 ? 300 : (hours === 4 ? 500 : 800);
            price = price + Utils.randomFloat(-volatility, volatility);
            data.push(price);
        }

        var heroOptions = {
            plugins: {
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxTicksLimit: 6
                    }
                },
                y: {
                    display: true
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        };

        return createLineChart(canvasId, labels, data, mergeOptions(heroOptions, {}));
    }

    // Update Chart Data
    function updateChart(canvasId, newData, newLabels = null) {
        const chart = chartInstances[canvasId];
        
        if (!chart) {
            console.warn('Chart not found:', canvasId);
            return false;
        }

        if (newLabels) {
            chart.data.labels = newLabels;
        }

        chart.data.datasets.forEach(function(dataset, index) {
            if (Array.isArray(newData[index])) {
                dataset.data = newData[index];
            } else if (newData.data) {
                dataset.data = newData.data;
            }
        });

        chart.update('active');
        return true;
    }

    // Add Data Point
    function addDataPoint(canvasId, label, data) {
        const chart = chartInstances[canvasId];
        
        if (!chart) return false;

        chart.data.labels.push(label);
        chart.data.datasets.forEach(function(dataset, index) {
            const value = Array.isArray(data) ? data[index] : data;
            dataset.data.push(value);
        });

        // Keep last 50 points
        if (chart.data.labels.length > 50) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(function(dataset) {
                dataset.data.shift();
            });
        }

        chart.update('active');
        return true;
    }

    // Remove Data Point
    function removeDataPoint(canvasId) {
        const chart = chartInstances[canvasId];
        
        if (!chart) return false;

        chart.data.labels.shift();
        chart.data.datasets.forEach(function(dataset) {
            dataset.data.shift();
        });

        chart.update('active');
        return true;
    }

    // Reset Chart
    function resetChart(canvasId) {
        const chart = chartInstances[canvasId];
        
        if (!chart) return false;

        chart.data.labels = [];
        chart.data.datasets.forEach(function(dataset) {
            dataset.data = [];
        });

        chart.update();
        return true;
    }

    // Change Chart Type
    function changeChartType(canvasId, newType) {
        const chart = chartInstances[canvasId];
        
        if (!chart) return false;

        chart.config.type = newType;
        chart.update();
        return true;
    }

    // Get Chart Instance
    function getChart(canvasId) {
        return chartInstances[canvasId] || null;
    }

    // Destroy Chart
    function destroyChart(canvasId) {
        const chart = chartInstances[canvasId];
        
        if (chart) {
            chart.destroy();
            delete chartInstances[canvasId];
            Utils.log('Chart Destroyed: ' + canvasId, 'info');
            return true;
        }
        
        return false;
    }

    // Destroy All Charts
    function destroyAll() {
        Object.keys(chartInstances).forEach(function(canvasId) {
            chartInstances[canvasId].destroy();
        });
        
        chartInstances = {};
        Utils.log('All Charts Destroyed', 'warning');
    }

    // Resize Chart
    function resizeChart(canvasId) {
        const chart = chartInstances[canvasId];
        
        if (chart) {
            chart.resize();
            return true;
        }
        
        return false;
    }

    // Resize All Charts
    function resizeAll() {
        Object.keys(chartInstances).forEach(function(canvasId) {
            chartInstances[canvasId].resize();
        });
    }

    // Export Chart as Image
    function exportAsImage(canvasId, filename = 'chart.png') {
        const chart = chartInstances[canvasId];
        
        if (!chart) return null;

        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();

        return true;
    }

    // Generate Random Chart Data (For Testing)
    function generateRandomData(points = 24, min = 100, max = 200) {
        const data = [];
        let value = (min + max) / 2;

        for (let i = 0; i < points; i++) {
            value = value + Utils.randomFloat(-10, 10);
            value = Math.max(min, Math.min(max, value));
            data.push(value);
        }

        return data;
    }

    // Generate Time Labels
    function generateTimeLabels(points = 24, intervalHours = 1) {
        const labels = [];
        const now = new Date();

        for (let i = points - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * intervalHours * 3600000);
            labels.push(date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }));
        }

        return labels;
    }

    // Generate Date Labels
    function generateDateLabels(points = 7) {
        const labels = [];
        const now = new Date();

        for (let i = points - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 86400000);
            labels.push(date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }));
        }

        return labels;
    }

    // Public API
    return {
        // Core
        init: init,
        getChart: getChart,
        
        // Chart Types
        createLineChart: createLineChart,
        createAreaChart: createAreaChart,
        createCandlestickChart: createCandlestickChart,
        createBarChart: createBarChart,
        createDoughnutChart: createDoughnutChart,
        createSparkline: createSparkline,
        createHeroChart: createHeroChart,
        
        // Data Management
        updateChart: updateChart,
        addDataPoint: addDataPoint,
        removeDataPoint: removeDataPoint,
        resetChart: resetChart,
        changeChartType: changeChartType,
        
        // Lifecycle
        destroyChart: destroyChart,
        destroyAll: destroyAll,
        resizeChart: resizeChart,
        resizeAll: resizeAll,
        
        // Utilities
        exportAsImage: exportAsImage,
        generateRandomData: generateRandomData,
        generateTimeLabels: generateTimeLabels,
        generateDateLabels: generateDateLabels,
        
        // Configuration
        colors: colors
    };

})();

// Make Charts globally available
window.Charts = Charts;

// Handle window resize
window.addEventListener('resize', Utils.debounce(function() {
    Charts.resizeAll();
}, 250));

// Log initialization
Utils.log('Charts Module Loaded', 'success');