let currentStep = 0;

function createNfaVisualization() {
    const svg = d3.select('#visualization svg');
    svg.selectAll('*').remove();  // Clear previous visualization

    // Define marker for arrows
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 9)
        .attr('refY', 5)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('class', 'arrowhead');

    // Handle form submission
    document.getElementById('dfa-form').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get user input
        const statesInput = document.getElementById('states').value.split(',').map(s => s.trim());
        const startState = document.getElementById('start-state').value.trim();
        const acceptStatesInput = document.getElementById('accept-states').value.split(',').map(s => s.trim());
        const transitionsInput = document.getElementById('transitions').value.split(';').map(t => {
            const [from, to, label] = t.split(',').map(s => s.trim());
            return { from, to, label };
        });

        // Prepare data
        const states = statesInput.map(id => ({
            id,
            x: Math.random() * 600 + 100,  // Random position within the canvas
            y: Math.random() * 400 + 100,
            start: id === startState,
            accept: acceptStatesInput.includes(id)
        }));

        // Draw NFA
        svg.selectAll('*').remove();  // Clear previous visualization

        // Draw transitions
        svg.selectAll('.transition')
            .data(transitionsInput)
            .enter()
            .append('line')
            .attr('class', 'arrow')
            .attr('x1', d => states.find(s => s.id === d.from).x)
            .attr('y1', d => states.find(s => s.id === d.from).y)
            .attr('x2', d => states.find(s => s.id === d.to).x)
            .attr('y2', d => states.find(s => s.id === d.to).y)
            .attr('marker-end', 'url(#arrowhead)');

        // Draw transition labels
        svg.selectAll('.transition-label')
            .data(transitionsInput)
            .enter()
            .append('text')
            .attr('class', 'transition-label')
            .attr('x', d => (states.find(s => s.id === d.from).x + states.find(s => s.id === d.to).x) / 2)
            .attr('y', d => (states.find(s => s.id === d.from).y + states.find(s => s.id === d.to).y) / 2)
            .text(d => d.label);

        // Draw states
        svg.selectAll('.state')
            .data(states)
            .enter()
            .append('circle')
            .attr('class', d => {
                let classes = 'state';
                if (d.start) classes += ' start-state';
                if (d.accept) classes += ' accept-state';
                return classes;
            })
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 40); // Increased radius for states

        // Draw accepting state with inner and outer circles
        svg.selectAll('.accept-state-inner')
            .data(states.filter(d => d.accept))
            .enter()
            .append('circle')
            .attr('class', 'accept-state-inner')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 30); // Inner circle radius

        // Add labels to states
        svg.selectAll('.state-label')
            .data(states)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.id);

        // Initialize step-by-step list
        updateStepByStep(transitionsInput, states);

        // Initialize step-by-step transitions
        document.getElementById('next-step').addEventListener('click', function() {
            if (currentStep < transitionsInput.length) {
                highlightStep(transitionsInput[currentStep], states);
                currentStep++;
            }
        });
    });
}

function highlightStep(transition, states) {
    const svg = d3.select('#visualization svg');
    svg.selectAll('.highlight').remove(); // Remove previous highlights

    const fromState = states.find(s => s.id === transition.from);
    const toState = states.find(s => s.id === transition.to);

    // Highlight transition
    svg.selectAll('.arrow')
        .filter(d => d === transition)
        .classed('highlight', true);

    // Highlight states
    svg.selectAll('.state')
        .filter(d => d === fromState || d === toState)
        .classed('highlight', true);
}

function updateStepByStep(transitions, states) {
    const stepsList = document.getElementById('steps-list');
    stepsList.innerHTML = ''; // Clear previous steps

    transitions.forEach((transition, index) => {
        const fromState = states.find(s => s.id === transition.from);
        const toState = states.find(s => s.id === transition.to);

        const listItem = document.createElement('li');
        listItem.textContent = `Step ${index + 1}: From ${fromState.id} to ${toState.id} with label '${transition.label}'`;
        stepsList.appendChild(listItem);
    });
}

// Show tab function
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active-tab');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Initialize the NFA visualization on page load
document.addEventListener('DOMContentLoaded', createNfaVisualization);
