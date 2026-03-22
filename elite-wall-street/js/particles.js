/* ================================================
   ELITE WALL STREET - Particle System
   ================================================ */

const ParticleSystem = (function() {
    
    // Configuration
    const config = {
        particleCount: 80,
        particleColor: 'rgba(255, 0, 51, 0.5)',
        lineColor: 'rgba(255, 0, 51, 0.1)',
        particleMinSize: 1,
        particleMaxSize: 3,
        speed: 0.5,
        connectionDistance: 150,
        mouseRadius: 100,
        mouseForce: 0.02
    };

    // Variables
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationId = null;
    let mouse = {
        x: null,
        y: null,
        radius: config.mouseRadius
    };
    let isRunning = false;

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * (config.particleMaxSize - config.particleMinSize) + config.particleMinSize;
            this.baseSize = this.size;
            this.speedX = (Math.random() - 0.5) * config.speed;
            this.speedY = (Math.random() - 0.5) * config.speed;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceX = (dx / distance) * force * config.mouseForce;
                    const forceY = (dy / distance) * force * config.mouseForce;
                    
                    this.speedX -= forceX;
                    this.speedY -= forceY;
                    this.size = this.baseSize + force * 2;
                } else {
                    this.size = this.baseSize;
                }
            }

            // Movement
            this.x += this.speedX;
            this.y += this.speedY;

            // Boundary check
            if (this.x < 0) {
                this.x = canvas.width;
            } else if (this.x > canvas.width) {
                this.x = 0;
            }

            if (this.y < 0) {
                this.y = canvas.height;
            } else if (this.y > canvas.height) {
                this.y = 0;
            }

            // Speed decay
            this.speedX *= 0.99;
            this.speedY *= 0.99;

            // Minimum speed
            if (Math.abs(this.speedX) < 0.1) {
                this.speedX = (Math.random() - 0.5) * config.speed;
            }
            if (Math.abs(this.speedY) < 0.1) {
                this.speedY = (Math.random() - 0.5) * config.speed;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor.replace('0.5', this.opacity.toString());
            ctx.fill();
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections between particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    const opacity = 1 - (distance / config.connectionDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = config.lineColor.replace('0.1', (opacity * 0.2).toString());
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        if (!isRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(function(particle) {
            particle.update();
            particle.draw();
        });

        // Draw connections
        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    // Resize handler
    function handleResize() {
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Reinitialize particles on resize
        initParticles();
    }

    // Mouse move handler
    function handleMouseMove(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }

    // Mouse leave handler
    function handleMouseLeave() {
        mouse.x = null;
        mouse.y = null;
    }

    // Touch move handler
    function handleTouchMove(event) {
        if (event.touches.length > 0) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }

    // Touch end handler
    function handleTouchEnd() {
        mouse.x = null;
        mouse.y = null;
    }

    // Initialize
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.warn('Particle canvas not found:', canvasId);
            return false;
        }

        ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize particles
        initParticles();

        // Event listeners
        window.addEventListener('resize', Utils.debounce(handleResize, 250));
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        Utils.log('Particle System Initialized', 'success');
        return true;
    }

    // Start animation
    function start() {
        if (!canvas || isRunning) return;
        
        isRunning = true;
        animate();
        Utils.log('Particle Animation Started', 'info');
    }

    // Stop animation
    function stop() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        Utils.log('Particle Animation Stopped', 'info');
    }

    // Pause animation
    function pause() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Resume animation
    function resume() {
        if (!isRunning) {
            isRunning = true;
            animate();
        }
    }

    // Update configuration
    function setConfig(newConfig) {
        Object.assign(config, newConfig);
        initParticles();
    }

    // Get configuration
    function getConfig() {
        return { ...config };
    }

    // Destroy
    function destroy() {
        stop();
        
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        particles = [];
        canvas = null;
        ctx = null;

        Utils.log('Particle System Destroyed', 'warning');
    }

    // Add burst effect
    function burst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle();
            particle.x = x;
            particle.y = y;
            particle.speedX = (Math.random() - 0.5) * 5;
            particle.speedY = (Math.random() - 0.5) * 5;
            particle.size = Math.random() * 4 + 2;
            particle.opacity = 1;
            particles.push(particle);
        }

        // Remove extra particles after animation
        setTimeout(function() {
            particles.splice(config.particleCount);
        }, 2000);
    }

    // Public API
    return {
        init: init,
        start: start,
        stop: stop,
        pause: pause,
        resume: resume,
        setConfig: setConfig,
        getConfig: getConfig,
        destroy: destroy,
        burst: burst
    };

})();

// Make ParticleSystem globally available
window.ParticleSystem = ParticleSystem;

// Log initialization
Utils.log('Particles Module Loaded', 'success');