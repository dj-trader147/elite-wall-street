/* ================================================
   ELITE WALL STREET - Live Ticker System
   ================================================ */

const Ticker = (function() {

    // Configuration
    const config = {
        updateInterval: 5000, // 5 seconds
        retryDelay: 10000, // 10 seconds on error
        maxRetries: 3,
        animationSpeed: 60, // seconds for full scroll
        apiEndpoint: 'https://api.coingecko.com/api/v3/simple/price'
    };

    // Assets to track
    const assets = [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
        { id: 'ripple', symbol: 'XRP', name: 'Ripple', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
        { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
        { id: 'polygon', symbol: 'MATIC', name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
        { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' },
        { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
        { id: 'stellar', symbol: 'XLM', name: 'Stellar', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png' },
        { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', icon: 'https://cryptologos.cc/logos/cosmos-atom-logo.png' }
    ];

    // Forex & Commodities (simulated)
    const forexAssets = [
        { id: 'gold', symbol: 'GOLD', name: 'Gold', icon: 'https://img.icons8.com/color/48/gold-bars.png', basePrice: 2350 },
        { id: 'silver', symbol: 'SILVER', name: 'Silver', icon: 'https://img.icons8.com/color/48/silver-bars.png', basePrice: 28.5 },
        { id: 'oil', symbol: 'OIL', name: 'Crude Oil', icon: 'https://img.icons8.com/color/48/oil-industry.png', basePrice: 78.5 },
        { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro/USD', icon: 'https://img.icons8.com/color/48/euro-pound-exchange.png', basePrice: 1.085 },
        { id: 'gbpusd', symbol: 'GBP/USD', name: 'Pound/USD', icon: 'https://img.icons8.com/color/48/british-pound.png', basePrice: 1.268 }
    ];

    // State
    let tickerTrack = null;
    let statusElement = null;
    let updateIntervalId = null;
    let isRunning = false;
    let retryCount = 0;
    let lastPrices = {};
    let priceHistory = {};

    // Initialize
    function init() {
        tickerTrack = document.getElementById('tickerTrack');
        statusElement = document.getElementById('tickerStatus');

        if (!tickerTrack) {
            console.warn('Ticker track element not found');
            return false;
        }

        // Create initial ticker items
        createTickerItems();

        // Start fetching prices
        fetchPrices();

        Utils.log('Ticker Initialized', 'success');
        return true;
    }

    // Create Ticker Items
    function createTickerItems() {
        tickerTrack.innerHTML = '';

        // Create items for all assets
        const allAssets = [...assets, ...forexAssets];

        // Create two sets for infinite scroll
        for (let i = 0; i < 2; i++) {
            allAssets.forEach(function(asset) {
                const item = createTickerItem(asset);
                tickerTrack.appendChild(item);
            });
        }
    }

    // Create Single Ticker Item
    function createTickerItem(asset) {
        const item = document.createElement('div');
        item.className = 'ticker-item';
        item.setAttribute('data-id', asset.id);

        const price = lastPrices[asset.id] || asset.basePrice || 0;
        const change = priceHistory[asset.id] ? calculateChange(asset.id) : 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeIcon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

        item.innerHTML = `
            <img src="${asset.icon}" alt="${asset.symbol}" class="ticker-icon" onerror="this.src='https://via.placeholder.com/32'">
            <div class="ticker-info">
                <span class="ticker-name">${asset.symbol}</span>
                <span class="ticker-symbol">${asset.name}</span>
            </div>
            <div class="ticker-price-info">
                <span class="ticker-price">$${formatPrice(price)}</span>
                <span class="ticker-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Math.abs(change).toFixed(2)}%
                </span>
            </div>
        `;

        // Click handler
        item.addEventListener('click', function() {
            handleTickerClick(asset);
        });

        return item;
    }

    // Format Price
    function formatPrice(price) {
        if (price === 0 || price === undefined) return '0.00';
        
        if (price >= 1000) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (price >= 1) {
            return price.toFixed(2);
        } else {
            return price.toFixed(4);
        }
    }

    // Calculate Price Change
    function calculateChange(assetId) {
        const history = priceHistory[assetId];
        if (!history || history.length < 2) {
            return Utils.randomFloat(-5, 5, 2);
        }

        const oldPrice = history[0];
        const newPrice = history[history.length - 1];
        return ((newPrice - oldPrice) / oldPrice) * 100;
    }

    // Fetch Prices from API
    function fetchPrices() {
        if (!isRunning) {
            isRunning = true;
        }

        const ids = assets.map(function(a) { return a.id; }).join(',');
        const url = `${config.apiEndpoint}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

        fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('API response not ok');
                }
                return response.json();
            })
            .then(function(data) {
                handlePriceData(data);
                updateStatus(true);
                retryCount = 0;

                // Schedule next update
                scheduleNextUpdate(config.updateInterval);
            })
            .catch(function(error) {
                console.error('Ticker fetch error:', error);
                handleFetchError();
            });

        // Also update forex/commodities with simulated data
        updateForexPrices();
    }

    // Handle Price Data
    function handlePriceData(data) {
        assets.forEach(function(asset) {
            if (data[asset.id]) {
                const price = data[asset.id].usd;
                const change = data[asset.id].usd_24h_change || 0;

                // Store price history
                if (!priceHistory[asset.id]) {
                    priceHistory[asset.id] = [];
                }
                priceHistory[asset.id].push(price);

                // Keep only last 10 prices
                if (priceHistory[asset.id].length > 10) {
                    priceHistory[asset.id].shift();
                }

                lastPrices[asset.id] = price;

                // Update ticker items
                updateTickerItem(asset.id, price, change);
            }
        });
    }

    // Update Forex Prices (Simulated)
    function updateForexPrices() {
        forexAssets.forEach(function(asset) {
            // Simulate price change
            const changePercent = Utils.randomFloat(-0.5, 0.5, 2);
            const basePrice = asset.basePrice;
            const newPrice = basePrice * (1 + changePercent / 100);

            // Store price history
            if (!priceHistory[asset.id]) {
                priceHistory[asset.id] = [];
            }
            priceHistory[asset.id].push(newPrice);

            if (priceHistory[asset.id].length > 10) {
                priceHistory[asset.id].shift();
            }

            lastPrices[asset.id] = newPrice;

            // Update ticker items
            updateTickerItem(asset.id, newPrice, changePercent);
        });
    }

    // Update Single Ticker Item
    function updateTickerItem(assetId, price, change) {
        const items = tickerTrack.querySelectorAll(`[data-id="${assetId}"]`);

        items.forEach(function(item) {
            const priceElement = item.querySelector('.ticker-price');
            const changeElement = item.querySelector('.ticker-change');

            if (priceElement) {
                // Animate price change
                const oldPrice = parseFloat(priceElement.textContent.replace(/[$,]/g, ''));
                if (oldPrice !== price) {
                    animatePriceChange(priceElement, price);
                }
            }

            if (changeElement) {
                const isPositive = change >= 0;
                changeElement.className = `ticker-change ${isPositive ? 'positive' : 'negative'}`;
                changeElement.innerHTML = `
                    <i class="fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    ${Math.abs(change).toFixed(2)}%
                `;
            }
        });
    }

    // Animate Price Change
    function animatePriceChange(element, newPrice) {
        element.style.transition = 'transform 0.3s ease';
        element.style.transform = 'scale(1.1)';
        
        setTimeout(function() {
            element.textContent = '$' + formatPrice(newPrice);
            element.style.transform = 'scale(1)';
        }, 150);
    }

    // Handle Fetch Error
    function handleFetchError() {
        retryCount++;
        updateStatus(false);

        if (retryCount <= config.maxRetries) {
            Utils.log(`Ticker retry ${retryCount}/${config.maxRetries}`, 'warning');
            scheduleNextUpdate(config.retryDelay);
        } else {
            Utils.log('Ticker max retries reached, using cached data', 'error');
            // Use simulated data as fallback
            simulatePriceUpdates();
            scheduleNextUpdate(config.updateInterval);
        }
    }

    // Simulate Price Updates (Fallback)
    function simulatePriceUpdates() {
        assets.forEach(function(asset) {
            let basePrice = lastPrices[asset.id] || getDefaultPrice(asset.id);
            let changePercent = Utils.randomFloat(-2, 2, 2);
            let newPrice = basePrice * (1 + changePercent / 100);

            lastPrices[asset.id] = newPrice;
            updateTickerItem(asset.id, newPrice, changePercent);
        });
    }

    // Get Default Price
    function getDefaultPrice(assetId) {
        const defaults = {
            'bitcoin': 67000,
            'ethereum': 3500,
            'solana': 145,
            'binancecoin': 580,
            'ripple': 0.52,
            'cardano': 0.45,
            'dogecoin': 0.12,
            'polkadot': 7.5,
            'avalanche-2': 35,
            'chainlink': 14,
            'polygon': 0.70,
            'litecoin': 85,
            'uniswap': 7.8,
            'stellar': 0.11,
            'cosmos': 8.5
        };
        return defaults[assetId] || 100;
    }

    // Schedule Next Update
    function scheduleNextUpdate(delay) {
        if (updateIntervalId) {
            clearTimeout(updateIntervalId);
        }

        updateIntervalId = setTimeout(function() {
            fetchPrices();
        }, delay);
    }

    // Update Status Indicator
    function updateStatus(connected) {
        if (!statusElement) return;

        const textElement = statusElement.querySelector('.status-text');
        const iconElement = statusElement.querySelector('.status-icon');

        if (connected) {
            statusElement.classList.remove('error');
            if (textElement) textElement.textContent = 'Connected';
            if (iconElement) iconElement.innerHTML = '<i class="fas fa-wifi"></i>';
        } else {
            statusElement.classList.add('error');
            if (textElement) textElement.textContent = 'Reconnecting...';
            if (iconElement) iconElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }
    }

    // Handle Ticker Item Click
    function handleTickerClick(asset) {
        Utils.log(`Ticker clicked: ${asset.symbol}`, 'info');

        // Navigate to market page with asset
        if (window.location.pathname.includes('market.html')) {
            // Already on market page, show asset chart
            if (window.MarketCharts) {
                window.MarketCharts.showAsset(asset.id);
            }
        } else {
            // Navigate to market page
            window.location.href = `market.html?asset=${asset.id}`;
        }
    }

    // Start Ticker
    function start() {
        if (isRunning) return;

        isRunning = true;
        fetchPrices();

        // Resume animation
        if (tickerTrack) {
            tickerTrack.style.animationPlayState = 'running';
        }

        Utils.log('Ticker Started', 'info');
    }

    // Stop Ticker
    function stop() {
        isRunning = false;

        if (updateIntervalId) {
            clearTimeout(updateIntervalId);
            updateIntervalId = null;
        }

        // Pause animation
        if (tickerTrack) {
            tickerTrack.style.animationPlayState = 'paused';
        }

        Utils.log('Ticker Stopped', 'info');
    }

    // Pause Ticker
    function pause() {
        if (tickerTrack) {
            tickerTrack.style.animationPlayState = 'paused';
        }
    }

    // Resume Ticker
    function resume() {
        if (tickerTrack) {
            tickerTrack.style.animationPlayState = 'running';
        }
    }

    // Get Current Prices
    function getPrices() {
        return { ...lastPrices };
    }

    // Get Asset Price
    function getPrice(assetId) {
        return lastPrices[assetId] || null;
    }

    // Get Assets List
    function getAssets() {
        return [...assets, ...forexAssets];
    }

    // Refresh Prices
    function refresh() {
        fetchPrices();
    }

    // Destroy
    function destroy() {
        stop();

        if (tickerTrack) {
            tickerTrack.innerHTML = '';
        }

        lastPrices = {};
        priceHistory = {};
        tickerTrack = null;
        statusElement = null;

        Utils.log('Ticker Destroyed', 'warning');
    }

    // Public API
    return {
        init: init,
        start: start,
        stop: stop,
        pause: pause,
        resume: resume,
        getPrices: getPrices,
        getPrice: getPrice,
        getAssets: getAssets,
        refresh: refresh,
        destroy: destroy
    };

})();

// Make Ticker globally available
window.Ticker = Ticker;

// Log initialization
Utils.log('Ticker Module Loaded', 'success');