function insertProject(project) {
    const projectHTML = `
        <div class="imgContainer">
            <img src="${project.image}" alt="${project.title}">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <a class="button" href="${project.path}" target="_blank" rel="noopener">לדף הפרויקט</a>
        </div>
    `;
    return projectHTML;
}

function insertProjectsToContainer(projectData, projectsSelector) {
    const ProjectsContainer = document.querySelector(projectsSelector)
    ProjectsContainer.innerHTML = ''; // Clear any existing content

    projectData.forEach(project => {
        ProjectsContainer.innerHTML += insertProject(project);
    });
}

function fetchProjects() {
    // Fetch the JSON data and populate the projects section.
    // Returns the parsed data (or null on failure) so callers can also know
    // which project names are already shown, to avoid duplicating them elsewhere.
    return fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            insertProjectsToContainer(data['css-projects'], '.css-projects');
            insertProjectsToContainer(data['js-projects'], '.js-projects');
            return data;
        })
        .catch(error => {
            console.error('Error fetching the project data:', error);
            return null;
        });
}

const LINKS_API_BASE = 'https://star-projects-home.star69995.workers.dev';

function insertLinkProject(link) {
    // data-manual marks a description typed in the admin editor, which wins over the
    // auto-fetched og:description below - everyone else's description is filled in for free.
    const hasManualDescription = Boolean(link.description);
    return `
        <div class="imgContainer">
            <img class="link-thumb" data-url="${link.url}" alt="${link.name}" loading="lazy">
            <h3>${link.name}</h3>
            <p class="link-description" data-manual="${hasManualDescription}">${link.description || ''}</p>
            <a class="button" href="${link.url}" target="_blank" rel="noopener">לאתר הפרויקט</a>
        </div>
    `;
}

// The worker returns JSON ({url, source, description}), not the image itself, so each
// thumbnail (and its auto-fetched description, pulled from the target site's own
// og:description) is loaded async after the cards are already in the DOM.
function loadLinkThumbnails(container) {
    container.querySelectorAll('.link-thumb').forEach(img => {
        fetch(`${LINKS_API_BASE}/api/thumbnail?url=${encodeURIComponent(img.dataset.url)}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                if (!data) return;
                img.src = data.url;
                const descriptionEl = img.closest('.imgContainer')?.querySelector('.link-description');
                if (descriptionEl && descriptionEl.dataset.manual !== 'true' && data.description) {
                    descriptionEl.textContent = data.description;
                }
            })
            .catch(() => {});
    });
}

// Names that should never show up as a dynamic "additional project" card,
// regardless of what the link-manager worker returns.
const DYNAMIC_PROJECT_EXCLUDED_NAMES = ['האתר של סטאר'];

function fetchDynamicProjects(existingProjectNames = []) {
    // Fetch externally-hosted project links from the link-manager worker.
    // The section stays hidden (no space reserved on the page) until links actually load.
    const section = document.querySelector('#new-projects');
    const navItem = document.querySelector('#new-projects-nav-item');
    const container = section?.querySelector('.dynamic-projects');
    if (!container) return;

    fetch(`${LINKS_API_BASE}/api/links`)
        .then(response => {
            if (!response.ok) throw new Error(`bad status ${response.status}`);
            return response.json();
        })
        .then(links => {
            // Skip links that duplicate a project already shown in the JS projects
            // section, and links explicitly excluded (e.g. this site itself).
            const filteredLinks = links.filter(link =>
                !DYNAMIC_PROJECT_EXCLUDED_NAMES.includes(link.name) &&
                !existingProjectNames.includes(link.name)
            );
            if (!filteredLinks.length) return;
            container.innerHTML = filteredLinks.map(insertLinkProject).join('');
            loadLinkThumbnails(container);
            section.hidden = false;
            if (navItem) navItem.hidden = false;
        })
        .catch(error => console.warn('Error fetching dynamic project links:', error));
}