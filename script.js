window.onload = function() {
    const quoteBox = document.getElementById('quoteText');
    if (quoteBox) getQuote();

    if (document.getElementById('dogCarousel')) {
        loadDogCarousel();
        loadDogBreeds();
    }

    if (document.getElementById('stockTicker')) {
        document.querySelector('button').addEventListener('click', lookupStock);
    }
    if (document.getElementById('stockTicker')) {
        document.querySelector('button').addEventListener('click', lookupStock);
        loadRedditStocks();  

        if (annyang) {
            const commands = {
                'lookup stock *ticker': function(ticker) {
                    const cleanedTicker = ticker.replace(/\s+/g, '').toUpperCase();
                    document.getElementById('stockTicker').value = cleanedTicker;
                    lookupStock();
                },
                'navigate to *page': function(page) {
                    if (page.includes('stock')) location.href = 'stocks.html';
                    else if (page.includes('dog')) location.href = 'dogs.html';
                    else location.href = 'index.html';
                },
                'change the color to *color': function(color) {
                    document.body.style.backgroundColor = color;
                },
                'hello': function() {
                    alert('Hello back to you!');
                }
            };
            annyang.addCommands(commands);
            annyang.start();
        }
        
    }
    
};

function getQuote() {
    fetch('https://zenquotes.io/api/random')
        .then(res => res.json())
        .then(data => {
            document.getElementById('quoteText').innerText = `"${data[0].q}" — ${data[0].a}`;
        });
}

function lookupStock() {
    const ticker = document.getElementById('stockTicker').value.toUpperCase();
    const range = parseInt(document.getElementById('range').value, 10);
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - range)).toISOString().split('T')[0];

    fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=nKfhqJOZPkKZTQpxhvMPBO0FsAWEzh1u`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                alert('No data found for this ticker.');
                return;
            }

            const labels = data.results.map(d => new Date(d.t).toLocaleDateString());
            const prices = data.results.map(d => d.c);

            const ctx = document.getElementById('stockChart').getContext('2d');
            if (window.stockChartInstance) {
                window.stockChartInstance.destroy();
            }
            window.stockChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${ticker} Stock Price`,
                        data: prices,
                        borderColor: 'blue',
                        fill: false
                    }]
                }
            });
        })
        .catch(err => {
            console.error(err);
            alert('Error fetching stock data.');
        });
}

function loadDogCarousel() {
    fetch('https://dog.ceo/api/breeds/image/random/10')
        .then(res => res.json())
        .then(data => {
            const carousel = document.getElementById('dogCarousel');
            data.message.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                carousel.appendChild(img);
            });
            new SimpleSlider('.slider');
        });
}

function loadDogBreeds() {
    fetch('https://api.thedogapi.com/v1/breeds')
        .then(res => res.json())
        .then(breeds => {
            const shuffled = breeds.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 10);

            const container = document.getElementById('breedButtons');
            selected.forEach(breed => {
                const btn = document.createElement('button');
                btn.innerText = breed.name;
                btn.className = 'breed-button';
                btn.setAttribute('data-id', breed.id);
                btn.addEventListener('click', () => showBreedInfo(breed));
                container.appendChild(btn);
            });

            if (annyang) {
                const commands = {
                    'load dog breed *name': function(name) {
                        const match = selected.find(b => b.name.toLowerCase() === name.toLowerCase());
                        if (match) showBreedInfo(match);
                        else alert('Breed not in top 10 selection!');
                    }
                };
                annyang.addCommands(commands);
                annyang.start();
            }
        });
}

function showBreedInfo(breed) {
    const info = document.getElementById('breedInfo');
    info.style.display = 'block';
    info.innerHTML = `
        <h3>${breed.name}</h3>
        <p>${breed.bred_for || 'No description available.'}</p>
        <p>Life Span: ${breed.life_span}</p>
    `;
}

function fetchDog() {
    fetch('https://dog.ceo/api/breeds/image/random')
        .then(res => res.json())
        .then(data => {
            document.getElementById('dogImage').innerHTML = `<img src="${data.message}" width="300">`;
        });
}

function startListening() {
    if (annyang) {
        const commands = {
            'navigate to *page': function(page) {
                if (page.includes('stock')) location.href = 'stocks.html';
                else if (page.includes('dog')) location.href = 'dogs.html';
                else location.href = 'index.html';
            },
            'change the color to *color': function(color) {
                document.body.style.backgroundColor = color;
            },
            'hello': function() {
                alert('Hello back to you!');
            }
        };
        annyang.addCommands(commands);
        annyang.start();
    }
}

function stopListening() {
    if (annyang) annyang.abort();
}
function loadRedditStocks() {
    fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03')
        .then(res => res.json())
        .then(data => {
            const top5 = data.slice(0, 5);
            const tbody = document.querySelector('#redditTable tbody');
            top5.forEach(stock => {
                const row = document.createElement('tr');

                const tickerCell = document.createElement('td');
                const tickerLink = document.createElement('a');
                tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
                tickerLink.textContent = stock.ticker;
                tickerLink.target = '_blank';
                tickerCell.appendChild(tickerLink);

                const commentCell = document.createElement('td');
                commentCell.textContent = stock.no_of_comments;

                const sentimentCell = document.createElement('td');
                const sentimentIcon = document.createElement('span');
                sentimentIcon.classList.add('sentiment-icon');
                if (stock.sentiment.toLowerCase() === 'bullish') {
                    sentimentIcon.textContent = '📈'; // bullish icon
                } else if (stock.sentiment.toLowerCase() === 'bearish') {
                    sentimentIcon.textContent = '📉'; // bearish icon
                } else {
                    sentimentIcon.textContent = '➖'; // neutral or unknown
                }
                sentimentCell.appendChild(sentimentIcon);

                row.appendChild(tickerCell);
                row.appendChild(commentCell);
                row.appendChild(sentimentCell);

                tbody.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            alert('Error loading Reddit stocks.');
        });
}





