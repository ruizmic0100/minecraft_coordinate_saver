const form = document.getElementById('coordForm');
const listContainer = document.getElementById('coordsList');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');

// Load coords on startup
let savedCoords = [];
try {

	const stored = localStorage.getItem('mc_coords');
	if (stored) {
		savedCoords = JSON.parse(stored);
	}
} catch (e) {
	console.error("Error parsing saved coordinates. Resetting list.", e);
	savedoords = [];
}

// Safety Check: ensure it's an array before using it
if (!Array.isArray(savedCoords)) {
	savedCoords = [];
}


renderList();

// Handle Form Submit
form.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get Values
	const label = document.getElementById('label').value;
	const x = document.getElementById('x').value;
	const y = document.getElementById('y').value;
	const z = document.getElementById('z').value;

	// Get selected dimension
	const dimension = document.querySelector('input[name="dimension"]:checked').value;

	// Create object
	const entry = {
		id: Date.now(), // simple unique ID
		label,
		x,
		y,
		z,
		dimension,
		date: new Date().toLocaleDateString()
	};

	// Save
	savedCoords.unshift(entry); // Add to top
	saveToLocal();

	// Reset form but keep dimensions
	document.getElementById('label').value = '';
	document.getElementById('x').value = '';
	document.getElementById('y').value = '';
	document.getElementById('z').value = '';

	renderList();
});

// Save to localStorage
function saveToLocal() {
	try {
		localStorage.setItem('mc_coords', JSON.stringify(savedCoords));
		console.log("Coordinates saved:", savedCoords.length);
	} catch (e) {
		console.error("Save failed:", e);
		alert("Unable to save coordinates. LocalStorage might be disabled or full.");

	}
}

// Render the list
function renderList() {
	listContainer.innerHTML = '';

	if (savedCoords.length === 0) {
		listContainer.appendChild(emptyState);
		return;
	}

	savedCoords.forEach(coord => {
const el = document.createElement('div');
		el.className = 'mc-card p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gray-500 transition-colors';
		
		// Color code dimension tag
		let dimColor = 'bg-green-900 text-green-200';
		if(coord.dimension === 'Nether') dimColor = 'bg-red-900 text-red-200';
		if(coord.dimension === 'End') dimColor = 'bg-purple-900 text-purple-200';

		el.innerHTML = `
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<span class="font-bold text-lg text-white">${escapeHtml(coord.label)}</span>
					<span class="text-xs px-2 py-0.5 rounded-full ${dimColor} border border-opacity-20 border-white">${coord.dimension}</span>
				</div>
				<div class="font-mono text-gray-400 flex gap-4 text-sm">
					<span class="flex items-center gap-1"><span class="text-red-500">X:</span> ${coord.x}</span>
					<span class="flex items-center gap-1"><span class="text-green-500">Y:</span> ${coord.y}</span>
					<span class="flex items-center gap-1"><span class="text-blue-500">Z:</span> ${coord.z}</span>
				</div>
			</div>
			
			<div class="flex items-center gap-2 mt-2 sm:mt-0">
				<button onclick="copyToClipboard('${coord.x} ${coord.y} ${coord.z}')" 
					class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Copy Coords">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
					</svg>
				</button>
				<button onclick="deleteEntry(${coord.id})" 
					class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/30 rounded transition-colors" title="Delete">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			</div>
		`;
		listContainer.appendChild(el);
	});
}

// Delete entry
function deleteEntry(id) {
	if (confirm('Are you sure you want to delete this location?')) {
		savedCoords = savedCoords.filter(c => c.id !== id);
		saveToLocal();
		renderList();
	}
}

// Clear all
function clearAll() {
	if (savedCoords.length === 0) return;
	if (confirm('Delete ALL saved coordinates. This cannot be undone.')) {
		savedCoords = [];
		saveToLocal();
		renderList();
	}
}

// Export data to file
function exportData() {
	if (savedCoords.length === 0) {
		alert("No coordinates to export!");
		return;
	}

	// Create the file content
	const dataStr = JSON.stringify(savedCoords, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });

	// Create a temporary download link
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = "minecraft_coordinates.json"; // The default filename

	// Trigger the download
	document.body.appendChild(a);
	a.click();

	// Cleanup
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// Copy functionality
function copyToClipboard(text) {
	// Using modern clipboard API if available, fallback to textarea
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).then(showToast, (err) => {
			console.error('Could not copy text: ', err);
		});
	} else {
		// Fallback for older browsers or iframe constraints
		let textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-9999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
			showToast();
		} catch (err) {
			console.error('Fallback: Oops, unable to copy', err);
		}
		document.body.removeChild(textArea);
	}
}

// Show Toast Notification
function showToast() {
	toast.classList.remove('translate-y-20', 'opacity-0');
	setTimeout(() => {
		toast.classList.add('translate-y-20', 'opacity-0');
	}, 2000);
}

// Security Helper
function escapeHtml(text) {
	if (!text) return text;
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


