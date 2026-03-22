/* ================================================
   ELITE WALL STREET - API Handler
   ================================================ */

const API = (function() {

    // API Endpoints
    const endpoints = {
        // CoinGecko (Free Crypto API)
        coingecko: {
            base: 'https://api.coingecko.com/api/v3',
            price: '/simple/price',
            markets: '/coins/markets',
            coin: '/coins',
            trending: '/search/trending',
            global: '/global'
        },
        
        // Alternative APIs (Backup)
        coinpaprika: {
            base: 'https://api.coinpaprika.com/v1',
            tickers: '/tickers'
        },

        // Exchange Rate API (Free Forex)
        exchangeRate: {
            base: 'https://api.exchangerate-api.com/v4/latest/USD'
        }
    };

    // Configuration
    const config = {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
        cacheExpiry: 60000 // 1 minute
    };

    // Cache
    let cache = {};

    // Request Queue
    let requestQueue = [];
    let isProcessingQueue = false;

    // Fetch with Timeout
    function fetchWithTimeout(url, options = {}, timeout = config.timeout) {
        return Promise.race([
            fetch(url, options),
            new Promise(function(_, reject) {
                setTimeout(function() {
                    reject(new Error('Request timeout'));
                }, timeout);
            })
        ]);
    }

    // Make API Request
    function request(url, options = {}) {
        return new Promise(function(resolve, reject) {
            // Check cache first
            const cacheKey = url + JSON.stringify(options);
            const cached = getFromCache(cacheKey);
            
            if (cached) {
                Utils.log('API Cache Hit: ' + url, 'info');
                resolve(cached);
                return;
            }

            // Default options
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            const finalOptions = Object.assign({}, defaultOptions, options);

            // Make request with retry logic
            makeRequestWithRetry(url, finalOptions, config.retryAttempts)
                .then(function(data) {
                    // Cache successful response
                    setCache(cacheKey, data);
                    resolve(data);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    // Make Request with Retry
    function makeRequestWithRetry(url, options, attemptsLeft) {
        return fetchWithTimeout(url, options)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                return response.json();
            })
            .catch(function(error) {
                if (attemptsLeft > 1) {
                    Utils.log('API Retry: ' + url + ' (' + attemptsLeft + ' attempts left)', 'warning');
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(makeRequestWithRetry(url, options, attemptsLeft - 1));
                        }, config.retryDelay);
                    });
                }
                throw error;
            });
    }

    // Cache Management
    function getFromCache(key) {
        const item = cache[key];
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            delete cache[key];
            return null;
        }
        
        return item.data;
    }

    function setCache(key, data, expiry = config.cacheExpiry) {
        cache[key] = {
            data: data,
            expiry: Date.now() + expiry
        };
    }

    function clearCache() {
        cache = {};
        Utils.log('API Cache Cleared', 'info');
    }

    // ===== CRYPTO APIs =====

    // Get Multiple Crypto Prices
    function getCryptoPrices(ids, currencies = 'usd') {
        const idsString = Array.isArray(ids) ? ids.join(',') : ids;
        const url = endpoints.coingecko.base + endpoints.coingecko.price + 
                    '?ids=' + idsString + 
                    '&vs_currencies=' + currencies + 
                    '&include_24hr_change=true&include_market_cap=true';

        return request(url)
            .then(function(data) {
                Utils.log('Crypto Prices Fetched', 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Crypto Prices Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get Market Data
    function getMarketData(currency = 'usd', perPage = 20, page = 1) {
        const url = endpoints.coingecko.base + endpoints.coingecko.markets + 
                    '?vs_currency=' + currency + 
                    '&order=market_cap_desc' +
                    '&per_page=' + perPage + 
                    '&page=' + page + 
                    '&sparkline=true&price_change_percentage=1h,24h,7d';

        return request(url)
            .then(function(data) {
                Utils.log('Market Data Fetched: ' + data.length + ' coins', 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Market Data Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get Single Coin Data
    function getCoinData(coinId) {
        const url = endpoints.coingecko.base + endpoints.coingecko.coin + '/' + coinId + 
                    '?localization=false&tickers=false&community_data=false&developer_data=false';

        return request(url)
            .then(function(data) {
                Utils.log('Coin Data Fetched: ' + coinId, 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Coin Data Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get Coin Market Chart
    function getCoinChart(coinId, currency = 'usd', days = 7) {
        const url = endpoints.coingecko.base + endpoints.coingecko.coin + '/' + coinId + 
                    '/market_chart?vs_currency=' + currency + '&days=' + days;

        return request(url)
            .then(function(data) {
                Utils.log('Coin Chart Fetched: ' + coinId, 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Coin Chart Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get OHLC Data (Candlestick)
    function getCoinOHLC(coinId, currency = 'usd', days = 7) {
        const url = endpoints.coingecko.base + endpoints.coingecko.coin + '/' + coinId + 
                    '/ohlc?vs_currency=' + currency + '&days=' + days;

        return request(url)
            .then(function(data) {
                Utils.log('Coin OHLC Fetched: ' + coinId, 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Coin OHLC Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get Trending Coins
    function getTrending() {
        const url = endpoints.coingecko.base + endpoints.coingecko.trending;

        return request(url)
            .then(function(data) {
                Utils.log('Trending Coins Fetched', 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Trending Error: ' + error.message, 'error');
                throw error;
            });
    }

    // Get Global Market Data
    function getGlobalData() {
        const url = endpoints.coingecko.base + endpoints.coingecko.global;

        return request(url)
            .then(function(data) {
                Utils.log('Global Data Fetched', 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Global Data Error: ' + error.message, 'error');
                throw error;
            });
    }

    // ===== FOREX APIs =====

    // Get Exchange Rates
    function getExchangeRates() {
        const url = endpoints.exchangeRate.base;

        return request(url)
            .then(function(data) {
                Utils.log('Exchange Rates Fetched', 'success');
                return data;
            })
            .catch(function(error) {
                Utils.log('Exchange Rates Error: ' + error.message, 'error');
                // Return simulated data as fallback
                return getSimulatedForexData();
            });
    }

    // Get Simulated Forex Data (Fallback)
    function getSimulatedForexData() {
        return {
            base: 'USD',
            rates: {
                EUR: 0.92 + Utils.randomFloat(-0.01, 0.01),
                GBP: 0.79 + Utils.randomFloat(-0.01, 0.01),
                JPY: 149.5 + Utils.randomFloat(-1, 1),
                CHF: 0.88 + Utils.randomFloat(-0.01, 0.01),
                AUD: 1.53 + Utils.randomFloat(-0.02, 0.02),
                CAD: 1.36 + Utils.randomFloat(-0.01, 0.01),
                NZD: 1.65 + Utils.randomFloat(-0.02, 0.02),
                CNY: 7.24 + Utils.randomFloat(-0.05, 0.05)
            }
        };
    }

    // ===== COMMODITIES (Simulated) =====

    // Get Commodity Prices
    function getCommodityPrices() {
        return new Promise(function(resolve) {
            // Simulated commodity data
            const commodities = {
                gold: {
                    price: 2350 + Utils.randomFloat(-20, 20),
                    change: Utils.randomFloat(-1.5, 1.5)
                },
                silver: {
                    price: 28.5 + Utils.randomFloat(-0.5, 0.5),
                    change: Utils.randomFloat(-2, 2)
                },
                oil: {
                    price: 78.5 + Utils.randomFloat(-2, 2),
                    change: Utils.randomFloat(-3, 3)
                },
                platinum: {
                    price: 985 + Utils.randomFloat(-15, 15),
                    change: Utils.randomFloat(-1.5, 1.5)
                },
                copper: {
                    price: 4.25 + Utils.randomFloat(-0.1, 0.1),
                    change: Utils.randomFloat(-2, 2)
                }
            };

            Utils.log('Commodity Prices Fetched (Simulated)', 'success');
            resolve(commodities);
        });
    }

    // ===== COMBINED DATA =====

    // Get All Market Overview
    function getMarketOverview() {
        return Promise.all([
            getMarketData('usd', 10),
            getGlobalData(),
            getCommodityPrices()
        ]).then(function(results) {
            return {
                topCoins: results[0],
                globalData: results[1],
                commodities: results[2]
            };
        });
    }

    // Get Asset Details
    function getAssetDetails(assetId, type = 'crypto') {
        if (type === 'crypto') {
            return Promise.all([
                getCoinData(assetId),
                getCoinChart(assetId, 'usd', 7),
                getCoinOHLC(assetId, 'usd', 7)
            ]).then(function(results) {
                return {
                    info: results[0],
                    chart: results[1],
                    ohlc: results[2]
                };
            });
        } else {
            // Return simulated data for non-crypto assets
            return getCommodityPrices().then(function(data) {
                return {
                    info: data[assetId] || null,
                    chart: generateSimulatedChart(),
                    ohlc: generateSimulatedOHLC()
                };
            });
        }
    }

    // Generate Simulated Chart Data
    function generateSimulatedChart() {
        const prices = [];
        const now = Date.now();
        let price = 100;

        for (let i = 168; i >= 0; i--) {
            price = price + Utils.randomFloat(-2, 2);
            prices.push([now - i * 3600000, price]);
        }

        return { prices: prices };
    }

    // Generate Simulated OHLC Data
    function generateSimulatedOHLC() {
        const ohlc = [];
        const now = Date.now();
        let open = 100;

        for (let i = 7; i >= 0; i--) {
            const high = open + Utils.randomFloat(1, 5);
            const low = open - Utils.randomFloat(1, 5);
            const close = Utils.randomFloat(low, high);
            
            ohlc.push([
                now - i * 86400000,
                open,
                high,
                low,
                close
            ]);
            
            open = close;
        }

        return ohlc;
    }

    // ===== ERROR HANDLING =====

    // Handle API Error
    function handleError(error, context) {
        Utils.log('API Error [' + context + ']: ' + error.message, 'error');
        
        // Dispatch custom event for error handling
        window.dispatchEvent(new CustomEvent('apiError', {
            detail: {
                context: context,
                error: error.message,
                timestamp: Date.now()
            }
        }));

        return null;
    }

    // ===== RATE LIMITING =====

    // Check Rate Limit
    let requestCount = 0;
    let lastResetTime = Date.now();
    const maxRequestsPerMinute = 50;

    function checkRateLimit() {
        const now = Date.now();
        
        // Reset counter every minute
        if (now - lastResetTime > 60000) {
            requestCount = 0;
            lastResetTime = now;
        }

        if (requestCount >= maxRequestsPerMinute) {
            Utils.log('Rate limit reached, waiting...', 'warning');
            return false;
        }

        requestCount++;
        return true;
    }

    // ===== WEBSOCKET SUPPORT (Future) =====

    let websocket = null;

    function connectWebSocket(url, onMessage) {
        if (websocket) {
            websocket.close();
        }

        websocket = new WebSocket(url);

        websocket.onopen = function() {
            Utils.log('WebSocket Connected', 'success');
        };

        websocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error('WebSocket parse error:', e);
            }
        };

        websocket.onerror = function(error) {
            Utils.log('WebSocket Error', 'error');
        };

        websocket.onclose = function() {
            Utils.log('WebSocket Closed', 'warning');
        };

        return websocket;
    }

    function disconnectWebSocket() {
        if (websocket) {
            websocket.close();
            websocket = null;
        }
    }

    // ===== HEALTH CHECK =====

    function healthCheck() {
        const url = endpoints.coingecko.base + '/ping';
        
        return fetchWithTimeout(url, {}, 5000)
            .then(function(response) {
                return response.ok;
            })
            .catch(function() {
                return false;
            });
    }

    // Public API
    return {
        // Core
        request: request,
        clearCache: clearCache,
        
        // Crypto
        getCryptoPrices: getCryptoPrices,
        getMarketData: getMarketData,
        getCoinData: getCoinData,
        getCoinChart: getCoinChart,
        getCoinOHLC: getCoinOHLC,
        getTrending: getTrending,
        getGlobalData: getGlobalData,
        
        // Forex
        getExchangeRates: getExchangeRates,
        
        // Commodities
        getCommodityPrices: getCommodityPrices,
        
        // Combined
        getMarketOverview: getMarketOverview,
        getAssetDetails: getAssetDetails,
        
        // WebSocket
        connectWebSocket: connectWebSocket,
        disconnectWebSocket: disconnectWebSocket,
        
        // Utilities
        healthCheck: healthCheck,
        handleError: handleError
    };

})();

// Make API globally available
window.API = API;

// Log initialization
Utils.log('API Module Loaded', 'success');