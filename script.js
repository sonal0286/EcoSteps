// Enhanced JavaScript functionality
let calculationCount = parseInt(sessionStorage.getItem('calculationCount') || '0');
let footprintHistory = JSON.parse(sessionStorage.getItem('footprintHistory') || '[]');

// Function to show a custom message box (replaces alert())
function showMessageBox(message) {
  const messageBox = document.createElement('div');
  messageBox.className = 'custom-message-box';
  messageBox.innerHTML = `
    <div class="message-content">
      <p>${message}</p>
      <button class="message-button">OK</button>
    </div>
  `;
  document.body.appendChild(messageBox);

  // Center the message box
  messageBox.style.top = `${window.scrollY + window.innerHeight / 2}px`;
  messageBox.style.left = `${window.innerWidth / 2}px`;

  messageBox.querySelector('.message-button').addEventListener('click', () => {
    messageBox.remove();
  });

  // Remove after a few seconds if not clicked
  setTimeout(() => {
    if (messageBox.parentNode) {
      messageBox.remove();
    }
  }, 5000); // Remove after 5 seconds
}


// Floating elements animation
function createFloatingElements() {
  const container = document.getElementById('floatingElements');
  const emojis = ['🌿', '🌱', '🍃', '♻️', '🌍', '💚', '🌳', '☘️'];

  // Clear existing intervals to prevent duplicates on re-render/reload
  if (window.floatingElementsInterval) {
    clearInterval(window.floatingElementsInterval);
  }

  window.floatingElementsInterval = setInterval(() => {
    const element = document.createElement('div');
    element.className = 'floating-element';
    element.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    element.style.left = Math.random() * 100 + '%';
    element.style.animationDuration = (Math.random() * 10 + 15) + 's';

    container.appendChild(element);

    setTimeout(() => {
      element.remove();
    }, 25000);
  }, 3000);
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach(el => {
  observer.observe(el);
});

// Enhanced form submission
document.getElementById('carbonForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const submitBtn = this.querySelector('.submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const loading = submitBtn.querySelector('.loading');

  // Show loading state
  btnText.style.display = 'none';
  loading.style.display = 'inline-block';
  submitBtn.disabled = true;

  // Simulate calculation delay for better UX
  setTimeout(() => {
    calculateFootprint();

    // Reset button state
    btnText.style.display = 'inline';
    loading.style.display = 'none';
    submitBtn.disabled = false;
  }, 1500);
});

function calculateFootprint() {
  const travel = parseFloat(document.getElementById('travel').value);
  const electricity = parseFloat(document.getElementById('electricity').value);
  const meat = parseFloat(document.getElementById('meat').value);
  const screen = parseFloat(document.getElementById('screen').value);

  if (isNaN(travel) || isNaN(electricity) || isNaN(meat) || isNaN(screen)) {
    showMessageBox('Please enter valid numbers for all fields.'); // Replaced alert()
    return;
  }

  // Enhanced calculation with more realistic factors
  const travelEmission = travel * 0.21;
  const electricityEmission = electricity * 0.5;
  const meatEmission = meat * 0.43; // More accurate per meal
  const screenEmission = screen * 0.08; // Device + data center emissions

  const totalFootprint = travelEmission + electricityEmission + meatEmission + screenEmission;
  const roundedFootprint = totalFootprint.toFixed(2);

  // Update result display
  const resultSection = document.getElementById('resultSection');
  const footprintValue = document.getElementById('footprintValue');
  const progressBar = document.getElementById('progressBar');
  const comparisonText = document.getElementById('comparisonText');

  footprintValue.textContent = roundedFootprint;

  // Animate progress bar (max 10kg for scale)
  const progressPercent = Math.min((totalFootprint / 10) * 100, 100);
  setTimeout(() => {
    progressBar.style.width = progressPercent + '%';
  }, 100);

  // Show result section
  resultSection.classList.add('show');

  // Comparison with global average
  const globalAverage = 5.0;
  const comparison = totalFootprint > globalAverage ? 'above' : 'below';
  const difference = Math.abs(totalFootprint - globalAverage).toFixed(2);

  comparisonText.innerHTML = `
    <p style="margin-top: 20px; font-size: 1.1rem; color: ${totalFootprint > globalAverage ? '#f44336' : '#4caf50'};">
      Your footprint is ${difference} kg ${comparison} the global average of ${globalAverage} kg/day
    </p>
  `;

  // Update breakdown chart
  updateBreakdownChart(travelEmission, electricityEmission, meatEmission, screenEmission, totalFootprint);

  // Update progress tracking
  updateProgressTracking(totalFootprint);

  // Generate personalized tips
  generateEcoTips(travel, electricity, meat, screen, totalFootprint);

  // Scroll to results
  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

function updateBreakdownChart(travel, electricity, meat, screen, total) {
  const chart = document.getElementById('breakdownChart');
  chart.style.display = 'block';

  const categories = [
    { id: 'travel', value: travel, max: total },
    { id: 'electricity', value: electricity, max: total },
    { id: 'meat', value: meat, max: total },
    { id: 'screen', value: screen, max: total }
  ];

  categories.forEach(category => {
    const bar = document.getElementById(category.id + 'Bar');
    const valueEl = document.getElementById(category.id + 'Value');
    const percentage = (category.value / category.max) * 100;

    setTimeout(() => {
      bar.style.width = percentage + '%';
    }, 500);

    valueEl.textContent = category.value.toFixed(2) + ' kg';
  });
}

function updateProgressTracking(currentFootprint) {
  calculationCount++;
  footprintHistory.push({
    value: currentFootprint,
    date: new Date().toISOString().split('T')[0]
  });

  // Keep only last 10 calculations
  if (footprintHistory.length > 10) {
    footprintHistory = footprintHistory.slice(-10);
  }

  // Update session storage
  sessionStorage.setItem('calculationCount', calculationCount.toString());
  sessionStorage.setItem('footprintHistory', JSON.stringify(footprintHistory));

  // Update stats dashboard
  document.getElementById('currentFootprint').textContent = currentFootprint.toFixed(2);
  document.getElementById('calculations').textContent = calculationCount;

  const progressMessage = document.getElementById('progressMessage');

  if (footprintHistory.length > 1) {
    const lastFootprint = footprintHistory[footprintHistory.length - 2].value;
    const change = ((currentFootprint - lastFootprint) / lastFootprint * 100);

    document.getElementById('lastFootprint').textContent = lastFootprint.toFixed(2);
    document.getElementById('improvement').textContent = change.toFixed(1);
    document.getElementById('improvement').style.color = change < 0 ? '#4caf50' : '#f44336';

    const emoji = change < 0 ? '🎉' : change > 0 ? '⚠️' : '➡️';
    const message = change < -5 ? 'Excellent improvement!' :
                   change < 0 ? 'Good progress!' :
                   change > 5 ? 'Consider making some changes' : 'Keep up the good work!';

    progressMessage.innerHTML = `
      <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 15px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 10px 0; color: #2d5016;">${emoji} ${message}</h3>
        <p style="margin: 0; color: #666;">
          ${change < 0 ? 'Decreased' : change > 0 ? 'Increased' : 'No change'} by ${Math.abs(change).toFixed(1)}% from your last calculation
        </p>
      </div>
    `;
  } else {
    document.getElementById('lastFootprint').textContent = '--';
    document.getElementById('improvement').textContent = '--';
    progressMessage.innerHTML = `
      <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 15px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 10px 0; color: #2d5016;">🌱 Welcome to EcoSteps!</h3>
        <p style="margin: 0; color: #666;">This is your first calculation. Keep tracking to see your progress over time!</p>
      </div>
    `;
  }

  renderFootprintChart(footprintHistory);


}

function generateEcoTips(travel, electricity, meat, screen, totalFootprint) {
  const tipsContainer = document.getElementById('ecoTips');
  const tips = [];

  // Comprehensive tip generation based on user data
  if (travel > 50) {
    tips.push({
      icon: '🚴‍♂️',
      title: 'Reduce Travel Emissions',
      content: 'Consider carpooling, public transport, or cycling for shorter trips. Even reducing travel by 20% can significantly lower your footprint.'
    });
  } else if (travel > 20) {
    tips.push({
      icon: '�',
      title: 'Optimize Your Commute',
      content: 'Try combining errands into one trip or work from home when possible. Electric vehicles can reduce emissions by up to 60%.'
    });
  }

  if (electricity > 15) {
    tips.push({
      icon: '💡',
      title: 'Energy Efficiency',
      content: 'Switch to LED bulbs, unplug devices when not in use, and consider renewable energy sources. Smart thermostats can save 10-15% on energy bills.'
    });
  } else if (electricity > 8) {
    tips.push({
      icon: '🏠',
      title: 'Home Energy Savings',
      content: 'Improve insulation, use energy-efficient appliances, and take advantage of natural lighting during the day.'
    });
  }

  if (meat > 10) {
    tips.push({
      icon: '🌱',
      title: 'Sustainable Diet',
      content: 'Try "Meatless Mondays" or plant-based alternatives. Reducing meat consumption by just 2 meals per week can cut food emissions by 15%.'
    });
  } else if (meat > 5) {
    tips.push({
      icon: '🥗',
      title: 'Balanced Nutrition',
      content: 'Consider locally-sourced and seasonal foods. Organic and local produce can reduce transportation emissions significantly.'
    });
  }

  if (screen > 8) {
    tips.push({
      icon: '📱',
      title: 'Digital Detox',
      content: 'Reduce screen brightness, enable dark mode, and take regular breaks. Streaming and gaming are major energy consumers.'
    });
  } else if (screen > 4) {
    tips.push({
      icon: '💻',
      title: 'Eco-Friendly Tech',
      content: 'Use energy-saving modes, close unused apps, and consider the environmental impact of cloud storage and streaming.'
    });
  }

  // Add general tips based on total footprint
  if (totalFootprint < 3) {
    tips.push({
      icon: '🏆',
      title: 'Eco Champion!',
      content: 'Amazing! Your footprint is well below average. Share your habits with friends and family to inspire others.'
    });
  } else if (totalFootprint > 7) {
    tips.push({
      icon: '🎯',
      title: 'Quick Wins',
      content: 'Focus on the biggest impact areas first. Small changes in transportation and energy use can make a huge difference.'
    });
  }

  // Always include a general sustainability tip
  const generalTips = [
    {
      icon: '♻️',
      title: 'Waste Reduction',
      content: 'Reduce, reuse, recycle. Choose products with minimal packaging and consider buying second-hand when possible.'
    },
    {
      icon: '🌳',
      title: 'Nature Connection',
      content: 'Support reforestation projects, plant trees, or maintain a garden. Every tree planted can absorb 22kg of CO₂ annually.'
    },
    {
      icon: '💚',
      title: 'Sustainable Shopping',
      content: 'Choose sustainable brands, buy local products, and consider the lifecycle impact of your purchases.'
    }
  ];

  if (tips.length < 3) {
    const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];
    tips.push(randomTip);
  }

  // Render tips with staggered animation
  tipsContainer.innerHTML = '';
  tips.forEach((tip, index) => {
    const tipCard = document.createElement('div');
    tipCard.className = 'tip-card';
    tipCard.innerHTML = `
      <span class="tip-icon">${tip.icon}</span>
      <h3 style="margin: 0 0 15px 0; color: #2d5016; font-size: 1.2rem;">${tip.title}</h3>
      <p style="margin: 0; color: #666; line-height: 1.6;">${tip.content}</p>
    `;

    tipsContainer.appendChild(tipCard);

    // Staggered animation
    setTimeout(() => {
      tipCard.classList.add('show');
    }, index * 200);
  });
}

// Initialize floating elements
createFloatingElements();

// Add some interactive hover effects
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-8px) scale(1.02)';
  });

  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(-5px) scale(1)';
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  const rate = scrolled * -0.5;

  if (hero) {
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Add input validation and real-time feedback
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('input', function() {
    const value = parseFloat(this.value);
    if (value < 0) {
      this.style.borderColor = '#f44336';
      this.setCustomValidity('Value must be positive');
    } else if (isNaN(value) && this.value !== '') {
      this.style.borderColor = '#f44336';
      this.setCustomValidity('Please enter a valid number');
    } else {
      this.style.borderColor = '#4caf50';
      this.setCustomValidity('');
    }
  });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Press Enter on hero section to scroll to form
  if (e.key === 'Enter' && window.scrollY < window.innerHeight / 2) {
    document.getElementById('carbonForm').scrollIntoView({ behavior: 'smooth' });
  }
});

// Add some easter eggs for engagement
let clickCount = 0;
document.querySelector('.hero h1').addEventListener('click', function() {
  clickCount++;
  if (clickCount === 5) {
    this.style.animation = 'textShine 0.5s ease-in-out infinite alternate';
    setTimeout(() => {
      this.style.animation = 'textShine 3s ease-in-out infinite alternate';
    }, 3000);
  }
});

// Progressive Web App features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Service worker would go here for offline functionality
    console.log('EcoSteps Enhanced - Ready for offline capabilities');
  });
}

// Add smooth transitions when switching between sections
const sections = document.querySelectorAll('section');
let currentSection = 0;

function navigateToSection(index) {
  if (index >= 0 && index < sections.length) {
    sections[index].scrollIntoView({ behavior: 'smooth' });
    currentSection = index;
  }
}

// Arrow key navigation
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
      e.preventDefault();
      navigateToSection(currentSection + 1);
    } else if (e.key === 'ArrowUp' && currentSection > 0) {
      e.preventDefault();
      navigateToSection(currentSection - 1);
    }
  }
});

// Add loading states and micro-interactions
document.querySelectorAll('button, .cta-button').forEach(button => {
  button.addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation (moved from inside the event listener to global scope)
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  /* Custom message box styles */
  .custom-message-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    text-align: center;
    max-width: 300px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .custom-message-box .message-content p {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 20px;
  }
  .custom-message-box .message-button {
    background: linear-gradient(135deg, #4caf50, #81c784);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .custom-message-box .message-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
  }
`;
document.head.appendChild(style);

console.log('🌿 EcoSteps Enhanced - Loaded successfully!');

let chartInstance = null;

function renderFootprintChart(history) {
  const ctx = document.getElementById('footprintChart').getContext('2d');

  const labels = history.map(entry => entry.date);
  const data = history.map(entry => entry.value);

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'kg CO₂ per day',
        data: data,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Emissions (kg/day)' }
        },
        x: {
          title: { display: true, text: 'Date' }
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y} kg CO₂`
          }
        }
      }
    }
  });
}

// Initial render of the chart if there's existing history
document.addEventListener('DOMContentLoaded', () => {
  if (footprintHistory.length > 0) {
    renderFootprintChart(footprintHistory);
    updateProgressTracking(footprintHistory[footprintHistory.length - 1].value); // Update dashboard with last entry
  } else {
    // Initialize dashboard if no history
    document.getElementById('currentFootprint').textContent = '0.00';
    document.getElementById('lastFootprint').textContent = '--';
    document.getElementById('improvement').textContent = '--';
    document.getElementById('calculations').textContent = '0';
    document.getElementById('progressMessage').innerHTML = `
      <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 15px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 10px 0; color: #2d5016;">🌱 Welcome to EcoSteps!</h3>
        <p style="margin: 0; color: #666;">This is your first calculation. Keep tracking to see your progress over time!</p>
      </div>
    `;
  }
});