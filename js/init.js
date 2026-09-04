export function initApp() {
    initApiCards();
    initRequestBuilder();
    initParams();
    initTabs();
}

function initApiCards() {
    const cards = document.querySelectorAll('.api-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function initRequestBuilder() {
    const sendBtn = document.getElementById('btn-send');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    sendBtn.addEventListener('click', async () => {
        const method = document.getElementById('req-method').value;
        const url = document.getElementById('req-url').value;
        
        loadingOverlay.classList.add('active');
        
        try {
            const startTime = performance.now();
            const response = await fetch(url, { method });
            const endTime = performance.now();
            const data = await response.json();
            
            updateResponseMeta(response.status, endTime - startTime);
            updateResponseContent(data);
        } catch (error) {
            updateResponseMeta('ERROR', 0);
            updateResponseContent({ error: error.message });
        } finally {
            loadingOverlay.classList.remove('active');
        }
    });
}

function initParams() {
    const addParamBtn = document.getElementById('btn-add-param');
    const paramsList = document.getElementById('params-list');
    
    addParamBtn.addEventListener('click', () => {
        const paramRow = document.createElement('div');
        paramRow.className = 'param-row';
        paramRow.innerHTML = `
            <input type="text" class="param-key" placeholder="Key">
            <input type="text" class="param-value" placeholder="Value">
            <button class="param-remove">
                <span class="iconify" data-icon="ph:x"></span>
            </button>
        `;
        paramsList.appendChild(paramRow);
        
        paramRow.querySelector('.param-remove').addEventListener('click', () => {
            paramRow.remove();
        });
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

function updateResponseMeta(status, time) {
    const statusEl = document.getElementById('meta-status');
    const timeEl = document.getElementById('meta-time');
    
    statusEl.textContent = status;
    statusEl.className = 'meta-status ' + (status === 200 ? 'success' : 'error');
    timeEl.textContent = `${Math.round(time)} ms`;
}

function updateResponseContent(data) {
    const codeEl = document.getElementById('response-code');
    codeEl.textContent = JSON.stringify(data, null, 2);
}